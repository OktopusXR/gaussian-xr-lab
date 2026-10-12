import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createAssetViewer(scene){
 let current=null;
 function clear(){if(current){scene.remove(current);current=null;}}
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
   throw new Error('Gaussian Splat renderer pending integration. Asset registered but not rendered.');
  }else throw new Error('Unsupported asset type: '+asset.type);
 }
 return {show,clear:()=>{current?.userData.video?.pause();clear();}};
}
