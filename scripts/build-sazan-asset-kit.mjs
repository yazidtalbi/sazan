// Original modular flat-roof architecture, plus licensed source models.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, prune, meshopt, simplify } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { copyFile } from 'node:fs/promises';

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene();
const colors={stone:[.64,.60,.49,1],roof:[.64,.41,.29,1],wood:[.25,.20,.13,1],glass:[.10,.23,.24,1],foliage:[.22,.31,.12,1]};
const materials=Object.fromEntries(Object.entries(colors).map(([key,color])=>[key,doc.createMaterial(key).setBaseColorFactor(color).setMetallicFactor(0).setRoughnessFactor(.85)]));
function model(name,parts){
  const node=doc.createNode(name),mesh=doc.createMesh(name);scene.addChild(node);node.setMesh(mesh);
  for(const key of Object.keys(colors)){
    const pieces=parts.filter(p=>p[0]===key).map(([,x,y,z,w,h,d])=>new THREE.BoxGeometry(w,h,d).translate(x,y,z));
    if(!pieces.length)continue;
    const geometry=mergeGeometries(pieces);
    const primitive=doc.createPrimitive().setMaterial(materials[key]);
    for(const [source,target] of [['position','POSITION'],['normal','NORMAL']])primitive.setAttribute(target,doc.createAccessor().setType('VEC3').setArray(geometry.attributes[source].array).setBuffer(buffer));
    primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(geometry.index.array).setBuffer(buffer));mesh.addPrimitive(primitive);
    pieces.forEach(g=>g.dispose());geometry.dispose();
  }
}
for(let type=0;type<5;type++){
  const upper=type===1?.58:type===2?.78:type===3?.45:1;
  const parts=[['stone',0,.32,0,.97,.64,.97],['glass',0,.34,.489,.78,.28,.012],['roof',0,.66,0,1,.055,1]];
  if(type===2||type===4)parts.push(['stone',-.13,.80,-.15,.65,.24,.62],['roof',-.13,.94,-.15,.68,.035,.65]);
  // Roof parapets and terraces remain entirely within the registered roof.
  for(const z of [-.475,.475])parts.push(['stone',0,.73,z,1,.10,.045]);
  for(const x of [-.475,.475])parts.push(['stone',x,.73,0,.045,.10,.91]);
  if(type!==0){
    for(const x of [-.35,.12])for(const z of [-.3,.12])parts.push(['wood',x,.82,z,.022,.26,.022]);
    for(let i=0;i<7;i++)parts.push(['wood',-.35+i*.078,.965,-.09,.027,.025,.48]);
  }
  if(type===1||type===3)parts.push(['stone',.29,.735,-.32,.17,.09,.21],['foliage',.29,.81,-.32,.14,.06,.18]);
  if(type===3)parts.push(['wood',.20,.735,.23,.24,.04,.09],['stone',.20,.765,.23,.19,.025,.085]);
  // Different massing and roof treatment across the five reusable types.
  model(`villa-${type}`,parts.map(p=>[...p.slice(0,3),p[3]*upper,...p.slice(4,6),p[6]*upper]));
}
await doc.transform(dedup(),weld(),prune(),meshopt({encoder:MeshoptEncoder,level:'high'}));
await io.write('public/masterplan-3d/villa-kit.glb',doc);
// Source downloads are preserved locally to make optimization reproducible.
for(const name of ['house','yacht']){
  const source=`public/masterplan-3d/source-${name}.glb`;
  try{await copyFile(`/tmp/sazan-${name}.glb`,source);}catch{/* Use the checked-in source on subsequent builds. */}
  const asset=await io.read(source);
  if(name==='house'){
    // Remove the supplied rectangular lawn; it must never cover the masterplan.
    for(const mesh of asset.getRoot().listMeshes())for(const p of mesh.listPrimitives())if(p.getMaterial()?.getName()==='mat9')mesh.removePrimitive(p);
  }
  await asset.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.45,error:.001}),dedup(),prune(),meshopt({encoder:MeshoptEncoder,level:'high'}));
  await io.write(`public/masterplan-3d/${name}.glb`,asset);
}
console.log('Created the Meshopt-compressed villa kit, modern house and yacht.');
