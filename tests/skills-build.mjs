import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
const catalogue=JSON.parse(await readFile('public/skills-data.json','utf8'));
assert.equal(catalogue.skills.length,89);
assert.equal(new Set(catalogue.skills.map(s=>s.slug)).size,89);
assert.equal(catalogue.skills.reduce((n,s)=>n+s.files.length,0),138);
assert.equal(catalogue.mode,'public');
for(const s of catalogue.skills){
 assert.equal(s.access,'free');
 assert(s.available);assert(s.files.includes('SKILL.md'));
 for(const f of s.files)assert.equal(typeof s.documents[f],'string');
 await access(`public/${s.download}`);
}
await access('public/downloads/drive-leadership-skills-alle.zip');
console.log('PASS: 89 free skills, 138 Markdown files and all ZIP downloads available');
