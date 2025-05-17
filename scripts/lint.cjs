#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get staged files from git
let files = execSync('git diff --name-only --cached', { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(f => /\.(ts|tsx|js|jsx|json|md)$/.test(f));

let failed = false;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const data = fs.readFileSync(file, 'utf8');
  const lines = data.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (/\s+$/.test(line)) {
      console.error(`${file}:${i + 1}: trailing whitespace`);
      failed = true;
    }
  });
}

if (failed) {
  process.exit(1);
} else {
  console.log('Lint passed');
}
