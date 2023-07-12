import * as fs from 'fs';
import * as path from 'path';

import { tools } from '../src/config';

const organizedTools: any[] = [];
for (const key of Object.keys(tools).sort()) {
  organizedTools.push(key);

  for (const tool of tools[key].sort((a, b) => (a.title > b.title) ? 1 : -1)) {
    organizedTools.push(tool);
  }
}

let output = '## Tools\n';
for (const entry of organizedTools) {
  if (typeof entry === 'string') {
    output += `\n### ${entry}\n\n`;
  } else {
    if (entry.about) {
      output += `- [${entry.title}](./src${entry.about.split('/src')[1]}) - ${entry.description}\n`;
    } else if (entry.url) {
      output += `- [${entry.title}](${entry.url}) - ${entry.description}\n`;
    }
  }
}

const readmePath = path.join(__dirname, '../README.md');
const existingReadme = fs.readFileSync(readmePath, 'utf8');
fs.writeFileSync(readmePath, existingReadme.split('## Tools')[0] + output, { encoding: 'utf8', mode: fs.constants.W_OK });
