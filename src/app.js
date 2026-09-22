const areas={drive:{title:'Drive: Richtung geben',description:'Eine gemeinsame Richtung schaffen: vom Zielbild bis zu den Entscheidungen, die im Alltag Orientierung geben.',tasks:['Zielbild entwickeln','Strategie klären','Strategische Ziele setzen','Leitprinzipien formulieren','Richtung kommunizieren']},lead:{title:'Lead: Menschen führen',description:'Ein Umfeld schaffen, in dem Menschen gemeinsam gute Arbeit leisten und sich weiterentwickeln können.',tasks:['Organisation gestalten','Dein Team verstehen','Menschen gewinnen und loslassen','Den Rahmen setzen','Deine Mitarbeitenden entwickeln']},ship:{title:'Ship: Umsetzung sichern',description:'Aus einer gemeinsamen Richtung konkrete Ergebnisse machen. Klarheit schaffen, Entscheidungen treffen und ins Handeln kommen.',tasks:['Ziele setzen','Planen und priorisieren','Klarheit für die Umsetzung schaffen','Schnelle Entscheidungen treffen','Qualität sichern']},yourself:{title:'Yourself: Dich selbst steuern',description:'Deine Führung beginnt bei dir. Reflektiere, wie du arbeitest, entscheidest und deine Aufmerksamkeit einsetzt.',tasks:['Die eigene Führungsarbeit reflektieren','Zeit und Energie bewusst einsetzen','Unter Unsicherheit entscheiden','Feedback einholen und lernen','Den eigenen Führungsstil entwickeln']}};
const items=[...document.querySelectorAll('.accordion-item')];
const accordion=document.querySelector('.wheel-accordion');
const autoplayToggle=document.querySelector('#autoplay-toggle');
const autoplayReduce=matchMedia('(prefers-reduced-motion: reduce)');
const duration=12000;
let activeIndex=0,progress=0,lastTick=null,autoPaused=autoplayReduce.matches,accordionVisible=false;
function selectArea(key){activeIndex=items.findIndex(item=>item.dataset.area===key);progress=0;lastTick=null;items.forEach((item,i)=>{const open=i===activeIndex;item.dataset.open=String(open);item.querySelector('button').setAttribute('aria-expanded',String(open));item.querySelector('.accordion-panel').hidden=!open;item.style.setProperty('--progress','0')});}
items.forEach((item,i)=>{const button=item.querySelector('button');button.addEventListener('click',()=>selectArea(item.dataset.area));button.addEventListener('keydown',event=>{let target;if(event.key==='ArrowDown')target=(i+1)%items.length;if(event.key==='ArrowUp')target=(i+items.length-1)%items.length;if(event.key==='Home')target=0;if(event.key==='End')target=items.length-1;if(target!==undefined){event.preventDefault();items[target].querySelector('button').focus()}})});
function updateAutoplay(){autoplayToggle.textContent=autoPaused?'Automatischen Wechsel starten':'Automatischen Wechsel pausieren';autoplayToggle.setAttribute('aria-pressed',String(autoPaused));lastTick=null;}
autoplayToggle.addEventListener('click',()=>{autoPaused=!autoPaused;updateAutoplay()});
autoplayReduce.addEventListener('change',()=>{autoPaused=autoplayReduce.matches;updateAutoplay()});
new IntersectionObserver(entries=>{accordionVisible=entries[0].isIntersecting;lastTick=null},{threshold:.25}).observe(accordion);
function tickAccordion(now){const held=autoPaused||!accordionVisible||document.hidden;if(!held){if(lastTick!==null)progress+=now-lastTick;if(progress>=duration)selectArea(items[(activeIndex+1)%items.length].dataset.area);items[activeIndex].style.setProperty('--progress',String(progress/duration));}lastTick=held?null:now;requestAnimationFrame(tickAccordion)}
updateAutoplay();requestAnimationFrame(tickAccordion);
const wheel=document.querySelector('.wheel');const toggle=document.querySelector('#motion-toggle');const reduce=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduce.matches,visible=true,wheelHovered=false,elapsed=0,previous=null,raf=null;const layers=[['.process',95],['.yourself',70],['.inner',45]].map(([s,p])=>[wheel.querySelector(s),p]);function update(){toggle.textContent=paused?'Animation starten':'Animation pausieren';toggle.setAttribute('aria-pressed',String(paused))}function frame(now){raf=null;if(paused||wheelHovered||!visible||document.hidden){previous=null;return}if(previous!==null)elapsed+=(now-previous)/1000;previous=now;for(const [layer,period]of layers)layer.setAttribute('transform',`rotate(${elapsed/period*360%360} 0 0)`);raf=requestAnimationFrame(frame)}function resume(){if(raf!==null)cancelAnimationFrame(raf);previous=null;raf=null;if(!paused&&!wheelHovered&&visible&&!document.hidden)raf=requestAnimationFrame(frame)}toggle.addEventListener('click',()=>{paused=!paused;update();resume()});reduce.addEventListener('change',()=>{paused=reduce.matches;update();resume()});new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume()}).observe(wheel);document.addEventListener('visibilitychange',resume);update();resume();
// Pointer selection follows the rotating artwork; keyboard selection uses the accordion.
wheel.addEventListener('click',event=>{const box=wheel.getBoundingClientRect();const x=(event.clientX-box.left)/box.width*1160-580;const y=(event.clientY-box.top)/box.height*1160-580;const radius=Math.hypot(x,y);let key;if(radius>=334&&radius<=440)key='yourself';else if(radius>=137&&radius<=326){const degrees=(Math.atan2(y,x)*180/Math.PI-elapsed/45*360+150+36000)%360;key=['drive','lead','ship'][Math.floor(degrees/120)]}if(key)selectArea(key)});

