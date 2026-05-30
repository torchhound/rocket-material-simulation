// This module is the single source of truth for the analytical rocket material
// comparison.  The formulas are intentionally simple, visible, and unit-labeled
// so the generated report and tests can be audited without hidden spreadsheet
// logic or duplicated constants.

export const GRAVITY_MPS2 = 9.80665;
export const AIR_DENSITY_KG_M3 = 1.225;

// The user-specified rocket body dimensions are fixed inputs.  The fin, nose,
// and motor-mount dimensions are explicit assumptions because they were not
// provided; the report calls these out as limitations rather than measured
// design data.
export const ROCKET_SPEC = Object.freeze({
  body: Object.freeze({
    lengthMm: 400,
    outerDiameterMm: 60,
    wallThicknessMm: 2
  }),
  fins: Object.freeze({
    count: 3,
    rootChordMm: 90,
    tipChordMm: 45,
    spanMm: 38,
    thicknessMm: 3,
    sweepMm: 22,
    rootFilletRadiusMm: 4
  }),
  noseCone: Object.freeze({
    lengthMm: 90,
    wallThicknessMm: 2,
    assumedCrushLoadN: 60
  }),
  motorMount: Object.freeze({
    outerDiameterMm: 29,
    innerDiameterMm: 24,
    lengthMm: 80
  })
});

// Bambu calls the common default profile "0.20 mm Standard"; it is stated as an
// assumption here because the prompt asked us to assume the default layer height.
export const PRINT_ASSUMPTIONS = Object.freeze({
  orientation: 'Vertical print with tail on build plate',
  infillPercent: 20,
  nozzleDiameterMm: 0.4,
  layerHeightMm: 0.2,
  layerHeightLabel: '0.20 mm Standard',
  specimenCaveat:
    'Supplier specimens were 100% infill and annealed/dried; this field print is knocked down for 20% infill, process variation, and interlayer-sensitive root loads.'
});

// The load envelope is deliberately conservative for a small model rocket, but
// it is still an assumed envelope.  A motor-specific design should replace these
// forces with measured thrust, recovery, and landing test data.
export const LOAD_ENVELOPE = Object.freeze({
  launch: Object.freeze({
    accelerationG: 25,
    minimumAxialCompressionN: 120
  }),
  aerodynamics: Object.freeze({
    velocityMps: 45,
    angleOfAttackDeg: 8,
    bodyNormalCoefficient: 1.1,
    finLiftCoefficient: 1.1,
    finDynamicAmplification: 4,
    finDeflectionLimitSpanFraction: 20
  }),
  parachute: Object.freeze({
    deploymentShockG: 80
  }),
  landing: Object.freeze({
    impactVelocityMps: 6,
    stoppingTimeS: 0.015
  }),
  buckling: Object.freeze({
    effectiveLengthFactor: 1,
    poissonRatio: 0.35,
    shellImperfectionFactor: 0.2
  }),
  thermal: Object.freeze({
    hotSoakC: 65,
    motorMountLocalC: 80,
    ambientReferenceC: 25
  }),
  nonStructuralMass: Object.freeze({
    motorG: 55,
    recoveryHardwareG: 45,
    avionicsAndAdhesiveG: 20
  })
});

// The factors below are not supplier data.  They document the conservative
// conversion from ideal TDS coupons to the requested 20% infill vertical FDM
// rocket.  Keeping the factors explicit makes the report reviewable.
export const FDM_KNOCKDOWNS = Object.freeze({
  strengthFor20PercentInfill: 0.65,
  stiffnessFor20PercentInfill: 0.85,
  unannealedFieldPrintStrength: 0.7,
  impactForFieldPrint: 0.7,
  finRootInterlayerPeel: 0.45,
  finRootShear: 0.6,
  massFillFactorBody: 0.65,
  massFillFactorFins: 0.75,
  massFillFactorNose: 0.55,
  massFillFactorMotorMount: 0.75
});

