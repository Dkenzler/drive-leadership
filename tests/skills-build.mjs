import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
const catalogue=JSON.parse(await readFile('public/skills-data.json','utf8'));
assert.equal(catalogue.skills.length,89);
assert.equal(new Set(catalogue.skills.map(s=>s.slug)).size,89);
assert.equal(catalogue.skills.reduce((n,s)=>n+s.files.length,0),138);
if(catalogue.mode==='catalogue'){
 assert(catalogue.skills.every(s=>!s.available&&!s.documents&&!s.md&&!s.download));
 await assert.rejects(access('public/downloads'));
}else{
 assert.equal(catalogue.mode,'local');
 for(const s of catalogue.skills){
  assert(s.available);assert(s.files.includes('SKILL.md'));
  for(const f of s.files)assert.equal(typeof s.documents[f],'string');
  await access(`public/${s.download}`);
 }
}
console.log(`PASS: 89 skills, 138 files; ${catalogue.mode} build boundaries verified`);
