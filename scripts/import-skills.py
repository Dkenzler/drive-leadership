"""Import catalogue metadata; full content goes only into ignored local preview files."""
import sys,json,re,shutil,zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]).resolve()
catalog=json.loads((source/'catalog.json').read_text())
modules={'DRIVE':'Drive','LEAD':'Lead','SHIP':'Ship','YOURSELF':'Yourself','FLYWHEEL':'Flywheel'}
public=[]; full=[]; seen=set()
for item in catalog['skills']:
 slug=item['slug'];assert re.fullmatch(r'[a-z0-9-]+',slug) and slug not in seen,slug;seen.add(slug)
 files={}
 for name in item['files']:
  path=(source/'skills'/slug/name).resolve();assert path.is_relative_to(source/'skills'/slug) and path.suffix=='.md',name
  files[name]=path.read_text()
 archive=(source/item['download']).resolve();assert archive.is_relative_to(source/'downloads')
 with zipfile.ZipFile(archive) as z:
  assert z.testzip() is None
  for name,body in files.items():assert z.read(f'{slug}/{name}').decode()==body,(slug,name)
 md=files['SKILL.md']
 desc=item['description'].split(' Nutze diesen Skill',1)[0]
 d=dict(slug=slug,title=item['title'],area=modules[item['module']],topic=item['area'],origin=item['origin'],deepDive=item['deep_dive'],description=item['description'],desc=desc,summary=item['summary'],files=list(files),access='pending',available=False)
 public.append(d);full.append(dict(d,available=True,documents=files,download=item['download']))
assert len(seen)==catalog['count']
local=root/'.local-skills';local.mkdir(exist_ok=True)
(local/'downloads').mkdir(exist_ok=True)
for item in catalog['skills']:shutil.copy2(source/item['download'],local/item['download'])
shutil.copy2(source/'downloads/drive-leadership-skills-alle.zip',local/'downloads/drive-leadership-skills-alle.zip')
(root/'src/skills-data.json').write_text(json.dumps({'mode':'catalogue','skills':public},ensure_ascii=False,indent=2)+'\n')
(local/'skills-data.json').write_text(json.dumps({'mode':'local','skills':full},ensure_ascii=False,indent=2)+'\n')
print(f'Imported {len(seen)} skills, {sum(len(x["files"]) for x in public)} Markdown files. Full contents are local only.')