export const MATERIALS = Object.freeze({
  plaBasic: Object.freeze({
    key: 'plaBasic',
    displayName: 'Bambu PLA Basic',
    shortName: 'PLA Basic',
    sourceTitle: 'Bambu PLA Basic Technical Data Sheet V3.0',
    sourceUrl:
      'https://store.bblcdn.com/s7/default/b189de92249a4b9ebed28b8ea1f080f0/Bambu_PLA_Basic_Technical_Data_Sheet.pdf',
    densityGcm3: 1.24,
    glassTransitionC: 60,
    vicatC: 57,
    hdt18MPaC: 54,
    hdt045MPaC: 57,
    youngModulusXYMPa: 2580,
    youngModulusZMPa: 2060,
    tensileStrengthXYMPa: 35,
    tensileStrengthZMPa: 31,
    elongationXYPercent: 12.2,
    elongationZPercent: 7.5,
    bendingModulusXYMPa: 2750,
    bendingModulusZMPa: 2370,
    bendingStrengthXYMPa: 76,
    bendingStrengthZMPa: 59,
    impactXYUnnotchedKJm2: 26.6,
    impactXYNotchedKJm2: 7.9,
    impactZKJm2: 13.8,
    specimenNote: '100% infill, annealed/dried test specimens.'
  }),
  absGf: Object.freeze({
    key: 'absGf',
    displayName: 'Bambu ABS-GF',
    shortName: 'ABS-GF',
    sourceTitle: 'Bambu ABS-GF Technical Data Sheet V1.0',
    sourceUrl:
      'https://store.bblcdn.com/s6/default/0157db3ef0f044c095b6abf2b98a33d4/Bambu_ABS-GF_Technical_Data_Sheet.pdf',
    densityGcm3: 1.08,
    glassTransitionC: null,
    vicatC: 103,
    hdt18MPaC: 88,
    hdt045MPaC: 99,
    youngModulusXYMPa: 3160,
    youngModulusZMPa: 2250,
    tensileStrengthXYMPa: 36,
    tensileStrengthZMPa: 29,
    elongationXYPercent: 6.3,
    elongationZPercent: 2.3,
    bendingModulusXYMPa: 2860,
    bendingModulusZMPa: 1970,
    bendingStrengthXYMPa: 68,
    bendingStrengthZMPa: 46,
    impactXYUnnotchedKJm2: 14.5,
    impactXYNotchedKJm2: 4.2,
    impactZKJm2: 5.3,
    specimenNote: '100% infill, annealed/dried test specimens.'
  })
});

export function mmToM(valueMm) {
  return valueMm / 1000;
}

export function densityGcm3ToKgM3(valueGcm3) {
  return valueGcm3 * 1000;
}

export function degToRad(valueDeg) {
  return (valueDeg * Math.PI) / 180;
}

function round(value, digits = 3) {
  return Number(value.toFixed(digits));
}

