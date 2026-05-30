import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildReportHtml, writeReport } from '../scripts/build-report.js';
import { evaluateRocketMaterials } from '../src/simulation.js';

test('HTML report is self-contained and includes required comparison evidence', () => {
  const html = buildReportHtml(evaluateRocketMaterials());

  assert.match(html, /<!doctype html>/i);
  assert.match(html, /Bambu PLA Basic Technical Data Sheet V3\.0/);
  assert.match(html, /Bambu ABS-GF Technical Data Sheet V1\.0/);
  assert.match(html, /0\.20 mm Standard/);
  assert.match(html, /Fin root bending/);
  assert.match(html, /Fin root peel/);
  assert.match(html, /Body tube shell buckling/);
  assert.match(html, /Limitations/);
  assert.match(html, /not FEA/i);
  assert.doesNotMatch(html, /<script\s/i);
  assert.doesNotMatch(html, /https:\/\/cdn|http:\/\/cdn/i);
});

test('report writer persists the generated HTML to the requested path', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rocket-report-'));
  const outFile = join(dir, 'report.html');

  try {
    await writeReport(outFile);
    const html = await readFile(outFile, 'utf8');
    assert.match(html, /Rocket Material Strength Comparison/);
    assert.match(html, /Pros and cons/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
