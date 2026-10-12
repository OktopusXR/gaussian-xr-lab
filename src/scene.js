import * as THREE from 'three';
export function createDemoScene(scene){
 const light=new THREE.HemisphereLight(0xcde9ff,0x172035,2.5);scene.add(light);
 const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,2),new THREE.MeshStandardMaterial({color:0x69c9ee,wireframe:true,transparent:true,opacity:.9}));
 mesh.position.set(0,1.6,-2);mesh.name='demo';scene.add(mesh);
 const floor=new THREE.GridHelper(10,20,0x335574,0x1b3247);scene.add(floor);
 return mesh;
}
