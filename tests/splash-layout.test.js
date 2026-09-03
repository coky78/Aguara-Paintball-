import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../hero-adjust.css', import.meta.url), 'utf8');

test('mobile splash keeps logo and splash group centered and above hero text', () => {
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.hero-logo-splash\s*\{[\s\S]*?left:\s*50%[\s\S]*?right:\s*auto[\s\S]*?transform:\s*translate\(-50%,\s*-50%\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.hero-logo-splash\s*\{[\s\S]*?z-index:\s*3/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.hero-content\s*\{[\s\S]*?z-index:\s*2/);
});
