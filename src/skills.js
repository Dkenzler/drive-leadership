'use strict';
const $=s=>document.querySelector(s);
const areas=['Alle','Drive','Lead','Ship','Yourself','Flywheel'];
let skills=[],area=new URLSearchParams(location.search).get('area')||'Alle',localPreview=false;
const isDetail=location.pathname.endsWith('/skill.html');
const symbols={Drive:'↗',Lead:'◎',Ship:'→',Yourself:'◌',Flywheel:'↻'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>s.toLocaleLowerCase('de').normalize('NFD').replace(/\p{Diacritic}/gu,'');
const accessLabel=s=>s.access==='free'?'Frei':s.access==='reader'?'Leser':'Zugang offen';
function render(){
 $('#areas').innerHTML=areas.map(a=>`<button data-area="${a}" aria-pressed="${a===area}">${a}<span>${skills.filter(s=>a==='Alle'||s.area===a).length}</span></button>`).join('');
 const q=normalize($('#search').value.trim());
 const found=skills.filter(s=>(area==='Alle'||s.area===area)&&(!$('#templates-only').checked||s.files.length>1)&&normalize([s.title,s.description,s.area,s.topic].join(' ')).includes(q));
 $('#count').textContent=`${found.length} ${found.length===1?'Skill':'Skills'} entdecken`;
 $('#results').innerHTML=found.length?found.map(s=>`<a class="skill-row" href="skill.html?skill=${encodeURIComponent(s.slug)}" data-area="${s.area}"><span class="skill-symbol" aria-hidden="true">${symbols[s.area]}</span><span><strong>${esc(s.title)}</strong><small>${esc(s.desc)}</small><span class="row-files">${esc(s.topic)}${s.files.length>1?` · ${s.files.length-1} ${s.files.length===2?'Vorlage':'Vorlagen'}`:''}</span></span><span class="area-label">${s.area}</span><span class="access-label">${accessLabel(s)}</span><span class="row-arrow" aria-hidden="true">↗</span></a>`).join(''):'<div class="empty"><h3>Hier ist noch kein passender Skill.</h3><p>Probiere einen anderen Suchbegriff oder Bereich.</p><button class="button" id="reset">Filter zurücksetzen</button></div>';
}
function markdown(md){
 const body=md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
 return DOMPurify.sanitize(marked.parse(body),{USE_PROFILES:{html:true},FORBID_TAGS:['img','style','form','input'],FORBID_ATTR:['style']});
}
function downloadText(name,text){const u=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function detail(s){
 const available=localPreview&&s.available&&s.documents;
 let activeFile='SKILL.md',view='preview';
 document.title=`${s.title} · KI-Skills · DRIVE Leadership`;
 $('#detail-content').innerHTML=`<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="skills.html?v=real-catalogue">KI-Skills</a><span aria-hidden="true">/</span><a href="skills.html?v=real-catalogue&area=${s.area}">${s.area}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(s.title)}</span></nav><header class="repo-heading"><div><p class="eyebrow">DRIVE / SKILL-BIBLIOTHEK</p><h1>${esc(s.title)}</h1><p>${esc(s.desc)}</p><div class="repo-tags"><a href="skills.html?v=real-catalogue&area=${s.area}">${s.area}</a><span>${esc(s.topic)}</span>${s.deepDive?'<span>Deep Dive</span>':''}<span>${accessLabel(s)}</span></div></div>${available?`<a class="button" id="download" href="${esc(s.download)}" download>↓ Skill als ZIP</a>`:'<button class="button" data-access>Zugang in Planung ↗</button>'}</header><div class="repo-layout"><div class="repo-main"><section class="repo-start"><p class="eyebrow">MIT DEINER KI STARTEN</p><p>Das ZIP enthält den Skill${s.files.length>1?' und die zugehörigen Vorlagen':''}. Für einen Chat kannst du SKILL.md als Datei oder Text mitgeben; ergänze bei Bedarf die Vorlagen.</p><div class="starter-prompt">Nutze den Skill „${esc(s.title)}“ und führe mich Schritt für Schritt durch die Methode.</div></section><section class="repo-file"><div class="repo-filebar"><span>▤ &nbsp; Überblick</span><span>Aus dem Buch</span></div><div class="readme"><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p></div></section><section class="repo-file"><div class="repo-filebar"><span>▤ &nbsp; Dateien</span><span>${s.files.length} ${s.files.length===1?'Datei':'Dateien'}</span></div><div class="repo-files">${s.files.map(f=>`<button data-file="${esc(f)}" ${available?'':'disabled'} aria-pressed="${f==='SKILL.md'}"><span>▤ &nbsp; ${esc(f)}</span><span>${f==='SKILL.md'?'Skill':'Vorlage'}</span></button>`).join('')}</div></section><section class="repo-file" id="file-preview"><div class="repo-filebar"><span id="file-name">SKILL.md</span>${available?'<div class="view-tabs" role="group" aria-label="Ansicht"><button data-view="preview" aria-pressed="true">Vorschau</button><button data-view="source" aria-pressed="false">Quelltext</button></div>':''}</div>${available?'<div id="md-view" class="markdown readme"></div>':'<div class="locked"><h3>Die Inhalte sind noch nicht freigegeben.</h3><p>Der Katalog ist vorbereitet. Welche Skills frei verfügbar sein werden und wie der Leserzugang funktioniert, legen wir noch fest.</p><button class="copy" data-access>Zugangsoptionen ansehen ↗</button></div>'}</section></div><aside class="repo-sidebar"><h2>Über den Skill</h2><dl><dt>Bereich</dt><dd>${s.area}</dd><dt>Kapitel</dt><dd>${esc(s.topic)}</dd><dt>Ursprung der Methode</dt><dd>${esc(s.origin)}</dd><dt>Zugang</dt><dd>${accessLabel(s)}</dd><dt>Dateien</dt><dd>${s.files.length} Markdown-Datei${s.files.length===1?'':'en'}</dd><dt>Sprache</dt><dd>Deutsch</dd></dl>${available?'<button class="copy" id="copy">Datei kopieren</button><button class="copy" id="download-file">Datei herunterladen</button>':''}<p id="action-status" role="status"></p><div class="repo-aside-note"><h3>Dein Urteil bleibt entscheidend.</h3><p>Der Skill hilft bei der Anwendung. Was für dein Team passt, entscheidest du.</p></div><a class="how-link" href="skills.html?v=real-catalogue#how">Wie nutze ich einen Skill? ↗</a></aside></div>`;
 if(!available)return;
 function showFile(){
  $('#file-name').textContent=activeFile;$('#md-view').className=view==='source'?'source readme':'markdown readme';
  if(view==='source')$('#md-view').textContent=s.documents[activeFile];
  else {
   $('#md-view').innerHTML=markdown(s.documents[activeFile]);
   $('#md-view').querySelectorAll('table').forEach(t=>{const wrap=document.createElement('div');wrap.className='markdown-table';t.before(wrap);wrap.append(t);});
   // Resolve supplied relative references into this local file browser or another skill.
   $('#md-view').querySelectorAll('a').forEach(a=>{const href=a.getAttribute('href');if(!href)return;const url=new URL(href,`https://skill.local/skills/${s.slug}/${activeFile}`);if(url.origin==='https://skill.local'&&!href.startsWith('#')){const parts=decodeURIComponent(url.pathname).split('/');const slug=parts[2],name=parts.slice(3).join('/');if(slug===s.slug&&s.documents[name]){a.href='#file-preview';a.onclick=()=>{activeFile=name;showFile();};}else if(skills.some(x=>x.slug===slug)){a.href=`skill.html?skill=${encodeURIComponent(slug)}`;}else {a.removeAttribute('href');}}else if(url.protocol==='https:'||url.protocol==='http:'){a.target='_blank';a.rel='noopener noreferrer';}});
  }
  document.querySelectorAll('[data-file]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.file===activeFile)));
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  $('#action-status').textContent='';
 }
 document.querySelectorAll('[data-file]').forEach(b=>b.onclick=()=>{activeFile=b.dataset.file;showFile();});
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;showFile();});
 $('#download-file').onclick=()=>downloadText(`${s.slug}-${activeFile.split('/').pop()}`,s.documents[activeFile]);
 $('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(s.documents[activeFile]);$('#action-status').textContent=`${activeFile} kopiert.`;}catch{$('#action-status').textContent='Bitte den Text im Tab Quelltext manuell kopieren.';}};
 showFile();
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.area){area=b.dataset.area;render();}if(b.hasAttribute('data-access'))$('#access').showModal();if(b.hasAttribute('data-close'))b.closest('dialog').close();if(b.id==='reset'){area='Alle';$('#search').value='';$('#templates-only').checked=false;render();}});
if(!isDetail){$('#search').addEventListener('input',render);$('#templates-only').addEventListener('change',render);}
fetch('skills-data.json?v=real-catalogue', {cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
 skills=data.skills;localPreview=data.mode==='local';
 const notice=document.createElement('div');notice.className='local-preview-note';notice.textContent=localPreview?'Lokale Vorschau · vollständige Inhalte · Freigaben noch offen':'Katalogvorschau · Freigaben noch offen';$('main').prepend(notice);
 if(isDetail){const aliases={okr:'okrs','career-levels':'career-track-levels'};let slug=new URLSearchParams(location.search).get('skill');slug=aliases[slug]||slug;const selected=skills.find(s=>s.slug===slug);if(selected)detail(selected);else $('#detail-content').innerHTML='<h1>Skill nicht gefunden</h1><p><a class="how-link" href="skills.html?v=real-catalogue">Zurück zur Bibliothek →</a></p>';}
 else{if(!areas.includes(area))area='Alle';render();if(localPreview){const a=document.createElement('a');a.className='how-link';a.href='downloads/drive-leadership-skills-alle.zip';a.download='';a.textContent='Alle 89 Skills als ZIP ↓';$('.catalogue-note').after(a);}}
}).catch(()=>{const el=isDetail?$('#detail-content'):$('#results');el.innerHTML='<p>Die Skills konnten nicht geladen werden. Bitte lade die Seite erneut.</p>';});