// Return every ring to the shared starting orientation while hovered.
let returnFrame=null;
wheel.addEventListener('pointerenter',event=>{
 if(event.pointerType==='touch')return;
 wheelHovered=true;
 resume();
 const starts=layers.map(([,period])=>{const angle=elapsed/period*360%360;return angle>180?angle-360:angle});
 elapsed=0;
 const started=performance.now();
 function returnToStart(now){
  const t=reduce.matches?1:Math.min(1,(now-started)/550);
  const eased=1-Math.pow(1-t,3);
  layers.forEach(([layer],i)=>layer.setAttribute('transform',`rotate(${starts[i]*(1-eased)} 0 0)`));
  returnFrame=t<1?requestAnimationFrame(returnToStart):null;
 }
 returnFrame=requestAnimationFrame(returnToStart);
});
wheel.addEventListener('pointerleave',()=>{
 if(!wheelHovered)return;
 wheelHovered=false;
 if(returnFrame!==null){cancelAnimationFrame(returnFrame);returnFrame=null;}
 layers.forEach(([layer])=>layer.setAttribute('transform','rotate(0 0 0)'));
 resume();
});

// Use the actual cover pixels to restrict the lighting to orange ink.
const coverImage=document.querySelector('.book img');
async function prepareOrangeFinish(){
 try{
  await coverImage.decode();
  const canvas=document.createElement('canvas');
  canvas.width=1000;canvas.height=Math.round(1000*510/362);
  const context=canvas.getContext('2d',{willReadFrequently:true});
  const bookBox=coverImage.parentElement.getBoundingClientRect();
  const imageBox=coverImage.getBoundingClientRect();
  const scale=canvas.width/bookBox.width;
  context.drawImage(coverImage,(imageBox.left-bookBox.left)*scale,(imageBox.top-bookBox.top)*scale,imageBox.width*scale,imageBox.height*scale);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height);
  for(let i=0;i<pixels.data.length;i+=4){
   const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
   const orange=Math.max(0,Math.min(1,(r-g-35)/55,(g-b-12)/35,(r-110)/65));
   pixels.data[i+3]=Math.round(pixels.data[i+3]*orange);
   pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;
  }
  context.putImageData(pixels,0,0);
  coverImage.parentElement.style.setProperty('--orange-mask',`url("${canvas.toDataURL()}")`);
 }catch(error){console.warn('Cover finish unavailable',error);}
}
prepareOrangeFinish();