function margin(allowable, demand) {
  if (demand === 0) {
    return Number.POSITIVE_INFINITY;
  }
  return allowable / demand;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Thin circular tube properties for a hollow cylinder.  These values drive the
// axial stress, bending stress, and body buckling calculations.
export function calculateTubeSection(bodySpec) {
  const outerRadiusM = mmToM(bodySpec.outerDiameterMm) / 2;
  const wallThicknessM = mmToM(bodySpec.wallThicknessMm);
  const innerRadiusM = outerRadiusM - wallThicknessM;
  const lengthM = mmToM(bodySpec.lengthMm);
  const crossSectionAreaM2 = Math.PI * (outerRadiusM ** 2 - innerRadiusM ** 2);
  const secondMomentAreaM4 = (Math.PI / 4) * (outerRadiusM ** 4 - innerRadiusM ** 4);

  return {
    outerRadiusM,
    innerRadiusM,
    meanRadiusM: (outerRadiusM + innerRadiusM) / 2,
    wallThicknessM,
    lengthM,
    crossSectionAreaM2,
    secondMomentAreaM4,
    sectionModulusM3: secondMomentAreaM4 / outerRadiusM,
    shellVolumeM3: crossSectionAreaM2 * lengthM,
    outerDiameterM: outerRadiusM * 2
  };
}

// The fins are modeled as trapezoidal cantilever plates.  The root section
// modulus treats the root as a rectangular strip because peel and bending at the
// body joint are the fin-critical loads for a vertical FDM print.
export function calculateFinGeometry(finSpec) {
  const rootChordM = mmToM(finSpec.rootChordMm);
  const tipChordM = mmToM(finSpec.tipChordMm);
  const spanM = mmToM(finSpec.spanMm);
  const thicknessM = mmToM(finSpec.thicknessMm);
  const averageChordM = (rootChordM + tipChordM) / 2;

  return {
    count: finSpec.count,
    rootChordM,
    tipChordM,
    averageChordM,
    spanM,
    thicknessM,
    planformAreaM2: averageChordM * spanM,
    rootBondAreaM2: rootChordM * thicknessM,
    rootSectionModulusM3: (rootChordM * thicknessM ** 2) / 6,
    plateSecondMomentM4: (averageChordM * thicknessM ** 3) / 12,
    volumeEachM3: averageChordM * spanM * thicknessM
  };
}

export function axialStressMPa(forceN, areaM2) {
  return forceN / areaM2 / 1e6;
}

export function bendingStressMPa(momentNm, sectionModulusM3) {
  return momentNm / sectionModulusM3 / 1e6;
}

export function eulerBucklingLoadN({
  youngModulusMPa,
  secondMomentAreaM4,
  lengthM,
  effectiveLengthFactor
}) {
  const effectiveLengthM = effectiveLengthFactor * lengthM;
  return (Math.PI ** 2 * youngModulusMPa * 1e6 * secondMomentAreaM4) / effectiveLengthM ** 2;
}

// Classical axial shell buckling for a thin cylinder, reduced by an imperfection
// factor because printed shells include seams, layer texture, and geometric
// imperfections that ideal shell theory does not represent.
export function shellBucklingStressMPa({
  youngModulusMPa,
  wallThicknessM,
  meanRadiusM,
  poissonRatio,
  imperfectionFactor
}) {
  return (
    (0.605 * youngModulusMPa * (wallThicknessM / meanRadiusM) * imperfectionFactor) /
    Math.sqrt(1 - poissonRatio ** 2)
  );
}

export function dynamicPressurePa(velocityMps, airDensityKgM3 = AIR_DENSITY_KG_M3) {
  return 0.5 * airDensityKgM3 * velocityMps ** 2;
}

// Converts supplier coupon data into design properties for the requested print.
// Z-direction values are used for tube axial/bending strength because the rocket
// axis is vertical in the printer and layer interfaces are normal to that axis.
export function deriveEffectiveMaterial(material, printAssumptions = PRINT_ASSUMPTIONS) {
  const strengthFactor =
    FDM_KNOCKDOWNS.strengthFor20PercentInfill *
    FDM_KNOCKDOWNS.unannealedFieldPrintStrength;
  const stiffnessFactor = FDM_KNOCKDOWNS.stiffnessFor20PercentInfill;

  return {
    materialKey: material.key,
    displayName: material.displayName,
    printAssumptions,
    densityKgM3: densityGcm3ToKgM3(material.densityGcm3),
    tubeTensileStrengthMPa: material.tensileStrengthZMPa * strengthFactor,
    tubeCompressionStrengthMPa: material.tensileStrengthZMPa * strengthFactor,
    tubeBendingStrengthMPa: material.bendingStrengthZMPa * strengthFactor,
    tubeYoungModulusMPa: material.youngModulusZMPa * stiffnessFactor,
    finPlateYoungModulusMPa: material.bendingModulusXYMPa * stiffnessFactor,
    finRootBendingStrengthMPa:
      material.bendingStrengthZMPa * strengthFactor * FDM_KNOCKDOWNS.finRootInterlayerPeel,
    finRootPeelStrengthMPa:
      material.tensileStrengthZMPa * strengthFactor * FDM_KNOCKDOWNS.finRootInterlayerPeel,
    finRootShearStrengthMPa:
      material.tensileStrengthZMPa *
      strengthFactor *
      0.58 *
      FDM_KNOCKDOWNS.finRootShear,
    impactXYNotchedKJm2: material.impactXYNotchedKJm2 * FDM_KNOCKDOWNS.impactForFieldPrint,
    impactZKJm2: material.impactZKJm2 * FDM_KNOCKDOWNS.impactForFieldPrint,
    impactResistanceIndex:
      (material.impactXYNotchedKJm2 + material.impactZKJm2) *
      FDM_KNOCKDOWNS.impactForFieldPrint
  };
}

function calculateMassBreakdown(material, spec, section, finGeometry) {
  const densityKgM3 = densityGcm3ToKgM3(material.densityGcm3);
  const noseRadiusM = section.outerRadiusM;
  const noseLengthM = mmToM(spec.noseCone.lengthMm);
  const noseSlantM = Math.hypot(noseRadiusM, noseLengthM);
  const motorOuterRadiusM = mmToM(spec.motorMount.outerDiameterMm) / 2;
  const motorInnerRadiusM = mmToM(spec.motorMount.innerDiameterMm) / 2;
  const motorMountLengthM = mmToM(spec.motorMount.lengthMm);

  const bodyEffectiveVolumeM3 =
    section.shellVolumeM3 * FDM_KNOCKDOWNS.massFillFactorBody;
  const finsEffectiveVolumeM3 =
    finGeometry.volumeEachM3 * finGeometry.count * FDM_KNOCKDOWNS.massFillFactorFins;
  const noseEffectiveVolumeM3 =
    Math.PI *
    noseRadiusM *
    noseSlantM *
    mmToM(spec.noseCone.wallThicknessMm) *
    FDM_KNOCKDOWNS.massFillFactorNose;
  const motorMountEffectiveVolumeM3 =
    Math.PI *
    (motorOuterRadiusM ** 2 - motorInnerRadiusM ** 2) *
    motorMountLengthM *
    FDM_KNOCKDOWNS.massFillFactorMotorMount;

  const bodyG = bodyEffectiveVolumeM3 * densityKgM3 * 1000;
  const finsG = finsEffectiveVolumeM3 * densityKgM3 * 1000;
  const noseG = noseEffectiveVolumeM3 * densityKgM3 * 1000;
  const motorMountG = motorMountEffectiveVolumeM3 * densityKgM3 * 1000;
  const nonStructuralG =
    LOAD_ENVELOPE.nonStructuralMass.motorG +
    LOAD_ENVELOPE.nonStructuralMass.recoveryHardwareG +
    LOAD_ENVELOPE.nonStructuralMass.avionicsAndAdhesiveG;
  const structuralG = bodyG + finsG + noseG + motorMountG;

  return {
    bodyG,
    finsG,
    noseG,
    motorMountG,
    structuralG,
    nonStructuralG,
    totalG: structuralG + nonStructuralG,
    totalKg: (structuralG + nonStructuralG) / 1000,
    effectiveVolumesM3: {
      body: bodyEffectiveVolumeM3,
      fins: finsEffectiveVolumeM3,
      nose: noseEffectiveVolumeM3,
      motorMount: motorMountEffectiveVolumeM3
    }
  };
}

function bodyAerodynamicLoad(spec, envelope) {
  const qPa = dynamicPressurePa(envelope.aerodynamics.velocityMps);
  const angleRad = degToRad(envelope.aerodynamics.angleOfAttackDeg);
  const projectedAreaM2 = mmToM(spec.body.lengthMm) * mmToM(spec.body.outerDiameterMm);
  const sideForceN =
    qPa *
    projectedAreaM2 *
    Math.sin(angleRad) *
    envelope.aerodynamics.bodyNormalCoefficient;

  return {
    dynamicPressurePa: qPa,
    projectedAreaM2,
    sideForceN,
    bendingMomentNm: sideForceN * (mmToM(spec.body.lengthMm) / 2)
  };
}

function finAerodynamicLoad(finGeometry, envelope) {
  const qPa = dynamicPressurePa(envelope.aerodynamics.velocityMps);
  const forceN =
    qPa *
    finGeometry.planformAreaM2 *
    envelope.aerodynamics.finLiftCoefficient *
    envelope.aerodynamics.finDynamicAmplification;

  return {
    dynamicPressurePa: qPa,
    forceN,
    rootMomentNm: forceN * finGeometry.spanM
  };
}

function qualitativePrintability(material) {
  if (material.key === 'plaBasic') {
    return {
      score: 9,
      assessment:
        'Easy to print, low warp risk, and forgiving on open printers; thermal limits remain the major flight risk.'
    };
  }

  return {
    score: 5,
    assessment:
      'Requires a hotter enclosed process, careful drying, and dimensional tuning; glass fiber helps stiffness but does not remove ABS warp risk.'
  };
}

function qualitativeMoistureAndStability(material) {
  if (material.key === 'plaBasic') {
    return {
      score: 6,
      assessment:
        'Generally dimensionally calm after printing, but long warm storage can combine moisture exposure, creep, and low heat deflection into shape drift.'
    };
  }

  return {
    score: 7,
    assessment:
      'Glass fiber improves dimensional stability, but dry filament and a stable enclosed print process are important for repeatable fit.'
    };
  }

function prosAndCons(material) {
  if (material.key === 'plaBasic') {
    return {
      pros: [
        'Higher supplied Z impact value and higher Z flexural strength than ABS-GF.',
        'Much easier printability for a tall vertical rocket body.',
        'Better elongation, making fin roots less brittle in shock events.'
      ],
      cons: [
        'Vicat and HDT values sit below a 65 deg C hot-soak assumption.',
        'Higher density increases total mass and recovery shock load.',
        'Creep and thermal softening are credible risks in sun, cars, and near the motor mount.'
      ]
    };
  }

  return {
    pros: [
      'Large thermal margin from Vicat and HDT values.',
      'Lower density reduces mass, parachute shock force, and landing impulse.',
      'Higher effective tube modulus and fin plate stiffness proxy.'
    ],
    cons: [
      'Lower Z impact and elongation make fins more brittle under deployment and landing damage.',
      'Lower Z flexural strength after root knockdowns reduces fin-root bending margin.',
      'Harder print process with enclosure, drying, and warp-control requirements.'
    ]
  };
}

function makeLoadCase({
  name,
  demand,
  allowable,
  marginValue,
  unit,
  formula,
  interpretation,
  ...extra
}) {
  return {
    name,
    demand,
    allowable,
    unit,
    margin: marginValue,
    formula,
    interpretation,
    ...extra
  };
}

function evaluateMaterial(material, spec, envelope, printAssumptions) {
  const section = calculateTubeSection(spec.body);
  const fin = calculateFinGeometry(spec.fins);
  const effective = deriveEffectiveMaterial(material, printAssumptions);
  const mass = calculateMassBreakdown(material, spec, section, fin);
  const bodyAero = bodyAerodynamicLoad(spec, envelope);
  const finAero = finAerodynamicLoad(fin, envelope);

  const launchAxialForceN = Math.max(
    envelope.launch.minimumAxialCompressionN,
    mass.totalKg * envelope.launch.accelerationG * GRAVITY_MPS2
  );
  const launchAxialStressMPa = axialStressMPa(launchAxialForceN, section.crossSectionAreaM2);
  const bodyBendingStressMPa = bendingStressMPa(
    bodyAero.bendingMomentNm,
    section.sectionModulusM3
  );
  const combinedBodyStressMPa = launchAxialStressMPa + bodyBendingStressMPa;

  const parachuteForceN = mass.totalKg * envelope.parachute.deploymentShockG * GRAVITY_MPS2;
  const parachuteStressMPa = axialStressMPa(parachuteForceN, section.crossSectionAreaM2);
  const landingForceN = (mass.totalKg * envelope.landing.impactVelocityMps) / envelope.landing.stoppingTimeS;
  const landingStressMPa = axialStressMPa(landingForceN, section.crossSectionAreaM2);
  const eulerLoadN = eulerBucklingLoadN({
    youngModulusMPa: effective.tubeYoungModulusMPa,
    secondMomentAreaM4: section.secondMomentAreaM4,
    lengthM: section.lengthM,
    effectiveLengthFactor: envelope.buckling.effectiveLengthFactor
  });
  const shellStressMPa = shellBucklingStressMPa({
    youngModulusMPa: effective.tubeYoungModulusMPa,
    wallThicknessM: section.wallThicknessM,
    meanRadiusM: section.meanRadiusM,
    poissonRatio: envelope.buckling.poissonRatio,
    imperfectionFactor: envelope.buckling.shellImperfectionFactor
  });
  const shellLoadN = shellStressMPa * 1e6 * section.crossSectionAreaM2;

  const finRootBendingStressMPa = bendingStressMPa(
    finAero.rootMomentNm,
    fin.rootSectionModulusM3
  );
  const finRootPeelStressMPa =
    finAero.rootMomentNm / (fin.rootBondAreaM2 * (fin.thicknessM / 2)) / 1e6;
  const finRootShearStressMPa = finAero.forceN / fin.rootBondAreaM2 / 1e6;
  const finTipDeflectionM =
    (finAero.forceN * fin.spanM ** 3) /
    (3 * effective.finPlateYoungModulusMPa * 1e6 * fin.plateSecondMomentM4);
  const finDeflectionLimitM =
    fin.spanM / envelope.aerodynamics.finDeflectionLimitSpanFraction;

  const thermalMarginC = material.vicatC - envelope.thermal.hotSoakC;
  const creepTemperatureMarginC = material.hdt045MPaC - envelope.thermal.hotSoakC;
  const motorMountTemperatureMarginC = material.vicatC - envelope.thermal.motorMountLocalC;
  const noseStressMPa = axialStressMPa(spec.noseCone.assumedCrushLoadN, section.crossSectionAreaM2);
  const printability = qualitativePrintability(material);
  const moisture = qualitativeMoistureAndStability(material);

  const loadCases = {
    launchCompression: makeLoadCase({
      name: 'Launch acceleration/compression',
      demand: round(launchAxialStressMPa),
      allowable: round(effective.tubeCompressionStrengthMPa),
      unit: 'MPa',
      marginValue: round(margin(effective.tubeCompressionStrengthMPa, launchAxialStressMPa), 2),
      formula: 'sigma = F / A',
      interpretation:
        'Global tube compression from launch acceleration and minimum thrust-envelope compression.'
    }),
    aerodynamicBending: makeLoadCase({
      name: 'Aerodynamic bending',
      demand: round(bodyBendingStressMPa),
      allowable: round(effective.tubeBendingStrengthMPa),
      unit: 'MPa',
      marginValue: round(margin(effective.tubeBendingStrengthMPa, bodyBendingStressMPa), 2),
      formula: 'sigma = M / Z',
      interpretation:
        'Body bending from a side-load proxy at 45 m/s and 8 deg angle of attack.',
      sideForceN: round(bodyAero.sideForceN, 2),
      bendingMomentNm: round(bodyAero.bendingMomentNm, 2)
    }),
    combinedLaunchAndBending: makeLoadCase({
      name: 'Combined launch compression and bending',
      demand: round(combinedBodyStressMPa),
      allowable: round(Math.min(effective.tubeCompressionStrengthMPa, effective.tubeBendingStrengthMPa)),
      unit: 'MPa',
      marginValue: round(
        margin(
          Math.min(effective.tubeCompressionStrengthMPa, effective.tubeBendingStrengthMPa),
          combinedBodyStressMPa
        ),
        2
      ),
      formula: 'sigma_total = F / A + M / Z',
      interpretation: 'Conservative linear stress addition for simultaneous launch and bending.'
    }),
    parachuteDeploymentShock: makeLoadCase({
      name: 'Parachute deployment shock',
      demand: round(parachuteStressMPa),
      allowable: round(effective.tubeTensileStrengthMPa),
      unit: 'MPa',
      marginValue: round(margin(effective.tubeTensileStrengthMPa, parachuteStressMPa), 2),
      formula: 'F = m a, sigma = F / A',
      interpretation:
        'Global recovery shock stress at the 80 g assumed deployment event; local eyelets still need testing.',
      forceN: round(parachuteForceN, 1)
    }),
    landingImpact: makeLoadCase({
      name: 'Landing impact',
      demand: round(landingStressMPa),
      allowable: round(effective.tubeCompressionStrengthMPa),
      unit: 'MPa',
      marginValue: round(margin(effective.tubeCompressionStrengthMPa, landingStressMPa), 2),
      formula: 'F = m delta-v / delta-t',
      interpretation:
        'Impulse proxy for a 6 m/s landing arrested over 0.015 s; brittle cracking risk is represented separately by impact data.',
      forceN: round(landingForceN, 1),
      impactResistanceIndex: round(effective.impactResistanceIndex, 2)
    }),
    bodyTubeEulerBuckling: makeLoadCase({
      name: 'Body tube Euler buckling',
      demand: round(launchAxialForceN, 1),
      allowable: round(eulerLoadN, 1),
      unit: 'N',
      marginValue: round(margin(eulerLoadN, launchAxialForceN), 2),
      formula: 'Pcr = pi^2 E I / (K L)^2',
      interpretation:
        'Column buckling of the full 400 mm tube with a pinned-pinned effective length factor.'
    }),
    bodyTubeShellBuckling: makeLoadCase({
      name: 'Body tube shell buckling',
      demand: round(launchAxialForceN, 1),
      allowable: round(shellLoadN, 1),
      unit: 'N',
      marginValue: round(margin(shellLoadN, launchAxialForceN), 2),
      formula: 'sigma_cr = 0.605 E (t/r) / sqrt(1 - nu^2), then imperfection knockdown',
      interpretation:
        'Thin-shell axial buckling reduced by a 0.20 imperfection factor for printed geometry.',
      criticalStressMPa: round(shellStressMPa, 2)
    }),
    finRootBending: makeLoadCase({
      name: 'Fin root bending',
      demand: round(finRootBendingStressMPa),
      allowable: round(effective.finRootBendingStrengthMPa),
      unit: 'MPa',
      marginValue: round(margin(effective.finRootBendingStrengthMPa, finRootBendingStressMPa), 2),
      formula: 'sigma = M / S_root',
      interpretation:
        'Most fin-critical structural check: aerodynamic side load bends the root through the printed joint.',
      forceN: round(finAero.forceN, 2),
      rootMomentNm: round(finAero.rootMomentNm, 3)
    }),
    finRootPeel: makeLoadCase({
      name: 'Fin root peel',
      demand: round(finRootPeelStressMPa),
      allowable: round(effective.finRootPeelStrengthMPa),
      unit: 'MPa',
      marginValue: round(margin(effective.finRootPeelStrengthMPa, finRootPeelStressMPa), 2),
      formula: 'sigma_peel = M / (A_root * t/2)',
      interpretation:
        'Peel proxy for layer-sensitive separation at the fin-body junction; fillets and continuous skins matter.'
    }),
    finRootShear: makeLoadCase({
      name: 'Fin root shear',
      demand: round(finRootShearStressMPa, 3),
      allowable: round(effective.finRootShearStrengthMPa),
      unit: 'MPa',
      marginValue: round(margin(effective.finRootShearStrengthMPa, finRootShearStressMPa), 2),
      formula: 'tau = F / A_root',
      interpretation:
        'Average root shear.  This is less controlling than peel and bending for the assumed fin.'
    }),
    finStiffnessFlutterProxy: makeLoadCase({
      name: 'Fin stiffness/flutter proxy',
      demand: round(finTipDeflectionM * 1000, 3),
      allowable: round(finDeflectionLimitM * 1000, 3),
      unit: 'mm tip deflection',
      marginValue: round(margin(finDeflectionLimitM, finTipDeflectionM), 2),
      formula: 'delta = F L^3 / (3 E I)',
      interpretation:
        'Static stiffness proxy only; true flutter requires aeroelastic testing or a dedicated flutter model.',
      stiffnessNPerM: round(finAero.forceN / finTipDeflectionM, 1),
      dynamicPressurePa: round(finAero.dynamicPressurePa, 1)
    }),
    thermalSoftening: makeLoadCase({
      name: 'Thermal softening',
      demand: envelope.thermal.hotSoakC,
      allowable: material.vicatC,
      unit: 'deg C',
      marginValue: thermalMarginC,
      formula: 'temperature margin = Vicat - hot-soak temperature',
      interpretation:
        'Hot car or direct sun storage check; negative values mean the material is above the supplied Vicat value.',
      temperatureMarginC: thermalMarginC,
      hdt045MPaC: material.hdt045MPaC,
      hdt18MPaC: material.hdt18MPaC
    }),
    creep: makeLoadCase({
      name: 'Creep risk',
      demand: envelope.thermal.hotSoakC,
      allowable: material.hdt045MPaC,
      unit: 'deg C',
      marginValue: creepTemperatureMarginC,
      formula: 'temperature margin = HDT at 0.45 MPa - hot-soak temperature',
      interpretation:
        'Longer duration warm loading risk, especially for rail buttons, fin roots, and recovery attachment areas.',
      temperatureMarginC: creepTemperatureMarginC
    }),
    printability: makeLoadCase({
      name: 'Printability',
      demand: null,
      allowable: null,
      unit: 'qualitative score',
      marginValue: null,
      formula: 'process risk score from 1 to 10',
      interpretation: printability.assessment,
      score: printability.score
    }),
    moistureDimensionalStability: makeLoadCase({
      name: 'Moisture/dimensional stability',
      demand: null,
      allowable: null,
      unit: 'qualitative score',
      marginValue: null,
      formula: 'qualitative risk score from 1 to 10',
      interpretation: moisture.assessment,
      score: moisture.score
    }),
    noseCone: makeLoadCase({
      name: 'Nose cone',
      demand: round(noseStressMPa),
      allowable: round(effective.tubeCompressionStrengthMPa),
      unit: 'MPa',
      marginValue: round(margin(effective.tubeCompressionStrengthMPa, noseStressMPa), 2),
      formula: 'sigma = F_crush / A_body',
      interpretation:
        'Less critical than fins and tube for this envelope; heat and landing damage are bigger material differentiators than static crush.'
    }),
    motorMount: makeLoadCase({
      name: 'Motor mount',
      demand: envelope.thermal.motorMountLocalC,
      allowable: material.vicatC,
      unit: 'deg C',
      marginValue: motorMountTemperatureMarginC,
      formula: 'temperature margin = Vicat - assumed local motor-mount temperature',
      interpretation:
        'Thermal check near the motor tube; actual safety depends on motor class, liner, dwell time, and insulation.',
      temperatureMarginC: motorMountTemperatureMarginC
    })
  };

  const structuralMargins = [
    loadCases.launchCompression.margin,
    loadCases.aerodynamicBending.margin,
    loadCases.combinedLaunchAndBending.margin,
    loadCases.parachuteDeploymentShock.margin,
    loadCases.landingImpact.margin,
    loadCases.bodyTubeEulerBuckling.margin,
    loadCases.bodyTubeShellBuckling.margin,
    loadCases.finRootBending.margin,
    loadCases.finRootPeel.margin,
    loadCases.finRootShear.margin,
    loadCases.finStiffnessFlutterProxy.margin,
    loadCases.noseCone.margin
  ];

  const materialNotes = prosAndCons(material);

  return {
    material,
    effective,
    mass,
    section,
    fin,
    bodyAero,
    finAero,
    loadCases,
    minimumStructuralMargin: Math.min(...structuralMargins),
    pros: materialNotes.pros,
    cons: materialNotes.cons
  };
}

function scoreResults(results) {
  const impactMax = Math.max(
    ...results.map((result) => result.effective.impactResistanceIndex)
  );
  const massMin = Math.min(...results.map((result) => result.mass.totalG));
  const massMax = Math.max(...results.map((result) => result.mass.totalG));
  const massRange = Math.max(massMax - massMin, 1);

  return results
    .map((result) => {
      const structuralScore = clamp(result.minimumStructuralMargin / 5, 0, 1) * 25;
      const thermalScore =
        clamp(result.loadCases.thermalSoftening.temperatureMarginC / 40, -1, 1) * 25;
      const motorThermalScore =
        clamp(result.loadCases.motorMount.temperatureMarginC / 40, -1, 1) * 15;
      const creepScore = clamp(result.loadCases.creep.temperatureMarginC / 40, -1, 1) * 10;
      const toughnessScore =
        (result.effective.impactResistanceIndex / impactMax) * 15;
      const printabilityScore = result.loadCases.printability.score;
      const massScore = ((massMax - result.mass.totalG) / massRange) * 10;
      const finPenalty =
        result.loadCases.finRootPeel.margin < 5 || result.loadCases.finRootBending.margin < 5
          ? -5
          : 0;
      const score =
        structuralScore +
        thermalScore +
        motorThermalScore +
        creepScore +
        toughnessScore +
        printabilityScore +
        massScore +
        finPenalty;

      return {
        materialKey: result.material.key,
        materialName: result.material.displayName,
        score: round(score, 1),
        why:
          result.material.key === 'absGf'
            ? 'Ranked first because thermal and motor-mount margins dominate final flight-article risk, despite lower fin-root toughness.'
            : 'Ranked second because it is tougher and easier to print, but thermal softening and creep margins are negative in the hot-soak envelope.'
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function evaluateRocketMaterials({
  spec = ROCKET_SPEC,
  materials = MATERIALS,
  printAssumptions = PRINT_ASSUMPTIONS,
  loadEnvelope = LOAD_ENVELOPE
} = {}) {
  const materialResults = Object.fromEntries(
    Object.entries(materials).map(([key, material]) => [
      key,
      evaluateMaterial(material, spec, loadEnvelope, printAssumptions)
    ])
  );
  const resultList = Object.values(materialResults);

  return {
    generatedAt: new Date().toISOString(),
    spec,
    printAssumptions,
    loadEnvelope,
    knockdowns: FDM_KNOCKDOWNS,
    materials: materialResults,
    ranking: scoreResults(resultList),
    recommendation:
      'Use ABS-GF for the final flight article when thermal exposure is credible and the printer can produce a warp-free enclosed ABS-GF part. Use PLA Basic for prototypes, cool-weather low-risk flights, and fit checks; reinforce or redesign fins before relying on either material without ground validation.',
    limitations: [
      'This is a static analytical comparison, not FEA.',
      'No motor-specific thrust curve, measured recovery shock, or measured landing acceleration was supplied.',
      'Fin geometry is assumed and should be replaced with the actual CAD dimensions.',
      'Loads use conservative static approximations rather than coupled flight dynamics.',
      'FDM strength depends on drying, enclosure temperature, wall count, seam placement, cooling, and actual slicer settings.',
      'Real validation with coupons, bend tests, deployment tests, and post-flight inspection is still required.'
    ]
  };
}
