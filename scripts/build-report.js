// Static report renderer.  This file formats the simulation output into one
// self-contained HTML document; it does not contain independent engineering
// calculations, so the tests and report stay tied to src/simulation.js.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  LOAD_ENVELOPE,
  MATERIALS,
  PRINT_ASSUMPTIONS,
  ROCKET_SPEC,
  evaluateRocketMaterials
} from '../src/simulation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DEFAULT_REPORT_PATH = resolve(
  __dirname,
  '../report/rocket-material-strength-report.html'
);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fmt(value, digits = 2) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  if (!Number.isFinite(value)) {
    return String(value);
  }
  return Number(value).toLocaleString('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  });
}

function signed(value, digits = 1) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${fmt(value, digits)}`;
}

function percentBar(value, maxValue) {
  if (value === null || value === undefined) {
    return 0;
  }
  return Math.max(0, Math.min(100, (value / maxValue) * 100));
}

function marginClass(value) {
  if (value === null || value === undefined) {
    return 'neutral';
  }
  if (value < 0) {
    return 'bad';
  }
  if (value < 2) {
    return 'warn';
  }
  return 'good';
}

function caseRows(analysis, caseKeys) {
  return caseKeys
    .map((key) => {
      const plaCase = analysis.materials.plaBasic.loadCases[key];
      const absCase = analysis.materials.absGf.loadCases[key];
      return `<tr>
        <th scope="row">${escapeHtml(plaCase.name)}</th>
        <td>${escapeHtml(plaCase.formula)}</td>
        <td>${fmt(plaCase.demand)} ${escapeHtml(plaCase.unit)}</td>
        <td><span class="pill ${marginClass(plaCase.margin)}">${fmt(plaCase.margin)}</span></td>
        <td>${fmt(absCase.demand)} ${escapeHtml(absCase.unit)}</td>
        <td><span class="pill ${marginClass(absCase.margin)}">${fmt(absCase.margin)}</span></td>
      </tr>`;
    })
    .join('\n');
}

function materialSummaryCard(result, rank) {
  const thermal = result.loadCases.thermalSoftening.temperatureMarginC;
  const motor = result.loadCases.motorMount.temperatureMarginC;

  return `<article class="summary-card">
    <div class="card-title-row">
      <h3>${escapeHtml(result.material.displayName)}</h3>
      <span class="rank">Rank ${rank.rank}</span>
    </div>
    <dl class="metrics">
      <div><dt>Score</dt><dd>${fmt(rank.score, 1)}</dd></div>
      <div><dt>Total mass</dt><dd>${fmt(result.mass.totalG, 1)} g</dd></div>
      <div><dt>Minimum structural margin</dt><dd>${fmt(result.minimumStructuralMargin, 2)}x</dd></div>
      <div><dt>Hot-soak margin</dt><dd class="${marginClass(thermal)}">${signed(thermal, 0)} deg C</dd></div>
      <div><dt>Motor-mount thermal margin</dt><dd class="${marginClass(motor)}">${signed(motor, 0)} deg C</dd></div>
    </dl>
    <p>${escapeHtml(rank.why)}</p>
  </article>`;
}

function prosCons(result) {
  return `<section class="pros-cons-block">
    <h3>${escapeHtml(result.material.displayName)}</h3>
    <div class="two-col compact">
      <div>
        <h4>Pros</h4>
        <ul>${result.pros.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div>
        <h4>Cons</h4>
        <ul>${result.cons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
    </div>
  </section>`;
}

function marginBars(analysis) {
  const keys = [
    'combinedLaunchAndBending',
    'parachuteDeploymentShock',
    'landingImpact',
    'bodyTubeShellBuckling',
    'finRootBending',
    'finRootPeel',
    'finStiffnessFlutterProxy'
  ];
  const maxMargin = Math.max(
    ...keys.flatMap((key) => [
      analysis.materials.plaBasic.loadCases[key].margin,
      analysis.materials.absGf.loadCases[key].margin
    ])
  );
  const chartMax = Math.min(Math.max(maxMargin, 10), 50);

  return keys
    .map((key) => {
      const pla = analysis.materials.plaBasic.loadCases[key];
      const abs = analysis.materials.absGf.loadCases[key];
      return `<div class="bar-row">
        <div class="bar-label">${escapeHtml(pla.name)}</div>
        <div class="bar-set" aria-label="${escapeHtml(pla.name)} margins">
          <span class="bar-name">PLA</span>
          <span class="bar-track"><span class="bar pla" style="width:${percentBar(
            pla.margin,
            chartMax
          )}%"></span></span>
          <span class="bar-value">${fmt(pla.margin, 2)}x</span>
          <span class="bar-name">ABS-GF</span>
          <span class="bar-track"><span class="bar abs" style="width:${percentBar(
            abs.margin,
            chartMax
          )}%"></span></span>
          <span class="bar-value">${fmt(abs.margin, 2)}x</span>
        </div>
      </div>`;
    })
    .join('\n');
}

function sourceRows() {
  return Object.values(MATERIALS)
    .map(
      (material) => `<tr>
        <th scope="row">${escapeHtml(material.displayName)}</th>
        <td><a href="${escapeHtml(material.sourceUrl)}">${escapeHtml(material.sourceTitle)}</a></td>
        <td>${escapeHtml(material.specimenNote)}</td>
      </tr>`
    )
    .join('\n');
}

function materialDataRows() {
  const rows = [
    ['Density, g/cm^3', 'densityGcm3'],
    ['Vicat, deg C', 'vicatC'],
    ['HDT at 1.8 MPa, deg C', 'hdt18MPaC'],
    ['HDT at 0.45 MPa, deg C', 'hdt045MPaC'],
    ['Young modulus XY, MPa', 'youngModulusXYMPa'],
    ['Young modulus Z, MPa', 'youngModulusZMPa'],
    ['Tensile strength XY, MPa', 'tensileStrengthXYMPa'],
    ['Tensile strength Z, MPa', 'tensileStrengthZMPa'],
    ['Elongation XY, %', 'elongationXYPercent'],
    ['Elongation Z, %', 'elongationZPercent'],
    ['Bending modulus XY, MPa', 'bendingModulusXYMPa'],
    ['Bending modulus Z, MPa', 'bendingModulusZMPa'],
    ['Bending strength XY, MPa', 'bendingStrengthXYMPa'],
    ['Bending strength Z, MPa', 'bendingStrengthZMPa'],
    ['Impact XY unnotched, kJ/m^2', 'impactXYUnnotchedKJm2'],
    ['Impact XY notched, kJ/m^2', 'impactXYNotchedKJm2'],
    ['Impact Z, kJ/m^2', 'impactZKJm2']
  ];

  return rows
    .map(
      ([label, key]) => `<tr>
        <th scope="row">${escapeHtml(label)}</th>
        <td>${fmt(MATERIALS.plaBasic[key], 2)}</td>
        <td>${fmt(MATERIALS.absGf[key], 2)}</td>
      </tr>`
    )
    .join('\n');
}

function geometrySchematic() {
  return `<svg class="schematic" viewBox="0 0 640 190" role="img" aria-labelledby="schematic-title schematic-desc">
    <title id="schematic-title">Assumed rocket geometry schematic</title>
    <desc id="schematic-desc">Side-view schematic of a 400 mm body, 60 mm outer diameter, and three assumed fins.</desc>
    <defs>
      <linearGradient id="bodyGradient" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#eef2f0"/>
        <stop offset="1" stop-color="#c9d8d1"/>
      </linearGradient>
    </defs>
    <path d="M110 95 L170 55 H505 A30 30 0 0 1 505 135 H170 Z" fill="url(#bodyGradient)" stroke="#32413b" stroke-width="2"/>
    <path d="M110 95 L170 55 V135 Z" fill="#e9f0ec" stroke="#32413b" stroke-width="2"/>
    <path d="M450 135 L540 165 L495 135 Z" fill="#cde7f2" stroke="#245064" stroke-width="2"/>
    <path d="M450 55 L540 25 L495 55 Z" fill="#cde7f2" stroke="#245064" stroke-width="2"/>
    <line x1="170" y1="160" x2="505" y2="160" stroke="#53625c" stroke-width="2"/>
    <line x1="170" y1="154" x2="170" y2="166" stroke="#53625c" stroke-width="2"/>
    <line x1="505" y1="154" x2="505" y2="166" stroke="#53625c" stroke-width="2"/>
    <text x="337" y="181" text-anchor="middle">400 mm body length</text>
    <line x1="525" y1="65" x2="525" y2="125" stroke="#53625c" stroke-width="2"/>
    <line x1="519" y1="65" x2="531" y2="65" stroke="#53625c" stroke-width="2"/>
    <line x1="519" y1="125" x2="531" y2="125" stroke="#53625c" stroke-width="2"/>
    <text x="550" y="100">60 mm OD</text>
    <text x="450" y="42">assumed fins: 90 mm root, 38 mm span, 3 mm thick</text>
  </svg>`;
}

export function buildReportHtml(analysis = evaluateRocketMaterials()) {
  const pla = analysis.materials.plaBasic;
  const abs = analysis.materials.absGf;
  const plaRank = analysis.ranking.find((item) => item.materialKey === 'plaBasic');
  const absRank = analysis.ranking.find((item) => item.materialKey === 'absGf');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rocket Material Strength Comparison</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #1f2624;
      --muted: #5f6b66;
      --line: #d8dfdc;
      --panel: #ffffff;
      --paper: #f5f7f6;
      --pla: #26735b;
      --abs: #276f91;
      --good: #18704b;
      --warn: #9f6b00;
      --bad: #b13a2e;
      --soft-good: #dff1e8;
      --soft-warn: #fff1c9;
      --soft-bad: #f8d8d3;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    header, main, footer { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
    header { padding: 38px 0 20px; }
    h1, h2, h3, h4 { margin: 0; line-height: 1.18; letter-spacing: 0; }
    h1 { max-width: 900px; font-size: clamp(2rem, 4vw, 3.8rem); }
    h2 { margin-top: 42px; font-size: 1.55rem; }
    h3 { font-size: 1.05rem; }
    h4 { font-size: 0.95rem; color: var(--muted); }
    p { margin: 12px 0 0; }
    a { color: #1e667f; }
    .lede { max-width: 880px; color: var(--muted); font-size: 1.08rem; }
    .report-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
    .tag, .rank, .pill {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      border-radius: 8px;
      border: 1px solid var(--line);
      padding: 4px 9px;
      font-size: 0.86rem;
      font-weight: 650;
      background: #fff;
    }
    .summary-grid, .two-col {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-top: 18px;
    }
    .summary-card, .panel, .pros-cons-block {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
    }
    .card-title-row { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin: 16px 0 0;
    }
    .metrics div { border-top: 1px solid var(--line); padding-top: 8px; }
    dt { color: var(--muted); font-size: 0.82rem; }
    dd { margin: 2px 0 0; font-weight: 720; }
    .good { color: var(--good); }
    .warn { color: var(--warn); }
    .bad { color: var(--bad); }
    .neutral { color: var(--muted); }
    .pill.good { background: var(--soft-good); border-color: #acd8c2; }
    .pill.warn { background: var(--soft-warn); border-color: #f0d37b; }
    .pill.bad { background: var(--soft-bad); border-color: #edaaa1; }
    .table-wrap { overflow-x: auto; margin-top: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    table { width: 100%; border-collapse: collapse; min-width: 720px; }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { font-weight: 720; }
    thead th { color: var(--muted); font-size: 0.82rem; text-transform: uppercase; }
    tr:last-child th, tr:last-child td { border-bottom: 0; }
    .chart { margin-top: 18px; display: grid; gap: 14px; }
    .bar-row {
      display: grid;
      grid-template-columns: minmax(190px, 0.8fr) minmax(260px, 1.4fr);
      gap: 12px;
      align-items: center;
    }
    .bar-label { font-weight: 700; }
    .bar-set {
      display: grid;
      grid-template-columns: 58px 1fr 58px;
      gap: 8px;
      align-items: center;
    }
    .bar-name { color: var(--muted); font-size: 0.82rem; }
    .bar-track { height: 12px; background: #e7ece9; border-radius: 999px; overflow: hidden; }
    .bar { display: block; height: 100%; border-radius: inherit; }
    .bar.pla { background: var(--pla); }
    .bar.abs { background: var(--abs); }
    .bar-value { font-variant-numeric: tabular-nums; font-size: 0.88rem; }
    .compact ul { margin: 10px 0 0; padding-left: 20px; }
    .compact li + li { margin-top: 6px; }
    .schematic {
      display: block;
      width: 100%;
      height: auto;
      margin-top: 16px;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    .formula-list {
      columns: 2 280px;
      padding-left: 20px;
    }
    footer { padding: 28px 0 42px; color: var(--muted); }
    @media (max-width: 760px) {
      header, main, footer { width: min(100% - 22px, 1180px); }
      .summary-grid, .two-col { grid-template-columns: 1fr; }
      .metrics { grid-template-columns: 1fr; }
      .bar-row { grid-template-columns: 1fr; }
      .bar-set { grid-template-columns: 54px 1fr 52px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Rocket Material Strength Comparison</h1>
    <p class="lede">Static analytical comparison for a 400 mm long, 60 mm OD, 2 mm wall model rocket printed vertically with the tail on the build plate. Materials compared: Bambu PLA Basic and Bambu ABS-GF.</p>
    <div class="report-meta">
      <span class="tag">${escapeHtml(PRINT_ASSUMPTIONS.orientation)}</span>
      <span class="tag">${PRINT_ASSUMPTIONS.infillPercent}% infill</span>
      <span class="tag">${PRINT_ASSUMPTIONS.nozzleDiameterMm} mm nozzle</span>
      <span class="tag">${escapeHtml(PRINT_ASSUMPTIONS.layerHeightLabel)} assumed</span>
      <span class="tag">Generated ${escapeHtml(analysis.generatedAt)}</span>
    </div>
  </header>

  <main>
    <section>
      <h2>Recommendation</h2>
      <div class="summary-grid">
        ${materialSummaryCard(abs, absRank)}
        ${materialSummaryCard(pla, plaRank)}
      </div>
      <p>${escapeHtml(analysis.recommendation)}</p>
    </section>

    <section>
      <h2>Assumed geometry</h2>
      ${geometrySchematic()}
      <div class="table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Assumption</th><th>Why it matters</th></tr></thead>
          <tbody>
            <tr><th scope="row">Body tube</th><td>${ROCKET_SPEC.body.lengthMm} mm long, ${ROCKET_SPEC.body.outerDiameterMm} mm OD, ${ROCKET_SPEC.body.wallThicknessMm} mm wall</td><td>Sets axial area, bending section modulus, mass, and buckling margins.</td></tr>
            <tr><th scope="row">Fins</th><td>${ROCKET_SPEC.fins.count} fins, ${ROCKET_SPEC.fins.rootChordMm} mm root, ${ROCKET_SPEC.fins.tipChordMm} mm tip, ${ROCKET_SPEC.fins.spanMm} mm span, ${ROCKET_SPEC.fins.thicknessMm} mm thick</td><td>Assumed because no CAD was supplied; fin root loads are the most design-sensitive local checks.</td></tr>
            <tr><th scope="row">Nose cone</th><td>${ROCKET_SPEC.noseCone.lengthMm} mm conical shell proxy</td><td>Covered for crush, heat, and impact risk, but less critical than fin roots in this load envelope.</td></tr>
            <tr><th scope="row">Motor mount</th><td>${ROCKET_SPEC.motorMount.outerDiameterMm} mm OD, ${ROCKET_SPEC.motorMount.innerDiameterMm} mm ID, ${ROCKET_SPEC.motorMount.lengthMm} mm long proxy</td><td>Thermal margin near the motor is more important than global static stress.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Load envelope and formulas</h2>
      <div class="two-col">
        <div class="panel">
          <h3>Envelope</h3>
          <ul>
            <li>Launch compression: max of ${LOAD_ENVELOPE.launch.minimumAxialCompressionN} N or ${LOAD_ENVELOPE.launch.accelerationG} g inertial load.</li>
            <li>Aerodynamics: ${LOAD_ENVELOPE.aerodynamics.velocityMps} m/s, ${LOAD_ENVELOPE.aerodynamics.angleOfAttackDeg} deg angle of attack, dynamic fin amplification ${LOAD_ENVELOPE.aerodynamics.finDynamicAmplification}x.</li>
            <li>Parachute shock: ${LOAD_ENVELOPE.parachute.deploymentShockG} g global shock proxy.</li>
            <li>Landing: ${LOAD_ENVELOPE.landing.impactVelocityMps} m/s stopped over ${LOAD_ENVELOPE.landing.stoppingTimeS} s.</li>
            <li>Thermal: ${LOAD_ENVELOPE.thermal.hotSoakC} deg C hot-soak and ${LOAD_ENVELOPE.thermal.motorMountLocalC} deg C local motor-mount proxy.</li>
          </ul>
        </div>
        <div class="panel">
          <h3>Reusable formulas</h3>
          <ul class="formula-list">
            <li>Tube area: A = pi(ro^2 - ri^2)</li>
            <li>Tube inertia: I = pi(ro^4 - ri^4) / 4</li>
            <li>Section modulus: Z = I / ro</li>
            <li>Axial stress: sigma = F / A</li>
            <li>Bending stress: sigma = M / Z</li>
            <li>Euler buckling: Pcr = pi^2 E I / (K L)^2</li>
            <li>Shell buckling: sigma_cr = 0.605 E (t/r) / sqrt(1 - nu^2), then 0.20 imperfection factor</li>
            <li>Fin tip deflection: delta = F L^3 / (3 E I)</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2>Material data</h2>
      <p>Supplier data below is cited from the Bambu technical data sheets. Both sheets state or imply idealized 100% infill, annealed/dried test specimens, so the simulation applies explicit FDM knockdowns for the requested 20% infill field print.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Property</th><th>PLA Basic</th><th>ABS-GF</th></tr></thead>
          <tbody>${materialDataRows()}</tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Margins overview</h2>
      <p>Margins above 1.0 indicate the simplified allowable exceeds the simplified demand. Thermal rows use degrees C of temperature margin rather than a stress ratio.</p>
      <div class="chart">${marginBars(analysis)}</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Load case</th><th>Formula</th><th>PLA demand</th><th>PLA margin</th><th>ABS-GF demand</th><th>ABS-GF margin</th></tr></thead>
          <tbody>${caseRows(analysis, [
            'launchCompression',
            'aerodynamicBending',
            'combinedLaunchAndBending',
            'parachuteDeploymentShock',
            'landingImpact',
            'bodyTubeEulerBuckling',
            'bodyTubeShellBuckling',
            'thermalSoftening',
            'creep'
          ])}</tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Fin focus</h2>
      <p>Fins receive extra scrutiny because the vertical print puts the rocket axis in the printer Z direction, and the fin-body root sees interlayer-sensitive bending and peel. ABS-GF is slightly stiffer in the plate proxy, while PLA Basic keeps better root toughness and Z flexural strength after knockdowns.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Fin load case</th><th>Formula</th><th>PLA demand</th><th>PLA margin</th><th>ABS-GF demand</th><th>ABS-GF margin</th></tr></thead>
          <tbody>${caseRows(analysis, [
            'finRootBending',
            'finRootPeel',
            'finRootShear',
            'finStiffnessFlutterProxy'
          ])}</tbody>
        </table>
      </div>
      <div class="two-col">
        <div class="panel">
          <h3>PLA Basic fin implication</h3>
          <p>Better elongation and impact values make PLA Basic more forgiving at the root, but heat can soften the same root and allow creep under rail, storage, or recovery loads.</p>
        </div>
        <div class="panel">
          <h3>ABS-GF fin implication</h3>
          <p>ABS-GF gives the stiffer fin plate and better heat margin, but the lower Z impact and elongation values justify larger fillets, more perimeters, and root coupon tests before flight.</p>
        </div>
      </div>
    </section>

    <section>
      <h2>Nose cone and motor mount</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Area</th><th>PLA Basic</th><th>ABS-GF</th></tr></thead>
          <tbody>
            <tr><th scope="row">Nose cone</th><td>${escapeHtml(pla.loadCases.noseCone.interpretation)} Static margin ${fmt(pla.loadCases.noseCone.margin)}x.</td><td>${escapeHtml(abs.loadCases.noseCone.interpretation)} Static margin ${fmt(abs.loadCases.noseCone.margin)}x.</td></tr>
            <tr><th scope="row">Motor mount</th><td>Thermal margin ${signed(pla.loadCases.motorMount.temperatureMarginC, 0)} deg C at the assumed local motor-mount temperature.</td><td>Thermal margin ${signed(abs.loadCases.motorMount.temperatureMarginC, 0)} deg C at the assumed local motor-mount temperature.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Pros and cons</h2>
      <div class="summary-grid">
        ${prosCons(pla)}
        ${prosCons(abs)}
      </div>
    </section>

    <section>
      <h2>Limitations</h2>
      <ul>
        ${analysis.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
      <p>In short: this report is useful for ranking and risk discovery, but it is not FEA and not a substitute for motor-specific ground validation.</p>
    </section>

    <section>
      <h2>Sources</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Material</th><th>Technical data sheet</th><th>Specimen caveat</th></tr></thead>
          <tbody>${sourceRows()}</tbody>
        </table>
      </div>
    </section>
  </main>

  <footer>
    <p>Generated from the Node analytical model in <code>src/simulation.js</code>. No external CSS, JavaScript, or CDN assets are required.</p>
  </footer>
</body>
</html>`;
}

export async function writeReport(outputPath = DEFAULT_REPORT_PATH) {
  await mkdir(dirname(outputPath), { recursive: true });
  const html = buildReportHtml(evaluateRocketMaterials());
  await writeFile(outputPath, html, 'utf8');
  return { outputPath, html };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { outputPath } = await writeReport();
  console.log(`Wrote ${outputPath}`);
}
