// @kiavashmax
const canvas=document.getElementById("garden"),ctx=canvas.getContext("2d"),counter=document.getElementById("plants"),resetBtn=document.getElementById("reset");
const KEY="cursor-garden:v1",MAX_PLANTS=500,SPACING=46;
const COLORS=[[330,85,66],[285,80,66],[205,85,66],[45,95,66],[15,88,66],[150,60,55]];
let plants=[],W=0,H=0,dpr=1;
let pointerX=-1,pointerY=-1,pointerOn=false;
let lastX=0,lastY=0,saveTimer=0;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function resize(){dpr=Math.min(window.devicePixelRatio||1,2);W=window.innerWidth;H=window.innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap="round"}
window.addEventListener("resize",resize);
function makePlant(x,y,small){const c=pick(COLORS);return{x,y,h:small?rnd(30,70):rnd(50,130),hue:c[0]+rnd(-14,14),sat:c[1],lit:c[2],grow:0,sway:Math.random()*Math.PI*2,amp:rnd(4,12),stemWidth:rnd(1.2,2.4),leaves:2+Math.floor(Math.random()*3),petals:5+Math.floor(Math.random()*4),petalSize:rnd(3.5,6.5),centreSize:rnd(1.8,3.2),leafSize:rnd(.35,.6)}}
function addPlant(x,y,small){if(plants.length>=MAX_PLANTS)plants.shift();plants.push(makePlant(x,y,small));counter.textContent=plants.length;scheduleSave()}
function bloom(x,y){for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+Math.random()*.5,r=rnd(6,28);addPlant(x+Math.cos(a)*r,y+Math.sin(a)*r,true)}}
function pack(p){return[Math.round(p.x),Math.round(p.y),Math.round(p.h),Math.round(p.hue),Math.round(p.sat),Math.round(p.lit),+p.sway.toFixed(2),+p.amp.toFixed(1),+p.stemWidth.toFixed(1),p.leaves,p.petals,+p.petalSize.toFixed(1),+p.centreSize.toFixed(1),+p.leafSize.toFixed(2)]}
function unpack(a){return{x:a[0],y:a[1],h:a[2],hue:a[3],sat:a[4],lit:a[5],sway:a[6],amp:a[7],stemWidth:a[8],leaves:a[9],petals:a[10],petalSize:a[11],centreSize:a[12],leafSize:a[13],grow:1}}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,400)}
function saveNow(){try{localStorage.setItem(KEY,JSON.stringify(plants.map(pack)))}catch(e){}}
function loadGarden(){let raw;try{raw=localStorage.getItem(KEY)}catch(e){return false}if(!raw)return false;let data;try{data=JSON.parse(raw)}catch(e){return false}if(!Array.isArray(data))return false;for(const row of data){if(Array.isArray(row)&&row.length>=14)plants.push(unpack(row))}counter.textContent=plants.length;return plants.length>0}
function clearAll(){plants=[];counter.textContent="0";lastX=lastY=0;try{localStorage.removeItem(KEY)}catch(e){}redraw()}
function drawPlant(p,t){if(p.grow<.01)return;const g=p.grow,height=p.h*g;const phase=t*.0016+p.sway+p.y*.008;const offset=Math.sin(phase)*p.amp*g*(p.h/100);const topX=p.x+offset,topY=p.y-height;ctx.strokeStyle="hsl(140,32%,"+(34+8*g)+"%)";ctx.lineWidth=p.stemWidth*g;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(p.x+offset*.35,p.y-height*.5,topX,topY);ctx.stroke();for(let i=0;i<p.leaves;i++){const k=(i+1)/(p.leaves+1);const lx=p.x+(topX-p.x)*k,ly=p.y-height*k;const side=i%2?-1:1;const lw=8*p.leafSize*g*(1-k*.3),lh=4*p.leafSize*g*(1-k*.3);ctx.save();ctx.translate(lx,ly);ctx.rotate(side*.5);ctx.fillStyle="hsl(140,38%,"+(40+6*g)+"%)";ctx.beginPath();ctx.ellipse(side*lw*.8,0,lw,lh,0,0,Math.PI*2);ctx.fill();ctx.restore()}ctx.save();ctx.translate(topX,topY);ctx.rotate(Math.sin(phase)*.15);const fs=p.petalSize*g,cs=p.centreSize*g;ctx.fillStyle="hsl("+p.hue+","+p.sat+"%,"+p.lit+"%)";for(let i=0;i<p.petals;i++){ctx.save();ctx.rotate((i/p.petals)*Math.PI*2);ctx.beginPath();ctx.ellipse(0,-fs*1.1,fs*.55,fs*1.1,0,0,Math.PI*2);ctx.fill();ctx.restore()}ctx.fillStyle="hsl("+p.hue+","+p.sat+"%,"+Math.min(p.lit+25,92)+"%)";ctx.beginPath();ctx.arc(0,0,cs,0,Math.PI*2);ctx.fill();ctx.restore()}
function redraw(){ctx.fillStyle="#0a0f14";ctx.fillRect(0,0,W,H);const t=performance.now();for(const p of plants)drawPlant(p,t)}
function render(t){ctx.fillStyle="#0a0f14";ctx.fillRect(0,0,W,H);if(pointerOn){const g=ctx.createRadialGradient(pointerX,pointerY,0,pointerX,pointerY,90);g.addColorStop(0,"rgba(93,220,159,.10)");g.addColorStop(1,"rgba(93,220,159,0)");ctx.fillStyle=g;ctx.fillRect(pointerX-90,pointerY-90,180,180)}for(const p of plants)drawPlant(p,t)}
let lastT=0;
function frame(t){const dt=(t-lastT)/1000;lastT=t;for(const p of plants){if(p.grow<1)p.grow+=(1-p.grow)*(1-Math.exp(-3.2*dt))}render(t);requestAnimationFrame(frame)}
function onMove(x,y){pointerX=x;pointerY=y;pointerOn=true;if(lastX===0&&lastY===0){lastX=x;lastY=y;return}const dx=x-lastX,dy=y-lastY;if(dx*dx+dy*dy>=SPACING*SPACING){addPlant(x+rnd(-6,6),y+rnd(-2,6),false);lastX=x;lastY=y}}
window.addEventListener("pointermove",e=>onMove(e.clientX,e.clientY),{passive:true});
window.addEventListener("pointerdown",e=>{pointerX=e.clientX;pointerY=e.clientY;pointerOn=true;bloom(e.clientX,e.clientY);lastX=e.clientX;lastY=e.clientY},{passive:true});
window.addEventListener("keydown",e=>{if(e.key==="r"||e.key==="R")clearAll()});
resetBtn.addEventListener("click",e=>{e.preventDefault();clearAll()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")saveNow()});
window.addEventListener("pagehide",saveNow);
resize();
if(!loadGarden()){for(let i=0;i<10;i++)addPlant(rnd(W*.08,W*.92),H-rnd(0,24),false)}
requestAnimationFrame(frame);