import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SplatMesh } from '@sparkjsdev/spark';

export function createAssetViewer(scene){
 let current=null;
 function clear(){if(current){current.userData.video?.pause();scene.remove(current);current.traverse?.(o=>{if(o.isMesh){o.geometry?.dispose?.();o.material?.dispose?.();}});current.dispose?.();current=null;}}
 async function show(asset){
  clear();
  if(!asset)return;
  const url=new URL(asset.path,document.baseURI).href;
  if(asset.type==='panorama'){
   const texture=await new THREE.TextureLoader().loadAsync(url);
   texture.colorSpace=THREE.SRGBColorSpace;
   const sphere=new THREE.Mesh(new THREE.SphereGeometry(60,64,40),new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide,depthWrite:false}));
   current=sphere;scene.add(sphere);
  }else if(asset.type==='model'){
   const gltf=await new GLTFLoader().loadAsync(url);
   current=gltf.scene;current.position.set(0,0,-2);scene.add(current);
  }else if(asset.type==='video360'){
   const video=document.createElement('video');
   video.src=url;video.crossOrigin='anonymous';video.loop=true;video.muted=true;video.playsInline=true;
   await video.play();
   const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;
   current=new THREE.Mesh(new THREE.SphereGeometry(60,64,40),new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide,depthWrite:false}));
   current.userData.video=video;scene.add(current);
  }else if(asset.type==='splat'){
   current=new SplatMesh({url});current.position.set(0,0,0);scene.add(current);
  }else throw new Error('Unsupported asset type: '+asset.type);
 }
 return {show,clear:()=>{current?.userData.video?.pause();clear();}};
}
