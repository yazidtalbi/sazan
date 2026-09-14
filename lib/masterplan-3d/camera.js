import { PerspectiveCamera, Vector2, Vector3, Raycaster, Plane, MathUtils } from 'three';

export const MAP_WIDTH = 200;
export const MAP_DEPTH = MAP_WIDTH * 4248 / 8058;
export const mapPoint = (u, v, elevation = 0) => new Vector3((u - .5) * MAP_WIDTH, elevation, (v - .5) * MAP_DEPTH);

/** Fixed bearing, no roll. Every zoom is a perspective-camera dolly. */
export function createCameraRig(camera) {
  const target = new Vector3(), desired = new Vector3(), sway = new Vector2(), pointer = new Vector2();
  const ray = new Raycaster(), plane = new Plane(new Vector3(0,1,0), 0);
  const scratch = new PerspectiveCamera();
  let overview = 190, distance = overview, wantedDistance = overview;
  let reduced = false;
  const angle = d => MathUtils.degToRad(MathUtils.lerp(47, 58, MathUtils.clamp((d / overview - .18) / .82, 0, 1)));
  const pose = (cam, focus, d, offset = new Vector2()) => {
    const a = angle(d);
    cam.position.set(focus.x + offset.x, d * Math.sin(a), focus.z + d * Math.cos(a) + offset.y);
    cam.lookAt(focus); cam.updateMatrixWorld();
  };
  const bounds = focus => { focus.x = MathUtils.clamp(focus.x, -MAP_WIDTH*.48, MAP_WIDTH*.48); focus.z = MathUtils.clamp(focus.z,-MAP_DEPTH*.47,MAP_DEPTH*.47); };
  function worldAt(ndc, cam = camera) {
    ray.setFromCamera(ndc,cam);
    return ray.ray.intersectPlane(plane,new Vector3());
  }
  function resize(width,height) {
    const ratio = wantedDistance / overview;
    camera.aspect = width/height; camera.updateProjectionMatrix();
    scratch.copy(camera);
    let lo=50,hi=1300;
    // Contain the entire original image on portrait as well as landscape.
    for(let i=0;i<24;i++) {
      const d=(lo+hi)/2;
      overview=d; pose(scratch,new Vector3(),d);
      const fits=[[0,0],[1,0],[0,1],[1,1]].every(([u,v])=>{const p=mapPoint(u,v).project(scratch);return Math.abs(p.x)<.94 && Math.abs(p.y)<.79;});
      if(fits)hi=d;else lo=d;
    }
    overview=hi;
    wantedDistance=overview*MathUtils.clamp(ratio,.18,1);
    distance=wantedDistance; pose(camera,target,distance);
  }
  function zoom(factor, ndc = new Vector2()) {
    scratch.copy(camera); pose(scratch,desired,wantedDistance);
    const before=worldAt(ndc,scratch);
    wantedDistance=MathUtils.clamp(wantedDistance/factor,overview*.18,overview);
    pose(scratch,desired,wantedDistance);
    const after=worldAt(ndc,scratch);
    if(before && after) desired.add(before.sub(after));
    if(wantedDistance>overview*.98)desired.set(0,0,0);
    bounds(desired);
  }
  return {
    resize, zoom, worldAt,
    setReduced(value) { reduced=value; },
    setPointer(x,y) { pointer.set(x,y); },
    pan(from,to) { const a=worldAt(from),b=worldAt(to);if(a&&b){desired.add(a.sub(b));bounds(desired);} },
    nudge(x,z) { desired.x+=x*distance*.03;desired.z+=z*distance*.03;bounds(desired); },
    reset() { wantedDistance=overview;desired.set(0,0,0);pointer.set(0,0); },
    focus(u,v) { desired.copy(mapPoint(u,v)); wantedDistance=overview*.35;bounds(desired); },
    step(dt,ambient) {
      const ease=reduced?1:1-Math.exp(-4.5*dt);
      distance=MathUtils.lerp(distance,wantedDistance,ease);target.lerp(desired,ease);
      sway.lerp(ambient&&!reduced?pointer:new Vector2(),1-Math.exp(-1.5*dt));
      pose(camera,target,distance,sway.clone().multiplyScalar(.18*Math.min(1,distance/overview)));
      return overview/distance;
    },
    get state() { return { zoom:overview/distance, target:target.toArray(), distance, angle:MathUtils.radToDeg(angle(distance)) }; },
  };
}
