# ADR 0001: Static Analytical Simulation for Rocket Material Comparison

Date: 2026-05-29

## Status

Accepted for implementation.

## Context

The project must compare Bambu PLA Basic and Bambu ABS-GF for a 400 mm long, 60 mm OD, 2 mm wall model rocket printed vertically with the tail on the build plate, 20% infill, a 0.4 mm nozzle, and Bambu's default 0.20 mm Standard layer height assumption. The repository begins empty except for the project instructions, so the implementation must establish the project structure, reusable calculations, tests, documentation, and a generated static HTML report.

The requested report is analytical, not finite element analysis. It must still calculate meaningful load-case margins: launch compression, aerodynamic bending, parachute shock, landing impact, body tube buckling, fin root bending, fin peel, fin shear, fin stiffness/flutter proxy, thermal softening, creep, printability, moisture/dimensional stability, nose cone considerations, and motor mount considerations.

The material data is limited to the two supplied Bambu technical data sheets. Their test specimens were 100% infill and annealed/dried, while this project assumes a 20% infill field print. The simulation therefore needs explicit conservative knockdown factors for print process, infill, and root/interlayer peel behavior.

## Decision

Build a dependency-free Node 20 project with:

- `src/simulation.js` as the single source of truth for geometry, material data, assumptions, formulas, load cases, margins, and ranked recommendation.
- `scripts/build-report.js` as a static HTML renderer that imports simulation data rather than duplicating calculations.
- `tests/simulation.test.js` and `tests/report.test.js` using `node:test` and `node:assert/strict`.
- `report/rocket-material-strength-report.html` generated from the current simulation state.

Use closed-form engineering approximations:

- Thin circular tube area, second moment of area, and section modulus.
- Axial stress and bending stress from force and moment.
- Euler column buckling with a pinned-pinned effective length factor.
- Classical thin cylindrical shell axial buckling with a conservative imperfection knockdown.
- Parachute and landing loads represented as acceleration and impulse proxies.
- Fins represented as trapezoidal cantilever plates with root bending, peel, shear, and stiffness proxies.

Use the supplied TDS Z-direction properties for rocket-axis and interlayer-sensitive load paths because the rocket is printed vertically. Use XY flexural modulus for fin plate stiffness, while applying Z-direction strength and additional root knockdowns for fin root peel and bending. Keep each formula in a small reusable function that tests can exercise independently.

## Consequences

This approach produces a transparent, auditable report with traceable assumptions and deterministic test coverage. It does not claim the fidelity of FEA or measured flight testing. The analysis is suitable for material ranking, identifying risk drivers, and deciding which material deserves validation prints.

Because no motor, launch rail, recovery hardware, adhesive, or exact fin geometry has been provided, the project must state a conservative but assumed load envelope. Final flight safety still requires real inspection, test coupons, ground tests, and motor-specific review.

## Success Criteria

- Tests are written before implementation and fail while implementation is absent.
- Tests cover numerical section properties, stress formulas, buckling formulas, material knockdowns, material ranking, report generation, and required report content.
- `npm test` passes after implementation.
- `npm run build` generates a self-contained HTML report with embedded CSS, no CDN, clear pros/cons, citations, assumptions, formulas, margins, and limitations.
- `LOG.md` records the red-green process and documents any coverage limitations.

## After Action Report

Implemented on 2026-05-29.

The project followed the ADR structure: tests were written before implementation and the first `npm test` run failed with missing-module errors for the intended public API. The implementation then added the analytical simulation module, static report renderer, generated HTML report, README, and development log updates.

The final report ranks ABS-GF first for final flight-article use because its Vicat/HDT margins dominate hot-soak and motor-mount risk. PLA Basic remains the better prototype and cool-weather material because it is easier to print and has better supplied Z impact, elongation, and flexural strength for fin-root shock tolerance. The report calls out that fins are the design-sensitive feature and recommends larger fillets, more perimeters, and root coupon validation before flight.

The default suite passed after implementation. Coverage was high but not total: defensive formatting branches, the zero-demand infinite-margin guard, and CLI-only console output were not fully covered. This exception is acceptable because those paths do not change the formulas, material properties, ranking, or generated report content, and the uncovered status is documented in `README.md` and `LOG.md`.
