import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import zones from '@/lib/masterplan3-zones.json';
import { createCameraRig, MAP_WIDTH, MAP_DEPTH, mapPoint } from './camera';

const ASSETS='/masterplan-3d/';
const waterVertex=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const waterFragment=`
uniform sampler2D mask; uniform float time; uniform float strength; varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
void main(){
  float water=texture2D(mask,vUv).r; if(water<.04)discard;
  float ripple=sin(vUv.x*920.+vUv.y*730.+time*.34)*sin(vUv.x*513.-vUv.y*980.-time*.26);
  float glitter=pow(max(0.,ripple),10.)*smoothstep(.65,.94,noise(vUv*vec2(910.,715.)+time*.035));
  float trail=exp(-pow((vUv.x-.27-vUv.y*.26)/.17,2.));
  gl_FragColor=vec4(vec3(.95,.94,.79),water*glitter*trail*.16*strength);
  #include <colorspace_fragment>
}`;

export function mountMasterplan({host,markers,zoomLabel,zone,locations,getSelected,onReady,onError,onQuality,reduced}) {
  let disposed=false,frame=0,ready=false,motion=true,last=0,elapsed=0,detailLoaded=false,textureRequested=false;
  let width=1,height=1,data,terrain,baseMaterial,shadowSurface,waterMaterial,overviewTexture,highTexture,renderer;
  const mobile=window.matchMedia('(pointer: coarse)').matches||window.innerWidth<700;
  const abort=new AbortController(),scene=new THREE.Scene(),textures=new Set(),bitmaps=new Set(),geometries=new Set(),materials=new Set();
  const camera=new THREE.PerspectiveCamera(38,1,.1,2500),rig=createCameraRig(camera);
  rig.setReduced(reduced);
  const details=new THREE.Group(),architecture=new THREE.Group(),landscape=new THREE.Group();
  scene.add(architecture,landscape,details);
  scene.background=new THREE.Color('#073e49');
  const directional=new THREE.DirectionalLight('#fff3dc',2.2);
  directional.position.set(-65,120,45);directional.castShadow=!mobile;
  directional.shadow.mapSize.set(2048,2048);
  Object.assign(directional.shadow.camera,{left:-105,right:105,top:70,bottom:-70,near:1,far:280});
  directional.shadow.bias=-.00015;directional.shadow.normalBias=.06;directional.shadow.radius=3;
  scene.add(new THREE.HemisphereLight('#e1eff3','#b9af88',2),directional);
  try {
    renderer=new THREE.WebGLRenderer({antialias:!mobile,alpha:false,powerPreference:mobile?'low-power':'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,mobile?1.35:1.8));
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
    renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
    host.appendChild(renderer.domElement);
  } catch { queueMicrotask(onError); return {dispose(){},reset(){},focus(){},zoom(){},setMotion(){},setReduced(){}}; }
  const trackGeometry=g=>{geometries.add(g);return g;};
  const trackMaterial=m=>{materials.add(m);return m;};
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  async function fetchFile(url,type) {
    const response=await fetch(url,{signal:abort.signal});
    if(!response.ok)throw new Error(`Asset ${url}: ${response.status}`);
    return response[type]();
  }
  async function texture(url,isColor=true) {
    const blob=await fetchFile(url,'blob');
    const bitmap=await createImageBitmap(blob,{imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'none'});
    if(disposed){bitmap.close();throw new Error('Scene disposed');}
    bitmaps.add(bitmap);
    const t=new THREE.Texture(bitmap);t.flipY=false;t.colorSpace=isColor?THREE.SRGBColorSpace:THREE.NoColorSpace;
    t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;textures.add(t);return t;
  }
  async function glb(name) {
    const bytes=await fetchFile(ASSETS+name,'arrayBuffer');
    const result=await loader.parseAsync(bytes,ASSETS);
    result.scene.traverse(o=>{if(o.isMesh){trackGeometry(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(trackMaterial);}});
    if(disposed){release();throw new Error('Scene disposed');}
    return result.scene;
  }
  function elevation(u,v) {
    if(!data)return 0;
    const grid=data.terrain,x=THREE.MathUtils.clamp(u*(grid.width-1),0,grid.width-1),y=THREE.MathUtils.clamp(v*(grid.height-1),0,grid.height-1);
    const ix=Math.floor(x),iy=Math.floor(y),nx=Math.min(ix+1,grid.width-1),ny=Math.min(iy+1,grid.height-1);
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(grid.values[iy*grid.width+ix],grid.values[iy*grid.width+nx],x-ix),THREE.MathUtils.lerp(grid.values[ny*grid.width+ix],grid.values[ny*grid.width+nx],x-ix),y-iy)/1000;
  }
  function makeTerrain(map,mask) {
    const geometry=trackGeometry(new THREE.PlaneGeometry(MAP_WIDTH,MAP_DEPTH,mobile?256:512,mobile?135:270));
    geometry.rotateX(-Math.PI/2);
    const positions=geometry.attributes.position,uvs=geometry.attributes.uv;
    for(let i=0;i<positions.count;i++)positions.setY(i,elevation(uvs.getX(i),1-uvs.getY(i)));
    positions.needsUpdate=true;geometry.computeVertexNormals();
    // No UV warping: every source pixel retains its exact planar coordinate.
    baseMaterial=trackMaterial(new THREE.MeshBasicMaterial({map}));
    terrain=new THREE.Mesh(geometry,baseMaterial);scene.add(terrain);
    shadowSurface=new THREE.Mesh(geometry,trackMaterial(new THREE.ShadowMaterial({opacity:.17,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})));
    shadowSurface.receiveShadow=true;scene.add(shadowSurface);
    waterMaterial=trackMaterial(new THREE.ShaderMaterial({vertexShader:waterVertex,fragmentShader:waterFragment,uniforms:{mask:{value:mask},time:{value:0},strength:{value:mobile?.4:1}},transparent:true,depthWrite:false}));
    const water=new THREE.Mesh(trackGeometry(new THREE.PlaneGeometry(MAP_WIDTH,MAP_DEPTH)),waterMaterial);
    water.rotation.x=-Math.PI/2;water.position.y=.018;scene.add(water);
  }
  // Sample the same source pixels on roof surfaces. Side walls provide depth;
  // the plan's roof artwork and footprint orientation remain visible overhead.
  function projectedRoof(material) {
    const m=new THREE.MeshBasicMaterial();trackMaterial(m);
    m.onBeforeCompile=shader=>{
      shader.uniforms.planMap={value:highTexture||overviewTexture};
      m.userData.shader=shader;
      shader.vertexShader='varying vec3 planPosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
        vec4 planVertex=vec4(transformed,1.0);
        #ifdef USE_INSTANCING
          planVertex=instanceMatrix*planVertex;
        #endif
        planPosition=(modelMatrix*planVertex).xyz;`);
      shader.fragmentShader='uniform sampler2D planMap; varying vec3 planPosition;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec2 planUv=vec2(planPosition.x/${MAP_WIDTH.toFixed(6)}+.5,.5-planPosition.z/${MAP_DEPTH.toFixed(6)});
        diffuseColor.rgb=texture2D(planMap,planUv).rgb;`);
    };
    m.customProgramCacheKey=()=> 'sazan-registered-roofs';return m;
  }
  function instances(root,placements,parent,roofProjection=false) {
    root.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
    const normalize=new THREE.Matrix4().makeScale(1/(size.x||1),1/(size.y||1),1/(size.z||1)).multiply(new THREE.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z));
    root.traverse(source=>{
      if(!source.isMesh||!placements.length)return;
      const geometry=trackGeometry(source.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(normalize,source.matrixWorld)));
      let material=source.material;
      if(roofProjection&&material.name==='roof')material=projectedRoof(material);
      const mesh=new THREE.InstancedMesh(geometry,material,placements.length),dummy=new THREE.Object3D();
      placements.forEach((p,i)=>{
        dummy.position.copy(mapPoint(p.u,p.v,elevation(p.u,p.v)+.018));dummy.rotation.set(0,-p.angle,0);dummy.scale.set(p.w*MAP_WIDTH,p.h,p.d*MAP_DEPTH);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=!mobile;mesh.receiveShadow=true;mesh.computeBoundingSphere();
      (roofProjection&&['wood','foliage','glass'].includes(source.material.name)?details:parent).add(mesh);
    });
  }
  function plantTrees() {
    const trunk=trackGeometry(new THREE.CylinderGeometry(.025,.04,.42,5).translate(0,.21,0));
    const crown=trackGeometry(new THREE.IcosahedronGeometry(.22,1).scale(1,1.18,.88).translate(0,.5,0));
    const crowns=trackGeometry(new THREE.IcosahedronGeometry(.23,0).scale(1.15,.65,1.05).translate(0,.52,0));
    const trunkMaterial=trackMaterial(new THREE.MeshLambertMaterial({color:'#625746'}));
    const leafMaterial=trackMaterial(new THREE.MeshLambertMaterial({color:'#64704c'}));
    const trees=data.trees.filter((_,i)=>!mobile||i%3===0),dummy=new THREE.Object3D(),color=new THREE.Color();
    [trunk,crown,crowns].forEach((geometry,variant)=>{
      const selected=variant===0?trees:trees.filter(t=>variant===1?t[4]<2:t[4]>=2);
      const mesh=new THREE.InstancedMesh(geometry,variant===0?trunkMaterial:leafMaterial,selected.length);
      selected.forEach(([u,v,s,angle,type],i)=>{
        dummy.position.copy(mapPoint(u,v,elevation(u,v)));dummy.rotation.set(0,angle,0);dummy.scale.setScalar(s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
        if(variant){color.setHSL(.20+type*.012,.20+type*.04,.24+type*.025);mesh.setColorAt(i,color);}
      });mesh.castShadow=!mobile;mesh.computeBoundingSphere();landscape.add(mesh);
    });
    // Lightweight palms: instanced trunks and five tapered fronds per crown.
    const palms=trees.filter(t=>t[4]===0),palmTrunk=new THREE.InstancedMesh(trunk,trunkMaterial,palms.length);
    const frondGeometry=trackGeometry(new THREE.ConeGeometry(.10,.42,3).rotateZ(Math.PI/2).translate(.16,0,0));
    const fronds=new THREE.InstancedMesh(frondGeometry,leafMaterial,palms.length*5);
    palms.forEach(([u,v,s,a],i)=>{
      const p=mapPoint(u,v,elevation(u,v));dummy.position.copy(p);dummy.rotation.set(0,a,0);dummy.scale.set(s*.7,s*1.6,s*.7);dummy.updateMatrix();palmTrunk.setMatrixAt(i,dummy.matrix);
      for(let j=0;j<5;j++){dummy.position.copy(p).add(new THREE.Vector3(0,.7*s,0));dummy.scale.setScalar(s);dummy.rotation.set(.12,a+j*Math.PI*2/5,-.16);dummy.updateMatrix();fronds.setMatrixAt(i*5+j,dummy.matrix);}
    });details.add(palmTrunk,fronds);
  }
  function buildMarinaAndResorts() {
    const concrete=trackMaterial(new THREE.MeshLambertMaterial({color:'#c4bca5'}));
    const roof=projectedRoof(concrete);
    // Pier centerlines measured in the inspection crop (7000,800,850,1050).
    const piers=[[[400,508],[610,410],8],[[445,484],[397,343],6],[[557,434],[488,286],5],[[548,432],[617,581],5],[[468,480],[508,596],5],[[424,606],[530,557],5]];
    for(const [a,b,pixels] of piers){
      const p=mapPoint((7000+a[0])/8058,(800+a[1])/4248),q=mapPoint((7000+b[0])/8058,(800+b[1])/4248);
      const length=p.distanceTo(q),center=p.clone().add(q).multiplyScalar(.5);
      const mesh=new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(pixels/8058*MAP_WIDTH,.07,length)),[concrete,concrete,roof,concrete,concrete,concrete]);
      mesh.position.copy(center);mesh.position.y=.12;mesh.rotation.y=Math.atan2(q.x-p.x,q.z-p.z);mesh.castShadow=!mobile;architecture.add(mesh);
    }
    // These are the three individually registered oval hotel roofs, not new
    // buildings. Their existing artwork is projected onto the raised slabs.
    const ovals=[[258,356,63,32,.16,.65],[410,312,32,73,-.12,.95],[494,405,43,24,.06,.55]];
    for(const [cx,cy,rx,ry,angle,h] of ovals){
      const u=(5900+cx*1.3)/8058,v=(1700+cy*1.3)/4248;
      const geometry=trackGeometry(new THREE.CylinderGeometry(1,1,h,48));
      const mesh=new THREE.Mesh(geometry,[concrete,roof,concrete]);
      mesh.position.copy(mapPoint(u,v,elevation(u,v)+h*.5));mesh.scale.set(rx*1.3/8058*MAP_WIDTH,1,ry*1.3/4248*MAP_DEPTH);mesh.rotation.y=-angle;mesh.castShadow=!mobile;architecture.add(mesh);
    }
    // The waterfront pools already visible in the source crop (800,2600).
    // Their color is sampled from the plan; only basin edge depth is added.
    for(const [x,y,w,d] of [[365,613,31,9],[439,606,30,9],[514,612,29,10],[584,606,29,9],[660,593,29,9]]){
      const u=(800+x/.75)/8058,v=(2600+y/.75)/4248;
      const mesh=new THREE.Mesh(trackGeometry(new THREE.BoxGeometry(w/.75/8058*MAP_WIDTH,.045,d/.75/4248*MAP_DEPTH)),[concrete,concrete,roof,concrete,concrete,concrete]);
      mesh.position.copy(mapPoint(u,v,elevation(u,v)+.027));details.add(mesh);
    }
  }
  async function loadDetails() {
    const results=await Promise.allSettled([glb('villa-kit.glb'),glb('house.glb'),glb('yacht.glb')]);
    if(disposed)return;
    if(results[0].status==='fulfilled'){
      const kit=results[0].value;
      const imported=results[1].status==='fulfilled'?data.buildings.filter(b=>b.w>.0048&&b.d>.006).filter((_,i)=>i%7===0):[];
      for(let type=0;type<5;type++){
        const root=kit.getObjectByName(`villa-${type}`);
        if(root)instances(root,data.buildings.filter(b=>b.type===type&&!imported.includes(b)).map(b=>({...b,h:Math.min(.7,Math.max(.24,b.w*MAP_WIDTH*.42))})),architecture,true);
      }
    }
    if(results[1].status==='fulfilled'){
      // Selected larger footprints; keep imported structures inside their roofs.
      const selected=data.buildings.filter(b=>b.w>.0048&&b.d>.006).filter((_,i)=>i%7===0);
      instances(results[1].value,selected.map(b=>({...b,h:.50})),architecture);
    }
    if(results[2].status==='fulfilled'){
      // Individual white hulls traced in the northeast marina; no random boats.
      const boats=[[7502/8058,1568/4248,27/8058,78/4248,-.38],[7538/8058,1556/4248,23/8058,71/4248,-.38],[7608/8058,1531/4248,27/8058,68/4248,-.40]];
      instances(results[2].value,boats.map(([u,v,w,d,angle])=>({u,v,w,d,angle,h:.085})),architecture);
    }
    plantTrees();buildMarinaAndResorts();detailLoaded=true;
    if(results.some(r=>r.status==='rejected'))onQuality('Some model details are unavailable');
    renderer.shadowMap.needsUpdate=true;
  }
  function resize(){
    const rect=host.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    renderer.setSize(width,height);rig.resize(width,height);
  }
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const ndc=(x,y)=>{const rect=host.getBoundingClientRect();return new THREE.Vector2((x-rect.left)/width*2-1,-(y-rect.top)/height*2+1);};
  const surface=host.parentElement;
  const isMapTarget=e=>host.contains(e.target)||markers.some(marker=>marker?.contains(e.target));
  const pointers=new Map();let pinch=0,drag=null,gestureMoved=false;
  function pointerDown(e){
    if(!ready||e.button>0||!isMapTarget(e))return;
    if(!pointers.size)gestureMoved=false;
    host.focus({preventScroll:true});
    // Marker touches join the same gesture without swallowing a simple tap.
    // Their implicit pointer capture still bubbles through the shared surface.
    if(host.contains(e.target))host.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    drag=ndc(e.clientX,e.clientY);
    if(pointers.size===2){gestureMoved=true;const [a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}
  }
  function pointerMove(e){
    if(!ready)return;
    const point=ndc(e.clientX,e.clientY);
    if(!mobile&&isMapTarget(e))rig.setPointer(point.x,point.y);
    if(!pointers.has(e.pointerId))return;
    const previous=pointers.get(e.pointerId);
    if(Math.hypot(previous.x-e.clientX,previous.y-e.clientY)>3)gestureMoved=true;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){
      const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);
      if(pinch>0)rig.zoom(distance/pinch,ndc((a.x+b.x)/2,(a.y+b.y)/2));pinch=distance;drag=null;
    }else if(drag){rig.pan(drag,point);drag=point;}
  }
  function pointerUp(e){
    pointers.delete(e.pointerId);pinch=0;
    const remaining=[...pointers.values()][0];drag=remaining?ndc(remaining.x,remaining.y):null;
    if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);
  }
  function wheel(e){if(!ready||!isMapTarget(e))return;e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?height:1);rig.zoom(Math.exp(-THREE.MathUtils.clamp(delta,-160,160)*(e.ctrlKey?.005:.0015)),ndc(e.clientX,e.clientY));}
  function keydown(e){
    if(!ready)return;
    const actions={'+':()=>rig.zoom(1.25),'=':()=>rig.zoom(1.25),'-':()=>rig.zoom(.8),Home:()=>rig.reset(),ArrowLeft:()=>rig.nudge(-1,0),ArrowRight:()=>rig.nudge(1,0),ArrowUp:()=>rig.nudge(0,-1),ArrowDown:()=>rig.nudge(0,1)};
    if(actions[e.key]){e.preventDefault();actions[e.key]();}
  }
  const leave=()=>rig.setPointer(0,0);
  const contextLost=e=>{e.preventDefault();ready=false;cancelAnimationFrame(frame);onError();};
  const handlers={pointerdown:pointerDown,pointermove:pointerMove,pointerup:pointerUp,pointercancel:pointerUp,lostpointercapture:pointerUp,pointerleave:leave,wheel};
  const suppressGestureClick=e=>{if(gestureMoved&&isMapTarget(e)){e.preventDefault();e.stopPropagation();gestureMoved=false;}};
  Object.entries(handlers).forEach(([event,fn])=>surface.addEventListener(event,fn,event==='wheel'?{passive:false}:undefined));
  surface.addEventListener('click',suppressGestureClick,true);host.addEventListener('keydown',keydown);
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  function project(u,v){return mapPoint(u,v,elevation(u,v)+.55).project(camera);}
  function animate(now){
    if(disposed||!ready)return;
    frame=requestAnimationFrame(animate);
    if(document.hidden){last=now;return;}
    const dt=Math.min(.05,(now-(last||now))/1000);last=now;elapsed+=dt;
    const zoom=rig.step(dt,motion&&!mobile);
    host.parentElement.style.setProperty('--intro-opacity',String(THREE.MathUtils.clamp(2.2-zoom,0,1)));
    waterMaterial.uniforms.time.value=reduced||!motion?0:elapsed;
    waterMaterial.uniforms.strength.value=reduced||!motion?0:mobile?.3:1;
    details.visible=detailLoaded&&zoom>1.9;
    const selected=getSelected();
    locations.forEach((location,i)=>{
      const p=project(...location.anchor),x=(p.x*.5+.5)*width,y=(-p.y*.5+.5)*height;
      const visible=p.z>-1&&p.z<1&&x>15&&x<width-15&&y>85&&y<height-(mobile?205:120);
      if(markers[i]){
        markers[i].style.transform=`translate3d(${x-15}px,${y-15}px,0)`;
        markers[i].style.visibility=visible?'':'hidden';
        markers[i].tabIndex=visible?0:-1;
      }
    });
    if(selected!==null){
      const paths=zones[selected]||[];
      zone.setAttribute('d',paths.map(polygon=>polygon.map(([u,v],i)=>{const p=project(u,v);return`${i?'L':'M'}${((p.x*.5+.5)*width).toFixed(1)},${((-p.y*.5+.5)*height).toFixed(1)}`;}).join(' ')+'Z').join(' '));
    }else zone.setAttribute('d','');
    zoomLabel.textContent=`${zoom.toFixed(1)}×`;
    if(!textureRequested&&!mobile&&zoom>2&&renderer.capabilities.maxTextureSize>=8192&&!navigator.connection?.saveData){
      textureRequested=true;onQuality('Bringing the details into focus…');
      texture(ASSETS+'map-8k.webp').then(t=>{
        if(disposed)return;
        highTexture=t;baseMaterial.map=t;baseMaterial.needsUpdate=true;
        materials.forEach(m=>{if(m.userData.shader)m.userData.shader.uniforms.planMap.value=t;});
        onQuality('');
      }).catch(()=>{if(!disposed)onQuality('Standard detail');});
    }
    renderer.render(scene,camera);
    if(Math.floor(now/250)!==Math.floor((now-dt*1000)/250)){
      host.dataset.zoom=zoom.toFixed(3);host.dataset.angle=rig.state.angle.toFixed(2);
      host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.triangles=String(renderer.info.render.triangles);
    }
  }
  Promise.all([fetchFile(ASSETS+'registration.json','json'),texture(ASSETS+'map-4k.webp'),texture('/masterplan/island-water-mask.png',false)]).then(([registration,map,mask])=>{
    if(disposed)return;data=registration;overviewTexture=map;makeTerrain(map,mask);ready=true;
    rig.step(1,false);renderer.render(scene,camera);onReady();frame=requestAnimationFrame(animate);
    loadDetails().catch(()=>{if(!disposed)onQuality('Some model details are unavailable');});
  }).catch(error=>{if(!disposed&&error.name!=='AbortError'){onError();}});
  function release(){
    scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));if(o.isInstancedMesh)o.dispose();});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());bitmaps.forEach(b=>b.close());
    geometries.clear();materials.clear();textures.clear();bitmaps.clear();
  }
  return {
    zoom:factor=>rig.zoom(factor),reset:()=>rig.reset(),focus:(u,v)=>rig.focus(u,v),
    setMotion:value=>{motion=value;},setReduced:value=>{reduced=value;rig.setReduced(value);},
    dispose(){
      disposed=true;ready=false;abort.abort();cancelAnimationFrame(frame);observer.disconnect();
      Object.entries(handlers).forEach(([event,fn])=>surface.removeEventListener(event,fn));
      surface.removeEventListener('click',suppressGestureClick,true);host.removeEventListener('keydown',keydown);
      renderer.domElement.removeEventListener('webglcontextlost',contextLost);
      directional.shadow.dispose();release();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
      markers.forEach(marker=>{if(marker){marker.style.visibility='';marker.style.transform='';}});zone.setAttribute('d','');
    },
  };
}
