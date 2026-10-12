import * as THREE from 'three';
import { createDemoScene } from './scene.js';
import { loadManifest } from './assets.js';

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
loadManifest().then(m=>console.info('XR assets manifest',m)).catch(console.warn);

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
    session.addEventListener('end',()=>{activeSession=null;exit.disabled=true;status.textContent='Sesión XR finalizada.';});
    await renderer.xr.setSession(session);
    exit.disabled=false;
    status.textContent=mode==='immersive-ar'?'MR activa':'VR activa';
  }catch(e){status.textContent='No se pudo iniciar XR: '+e.message;console.error(e);}
}
exit.onclick=()=>activeSession?.end();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
renderer.setAnimationLoop((time)=>{scene.getObjectByName('demo')?.rotation.set(time*.00013,time*.00023,0);renderer.render(scene,camera);});
