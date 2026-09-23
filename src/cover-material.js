// Flat cover with stationary microstructure and a moving studio light.
(async()=>{
 const book=document.querySelector('.book');
 if(!book)return;
 const img=book.querySelector('img');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const shimmerCycleSeconds=4;
 let canvas,gl,raf=null,visible=false,last=null,time=0;
 try{
  await img.decode();
  canvas=document.createElement('canvas');canvas.className='cover-material';canvas.setAttribute('aria-hidden','true');
  gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
  if(!gl)return;
  const vertex=`attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment=`precision highp float;
  varying vec2 uv; uniform sampler2D cover; uniform float phase; uniform vec2 texel;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float lacquerMask(vec3 c){
   float hi=max(c.r,max(c.g,c.b)),lo=min(c.r,min(c.g,c.b));
   return smoothstep(.70,.91,lo)*(1.-smoothstep(.07,.19,hi-lo));
  }
  void main(){
   vec3 base=texture2D(cover,uv).rgb;
   float foil=clamp(min(min((base.r-base.g-.137)/.216,(base.g-base.b-.047)/.137),(base.r-.431)/.255),0.,1.);
   float yellow=smoothstep(.6,.82,base.g)*smoothstep(.25,.48,base.r-base.b)*(1.-smoothstep(.18,.38,base.r-base.g));
   float white= lacquerMask(base);
   float purple=smoothstep(.16,.32,base.b-base.g)*smoothstep(.10,.22,base.b-base.r);
   foil*=1.-yellow;
   // Fixed microscopic brushing changes the reflected light, never the artwork.
   float grain=hash(floor(uv*vec2(1400.,2200.)))-.5;
   float brush=sin(uv.y*4800.+sin(uv.x*34.)*.7)*.6+sin(uv.y*8700.)*.4;
   vec3 n=normalize(vec3(grain*.018,brush*.045,1.));
   vec3 surface=vec3((uv.x-.5)*1.42,(uv.y-.5)*2.,0.);
   float sweep=clamp(phase/4.5,0.,1.);
   float envelope=smoothstep(0.,.65,phase)*(1.-smoothstep(3.8,4.5,phase));
   vec3 lamp=vec3(mix(-3.8,3.8,sweep),mix(1.7,-1.2,sweep),2.8);
   vec3 light=normalize(lamp-surface);
   vec3 halfVector=normalize(light+vec3(0.,0.,1.));
   float ndh=max(dot(n,halfVector),0.);
   // Two soft lobes approximate a broad studio softbox reflected in satin foil.
   float reflection=pow(ndh,95.)*.31+pow(ndh,18.)*.095;
   float shade=(1.-max(dot(n,light),0.))*.09;
   vec3 foilColor=base*(1.-.025+grain*.012+brush*.007);
   foilColor=foilColor*(1.-shade*envelope)+vec3(1.,.77,.48)*reflection*envelope;
   vec3 result=mix(base,foilColor,foil);
   // A tiny bevel in the white ink makes the lacquer appear slightly raised.
   float dx=lacquerMask(texture2D(cover,uv+vec2(texel.x,0.)).rgb)-lacquerMask(texture2D(cover,uv-vec2(texel.x,0.)).rgb);
   float dy=lacquerMask(texture2D(cover,uv+vec2(0.,texel.y)).rgb)-lacquerMask(texture2D(cover,uv-vec2(0.,texel.y)).rgb);
   vec3 lacquerNormal=normalize(vec3(-dx*.32,-dy*.32,1.));
   float lacquerSpec=pow(max(dot(lacquerNormal,halfVector),0.),170.);
   float bevel=dot(lacquerNormal.xy,light.xy)*.18;
   vec3 lacquer=base*(1.-.028*envelope)+vec3(lacquerSpec*.065+bevel)*envelope;
   result=mix(result,lacquer,white);
   // Purple ink stays matte; yellow arrows have a tighter clear-varnish lobe.
   vec3 matte=base*(1.+.018*envelope*max(dot(n,light),0.));
   result=mix(result,matte,purple);
   float inkSpec=pow(max(halfVector.z,0.),125.)*.13;
   vec3 varnish=base*(1.-.018*envelope)+vec3(1.,.94,.72)*inkSpec*envelope;
   result=mix(result,varnish,yellow);
   gl_FragColor=vec4(clamp(result,0.,1.),1.);
  }`;
  function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;}
  const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const source=document.createElement('canvas');source.width=1000;source.height=Math.round(1000*510/362);
  const ctx=source.getContext('2d'),style=getComputedStyle(img),scale=source.width/book.clientWidth;
  ctx.drawImage(img,parseFloat(style.left)*scale,parseFloat(style.top)*scale,parseFloat(style.width)*scale,parseFloat(style.height)*scale);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.uniform2f(gl.getUniformLocation(program,'texel'),1/source.width,1/source.height);
  gl.uniform1i(gl.getUniformLocation(program,'cover'),0);const phase=gl.getUniformLocation(program,'phase');
  function draw(){const dpr=Math.min(devicePixelRatio,2),w=Math.round(book.clientWidth*dpr),h=Math.round(book.clientHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.uniform1f(phase,reduce.matches?5:(time%shimmerCycleSeconds)/shimmerCycleSeconds*7.25);gl.drawArrays(gl.TRIANGLES,0,6);}
  function frame(now){raf=null;if(!visible||document.hidden||reduce.matches){last=null;return;}if(last!==null)time+=(now-last)/1000;last=now;draw();raf=requestAnimationFrame(frame);}
  function resume(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null;draw();if(visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(frame);}
  book.append(canvas);draw();book.classList.add('has-material');
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(book);
  new ResizeObserver(()=>draw()).observe(book);
  document.addEventListener('visibilitychange',resume);reduce.addEventListener('change',resume);
  canvas.addEventListener('webglcontextlost',()=>{if(raf!==null)cancelAnimationFrame(raf);book.classList.remove('has-material');canvas.remove();});
 }catch(error){canvas?.remove();book.classList.remove('has-material');console.warn('Cover material fallback',error);}
})();
