import * as THREE from 'three';
import { createDemoScene } from './scene.js';
import { loadManifest } from './assets.js';
import { createAssetViewer } from './viewers.js';

const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.xr.enabled = true;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080c14);
const camera = new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.05,500);
camera.position.set(0,1.6,3);
createDemoScene(scene);
const floor=scene.children.find(o=>o.isGridHelper);if(floor)floor.visible=false;
const viewer=createAssetViewer(scene);
let forestReady=false;
let forestAsset=null;
const rig=new THREE.Group();scene.add(rig);
const hudCanvas=document.createElement('canvas');hudCanvas.width=1024;hudCanvas.height=256;
const hudCtx=hudCanvas.getContext('2d');
const hudTexture=new THREE.CanvasTexture(hudCanvas);
const hud=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.4),new THREE.MeshBasicMaterial({map:hudTexture,transparent:true,depthTest:false}));
hud.position.set(0,-.35,-1.7);hud.renderOrder=1000;rig.add(hud);
function setHud(message){hudCtx.clearRect(0,0,1024,256);hudCtx.fillStyle='rgba(5,10,17,.7)';hudCtx.fillRect(0,0,1024,256);hudCtx.fillStyle='#f0f6ff';hudCtx.textAlign='center';hudCtx.font='42px sans-serif';hudCtx.fillText(message.slice(0,48),512,145);hudTexture.needsUpdate=true;}
setHud('GAUSSIAN XR LAB · BOSQUE');
const selector=document.createElement('select');
selector.setAttribute('aria-label','Seleccionar asset');
selector.style.cssText='display:block;max-width:100%;padding:8px;margin-top:8px;background:#263b5c;color:white;border:1px solid #8296b8;border-radius:6px';
selector.add(new Option('Escena de demostración',''));
document.getElementById('ui').append(selector);
loadManifest().then(manifest=>{
 for(const [group,type] of [['panoramas','panorama'],['videos360','video360'],['models','model'],['splats','splat']]){
  for(const asset of manifest[group]||[]) {
   const option=new Option(asset.label||asset.id,JSON.stringify({...asset,type}));
   selector.add(option);
  }
 }
  const forest=[...selector.options].find(o=>o.text.includes('Bosque 3D'));
  if(forest){forestAsset=JSON.parse(forest.value);selector.value=forest.value;selector.dispatchEvent(new Event('change'));}
}).catch(e=>{console.warn('Manifest unavailable',e);status.textContent='Error al cargar catálogo: '+e.message;});
selector.onchange=async()=>{
 const demo=scene.getObjectByName('demo');
 if(!selector.value){viewer.clear();if(demo)demo.visible=true;return;}
 if(demo)demo.visible=false;
 try{await viewer.show(JSON.parse(selector.value));forestReady=true;status.textContent='Bosque cargado. Entrar en VR para explorar.';setHud('BOSQUE · MUEVE LA CABEZA PARA EXPLORAR');}
 catch(e){forestReady=false;status.textContent='Error de asset: '+e.message;setHud('ERROR AL CARGAR BOSQUE');console.error(e);}
};

const status=document.getElementById('status');
const vr=document.getElementById('vr'),mr=document.getElementById('mr'),exit=document.getElementById('exit');
let activeSession=null;
const xrSupported=!!navigator.xr && window.isSecureContext;
vr.onclick=()=>enter('immersive-vr');
mr.onclick=()=>enter('immersive-ar');
vr.disabled=!xrSupported;
mr.disabled=!xrSupported;
status.textContent=xrSupported
 ? 'Meta Quest: pulsa Entrar en VR o Entrar en MR. Si no inicia, aparecerá el motivo aquí.'
 : 'WebXR no disponible. Abre esta URL HTTPS en el navegador Meta Quest (no dentro de una vista previa).';
if(xrSupported){
 for(const [mode,button] of [['immersive-vr',vr],['immersive-ar',mr]]){
  navigator.xr.isSessionSupported(mode).then(supported=>{
   if(!supported){button.disabled=true;button.title=mode+' no disponible en este navegador';}
  }).catch(e=>console.warn('XR support check',mode,e));
 }
}
async function enter(mode){
  if(activeSession)return;
  try{
    status.textContent='Solicitando sesión '+mode+'…';
    setHud('INICIANDO EXPERIENCIA');
    const session=await navigator.xr.requestSession(mode,{optionalFeatures:['local-floor','hand-tracking']});
    activeSession=session;
    session.addEventListener('end',()=>{activeSession=null;scene.background=new THREE.Color(0x080c14);exit.disabled=true;document.getElementById('ui').style.display='block';status.textContent='Sesión XR finalizada.';});
    await renderer.xr.setSession(session);
    scene.background = mode==='immersive-ar' ? null : new THREE.Color(0x080c14);
    exit.disabled=false;
    setHud(forestReady?'BOSQUE · EXPLORA EN 360°':'CARGANDO ESCENA');
    document.getElementById('ui').style.display='none';
    status.textContent=mode==='immersive-ar'?'MR activa':'VR activa';
  }catch(e){status.textContent='No se pudo iniciar '+mode+': '+e.name+' — '+e.message;console.error(e);}
}
exit.onclick=()=>activeSession?.end();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
renderer.setAnimationLoop((time)=>{scene.getObjectByName('demo')?.rotation.set(time*.00013,time*.00023,0);rig.position.copy(renderer.xr.isPresenting?renderer.xr.getCamera().position:camera.position);renderer.render(scene,camera);});
