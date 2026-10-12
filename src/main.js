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
const viewer=createAssetViewer(scene);
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
}).catch(e=>console.warn('Manifest unavailable',e));
selector.onchange=async()=>{
 const demo=scene.getObjectByName('demo');
 if(!selector.value){viewer.clear();if(demo)demo.visible=true;return;}
 if(demo)demo.visible=false;
 try{await viewer.show(JSON.parse(selector.value));status.textContent='Asset cargado.';}
 catch(e){status.textContent='Error de asset: '+e.message;console.error(e);}
};

const status=document.getElementById('status');
const vr=document.getElementById('vr'),mr=document.getElementById('mr'),exit=document.getElementById('exit');
let activeSession=null;
const xrSupported=!!navigator.xr;
if(xrSupported){
  for(const [mode,button] of [['immersive-vr',vr],['immersive-ar',mr]]){
    try {button.disabled=!(await navigator.xr.isSessionSupported(mode));}
    catch(e){console.warn(mode,e);}
    button.onclick=()=>enter(mode);
  }
}
status.textContent=xrSupported?'WebXR detectado; selecciona un modo compatible.':'Vista 3D disponible. WebXR no detectado.';
async function enter(mode){
  if(activeSession)return;
  try{
    const session=await navigator.xr.requestSession(mode,{optionalFeatures:['local-floor','bounded-floor','hand-tracking','layers']});
    activeSession=session;
    session.addEventListener('end',()=>{activeSession=null;scene.background=new THREE.Color(0x080c14);exit.disabled=true;status.textContent='Sesión XR finalizada.';});
    await renderer.xr.setSession(session);
    scene.background = mode==='immersive-ar' ? null : new THREE.Color(0x080c14);
    exit.disabled=false;
    status.textContent=mode==='immersive-ar'?'MR activa':'VR activa';
  }catch(e){status.textContent='No se pudo iniciar XR: '+e.message;console.error(e);}
}
exit.onclick=()=>activeSession?.end();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
renderer.setAnimationLoop((time)=>{scene.getObjectByName('demo')?.rotation.set(time*.00013,time*.00023,0);renderer.render(scene,camera);});
