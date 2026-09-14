import { Group, Mesh, PlaneGeometry, MeshBasicMaterial, Vector2, Vector4, DoubleSide, MathUtils } from 'three';

// Sun direction matches the scene's daylight. Trace from each receiving surface
// towards the sun to intersect the cloud's actual elevated plane.
const shadowGLSL = `
uniform sampler2D sazanCloudTexture;
uniform vec4 sazanCloudPlanes[3];
uniform vec4 sazanCloudLayers[3];
uniform vec2 sazanSunSlope;
uniform float sazanCloudStrength;
varying vec3 sazanCloudWorld;
float sazanCloudAlpha(vec2 uv) {
  if(uv.x<0.0 || uv.x>1.0 || uv.y<0.0 || uv.y>1.0)return 0.0;
  return texture2D(sazanCloudTexture,uv).a;
}
float sazanCloudOcclusion(vec3 world) {
  float transmission=1.0;
  for(int i=0;i<3;i++) {
    vec4 cloud=sazanCloudPlanes[i];
    vec4 layer=sazanCloudLayers[i];
    if(layer.y<0.001)continue;
    vec2 projected=world.xz+sazanSunSlope*max(0.0,layer.x-world.y);
    vec2 uv=(projected-cloud.xy)/cloud.zw+0.5;
    uv.y=1.0-uv.y;
    vec2 blur=vec2(1.5)/cloud.zw;
    if(any(lessThan(uv,-blur)) || any(greaterThan(uv,vec2(1.0)+blur)))continue;
    float alpha=sazanCloudAlpha(uv)*0.4;
    alpha+=(sazanCloudAlpha(uv+vec2(blur.x,0.0))+sazanCloudAlpha(uv-vec2(blur.x,0.0))
      +sazanCloudAlpha(uv+vec2(0.0,blur.y))+sazanCloudAlpha(uv-vec2(0.0,blur.y)))*0.15;
    transmission*=1.0-alpha*layer.y*sazanCloudStrength;
  }
  return transmission;
}`;

export function createClouds(texture, { mobile = false } = {}) {
  const group = new Group();group.name='Sazan drifting clouds';
  const tracks = [
    { width:66, height:11, z:14, phase:.29, duration:235 },
    { width:54, height:15, z:-12, phase:.65, duration:280 },
    { width:45, height:8, z:29, phase:.83, duration:310 },
  ];
  const uniforms = {
    sazanCloudTexture:{value:texture},
    sazanCloudPlanes:{value:tracks.map(()=>new Vector4(0,0,1,1))},
    sazanCloudLayers:{value:tracks.map(()=>new Vector4())},
    sazanSunSlope:{value:new Vector2(-65/120,45/120)},
    sazanCloudStrength:{value:mobile?.21:.32},
  };
  const count=mobile?2:3;
  const meshes=tracks.slice(0,count).map(track=>{
    const geometry=new PlaneGeometry(track.width,track.width*576/1024);
    const material=new MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,side:DoubleSide});
    material.userData.sazanCloud=true;
    const mesh=new Mesh(geometry,material);mesh.rotation.x=-Math.PI/2;
    group.add(mesh);return mesh;
  });
  let time=0,fade=0;
  function update(dt,{motion=true,reduced=false,zoom=1}={}) {
    if(motion&&!reduced)time+=dt;
    // Atmospheric layers enter softly once loaded. Pause freezes their positions.
    fade=reduced?1:MathUtils.lerp(fade,1,1-Math.exp(-dt*.6));
    const closeFade=MathUtils.lerp(1,.35,MathUtils.smoothstep(zoom,2,5.56));
    tracks.forEach((track,i)=>{
      const pass=(time/track.duration+track.phase)%1;
      const x=-151+pass*302;
      const z=track.z+Math.sin(pass*Math.PI*2)*4;
      // Fade at the boundary before wrapping; no visible teleport or shadow pop.
      const edge=MathUtils.smoothstep(pass,0,.12)*(1-MathUtils.smoothstep(pass,.88,1));
      const density=i<count?edge*fade:0;
      uniforms.sazanCloudPlanes.value[i].set(x,z,track.width,track.width*576/1024);
      uniforms.sazanCloudLayers.value[i].set(track.height,density,0,0);
      if(meshes[i]){
        meshes[i].position.set(x,track.height,z);
        meshes[i].material.opacity=density*(mobile?.23:.36)*closeFade;
      }
    });
  }
  function applyTo(material) {
    if(material.userData.sazanCloud||material.userData.sazanCloudReceiver||!(material.isMeshBasicMaterial||material.isMeshStandardMaterial||material.isMeshLambertMaterial))return;
    const compile=material.onBeforeCompile,cacheKey=material.customProgramCacheKey();
    material.onBeforeCompile=function(shader,renderer){
      compile.call(this,shader,renderer);
      Object.assign(shader.uniforms,uniforms);
      shader.vertexShader='varying vec3 sazanCloudWorld;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
        vec4 cloudVertex=vec4(transformed,1.0);
        #ifdef USE_INSTANCING
          cloudVertex=instanceMatrix*cloudVertex;
        #endif
        sazanCloudWorld=(modelMatrix*cloudVertex).xyz;`);
      shader.fragmentShader=shadowGLSL+'\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`outgoingLight*=sazanCloudOcclusion(sazanCloudWorld);
        #include <opaque_fragment>`);
    };
    material.customProgramCacheKey=()=>`${cacheKey}|sazan-cloud-shadows-v1`;
    material.userData.sazanCloudReceiver=true;material.needsUpdate=true;
  }
  update(0);
  return {
    group,update,applyTo,
    get state(){return {time,count,shadowX:uniforms.sazanCloudPlanes.value[0].x-uniforms.sazanSunSlope.value.x*tracks[0].height};},
    dispose(){meshes.forEach(mesh=>{mesh.geometry.dispose();mesh.material.dispose();});group.removeFromParent();},
  };
}
