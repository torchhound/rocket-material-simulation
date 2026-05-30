# Rocket Material Strength Comparison

Static analytical Node 20 project comparing Bambu PLA Basic and Bambu ABS-GF for a model rocket airframe.

## Report

Build the self-contained HTML report:

```sh
npm run build
```

Open:

```text
report/rocket-material-strength-report.html
```

## Inputs

- Rocket body: 400 mm long, 60 mm OD, 2 mm wall thickness.
- Print: vertical orientation with tail on build plate, 20% infill, 0.4 mm nozzle, assumed Bambu `0.20 mm Standard` layer height.
- Materials: Bambu PLA Basic and Bambu ABS-GF, using the supplied technical data sheet values.
- Fin geometry is assumed because CAD was not supplied: 3 fins, 90 mm root chord, 45 mm tip chord, 38 mm span, 3 mm thickness.

## Calculations

The model uses reusable closed-form calculations in `src/simulation.js`:

- Tube area, second moment of area, section modulus, and mass estimate.
- Launch axial compression and combined compression plus bending.
- Aerodynamic body bending.
- Parachute deployment shock.
- Landing impulse proxy.
- Euler buckling and reduced thin-shell buckling.
- Fin root bending, peel, shear, and static stiffness/flutter proxy.
- Thermal softening, creep, printability, moisture/dimensional stability, nose cone, and motor mount checks.

This is not FEA and does not replace motor-specific ground validation.

## Test And Build

```sh
npm test
npm run build
```

Tests use `node:test` and `node:assert/strict` with no external dependencies.

## Coverage Note

The 2026-05-29 green test run reported:

- Lines: 98.93%
- Branches: 89.01%
- Functions: 100.00%

Known uncovered paths are defensive formatting branches for null/non-finite report values, the zero-demand infinite-margin guard, and the CLI-only console-print lines in `scripts/build-report.js`. These paths do not alter the engineering calculations or generated report content; they are fallback/entrypoint plumbing. The numerical formulas, material knockdowns, load-case coverage, ranking, report rendering, and report writing are covered by tests.

## Documentation

- Development log: `LOG.md`
- Architecture decision record: `docs/adr/0001-static-analytical-simulation.md`
