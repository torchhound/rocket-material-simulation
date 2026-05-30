import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LOAD_ENVELOPE,
  MATERIALS,
  PRINT_ASSUMPTIONS,
  ROCKET_SPEC,
  axialStressMPa,
  bendingStressMPa,
  calculateFinGeometry,
  calculateTubeSection,
  deriveEffectiveMaterial,
  eulerBucklingLoadN,
  evaluateRocketMaterials,
  shellBucklingStressMPa
} from '../src/simulation.js';

const closeTo = (actual, expected, relativeTolerance = 1e-6) => {
  const tolerance = Math.max(Math.abs(expected) * relativeTolerance, relativeTolerance);
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`
  );
};

test('tube section properties use the specified 60 mm OD, 2 mm wall, and 400 mm length', () => {
  const section = calculateTubeSection(ROCKET_SPEC.body);

  closeTo(section.outerRadiusM, 0.03);
  closeTo(section.innerRadiusM, 0.028);
  closeTo(section.wallThicknessM, 0.002);
  closeTo(section.lengthM, 0.4);
  closeTo(section.crossSectionAreaM2, Math.PI * (0.03 ** 2 - 0.028 ** 2));
  closeTo(section.secondMomentAreaM4, (Math.PI / 4) * (0.03 ** 4 - 0.028 ** 4));
  closeTo(section.sectionModulusM3, section.secondMomentAreaM4 / 0.03);
  closeTo(section.shellVolumeM3, section.crossSectionAreaM2 * 0.4);
});

test('core stress and buckling formulas preserve units and expected engineering relationships', () => {
  const section = calculateTubeSection(ROCKET_SPEC.body);

  closeTo(axialStressMPa(120, section.crossSectionAreaM2), 120 / section.crossSectionAreaM2 / 1e6);
  closeTo(bendingStressMPa(5, section.sectionModulusM3), 5 / section.sectionModulusM3 / 1e6);

  closeTo(
    eulerBucklingLoadN({
      youngModulusMPa: 2000,
      secondMomentAreaM4: section.secondMomentAreaM4,
      lengthM: 0.4,
      effectiveLengthFactor: 1
    }),
    (Math.PI ** 2 * 2000e6 * section.secondMomentAreaM4) / 0.4 ** 2
  );

  closeTo(
    shellBucklingStressMPa({
      youngModulusMPa: 2000,
      wallThicknessM: section.wallThicknessM,
      meanRadiusM: section.meanRadiusM,
      poissonRatio: 0.35,
      imperfectionFactor: 0.2
    }),
    (0.605 * 2000 * (section.wallThicknessM / section.meanRadiusM) * 0.2) /
      Math.sqrt(1 - 0.35 ** 2)
  );
});

test('material knockdowns reflect vertical FDM, 20 percent infill, and lab-specimen caveats', () => {
  const pla = deriveEffectiveMaterial(MATERIALS.plaBasic, PRINT_ASSUMPTIONS);
  const absGf = deriveEffectiveMaterial(MATERIALS.absGf, PRINT_ASSUMPTIONS);

  closeTo(pla.tubeBendingStrengthMPa, 59 * 0.65 * 0.7);
  closeTo(absGf.tubeBendingStrengthMPa, 46 * 0.65 * 0.7);
  closeTo(pla.finRootPeelStrengthMPa, 31 * 0.65 * 0.7 * 0.45);
  closeTo(absGf.finRootPeelStrengthMPa, 29 * 0.65 * 0.7 * 0.45);

  assert.equal(PRINT_ASSUMPTIONS.layerHeightMm, 0.2);
  assert.equal(PRINT_ASSUMPTIONS.infillPercent, 20);
  assert.ok(absGf.tubeYoungModulusMPa > pla.tubeYoungModulusMPa);
  assert.ok(pla.finRootPeelStrengthMPa > absGf.finRootPeelStrengthMPa);
});

test('fin geometry gives enough analytical detail for root and stiffness comparisons', () => {
  const fin = calculateFinGeometry(ROCKET_SPEC.fins);

  closeTo(fin.planformAreaM2, ((0.09 + 0.045) / 2) * 0.038);
  closeTo(fin.rootBondAreaM2, 0.09 * 0.003);
  closeTo(fin.rootSectionModulusM3, (0.09 * 0.003 ** 2) / 6);
  closeTo(fin.plateSecondMomentM4, (0.0675 * 0.003 ** 3) / 12);
  assert.equal(fin.count, 3);
});

test('complete rocket evaluation covers required load cases and ranks ABS-GF for final flight article use', () => {
  const analysis = evaluateRocketMaterials();
  const pla = analysis.materials.plaBasic;
  const absGf = analysis.materials.absGf;

  const requiredCases = [
    'launchCompression',
    'aerodynamicBending',
    'combinedLaunchAndBending',
    'parachuteDeploymentShock',
    'landingImpact',
    'bodyTubeEulerBuckling',
    'bodyTubeShellBuckling',
    'finRootBending',
    'finRootPeel',
    'finRootShear',
    'finStiffnessFlutterProxy',
    'thermalSoftening',
    'creep',
    'printability',
    'moistureDimensionalStability',
    'noseCone',
    'motorMount'
  ];

  for (const loadCase of requiredCases) {
    assert.ok(pla.loadCases[loadCase], `PLA missing ${loadCase}`);
    assert.ok(absGf.loadCases[loadCase], `ABS-GF missing ${loadCase}`);
  }

  for (const materialResult of [pla, absGf]) {
    for (const loadCase of Object.values(materialResult.loadCases)) {
      if ('margin' in loadCase && loadCase.margin !== null) {
        assert.ok(Number.isFinite(loadCase.margin), `${loadCase.name} margin must be finite`);
      }
    }
  }

  assert.ok(absGf.mass.totalG < pla.mass.totalG, 'ABS-GF should be lighter from lower density');
  assert.ok(pla.loadCases.finRootPeel.margin > absGf.loadCases.finRootPeel.margin);
  assert.ok(
    absGf.loadCases.finStiffnessFlutterProxy.stiffnessNPerM >
      pla.loadCases.finStiffnessFlutterProxy.stiffnessNPerM
  );
  assert.ok(pla.loadCases.thermalSoftening.temperatureMarginC < 0);
  assert.ok(absGf.loadCases.thermalSoftening.temperatureMarginC > 20);
  assert.equal(analysis.ranking[0].materialKey, 'absGf');
  assert.match(analysis.ranking[0].why, /thermal/i);
  assert.equal(LOAD_ENVELOPE.thermal.hotSoakC, 65);
});
