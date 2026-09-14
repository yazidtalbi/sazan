import { PerspectiveCamera, Vector2, Vector3, Raycaster, Plane, MathUtils } from 'three';

export const MAP_WIDTH = 200;
export const MAP_DEPTH = MAP_WIDTH * 4248 / 8058;
export const mapPoint = (u, v, elevation = 0) => new Vector3((u - .5) * MAP_WIDTH, elevation, (v - .5) * MAP_DEPTH);
const OVERVIEW_FOV = 46;
const CLOSE_FOV = 32;
const ZOOM_RESPONSE = 1.9;

// Exact critically damped response: a slow launch, a long gentle arrival, and
// continuous velocity when wheel/trackpad events retarget an ongoing dolly.
function settle(value, velocity, destination, dt) {
  const offset = value - destination;
  const momentum = velocity + ZOOM_RESPONSE * offset;
  const decay = Math.exp(-ZOOM_RESPONSE * dt);
  return [destination + (offset + momentum * dt) * decay, (velocity - ZOOM_RESPONSE * momentum * dt) * decay];
}

/** Fixed bearing, no roll. Every zoom is a perspective-camera dolly. */
export function createCameraRig(camera) {
  const target = new Vector3(), desired = new Vector3(), sway = new Vector2(), pointer = new Vector2();
  const ray = new Raycaster(), plane = new Plane(new Vector3(0,1,0), 0);
  const scratch = new PerspectiveCamera();
  let overview = 190, distance = overview, wantedDistance = overview;
  let reduced = false, zoomVelocity = 0, zoomAnchor = null, cinematicTarget = false;
  const targetVelocity = new Vector3();
  const zoomProgress = d => MathUtils.clamp(Math.log(overview / d) / Math.log(1 / .18), 0, 1);
  // Lower the camera noticeably into the landscape as the eased zoom advances.
  const angle = d => MathUtils.degToRad(MathUtils.lerp(58, 34, MathUtils.smootherstep(zoomProgress(d), 0, 1)));
  const fieldOfView = d => {
    const progress = zoomProgress(d);
    return MathUtils.lerp(OVERVIEW_FOV, CLOSE_FOV, MathUtils.smootherstep(progress, 0, 1));
  };
  const pose = (cam, focus, d, offset = new Vector2()) => {
    const a = angle(d);
    const fov = fieldOfView(d);
    if (Math.abs(cam.fov - fov) > .000001) { cam.fov = fov; cam.updateProjectionMatrix(); }
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
    zoomVelocity=0;targetVelocity.set(0,0,0);zoomAnchor=null;
    distance=wantedDistance;target.copy(desired);pose(camera,target,distance);
  }
  function zoom(factor, ndc = new Vector2()) {
    const anchor=worldAt(ndc);
    scratch.copy(camera); pose(scratch,desired,wantedDistance);
    wantedDistance=MathUtils.clamp(wantedDistance/factor,overview*.18,overview);
    pose(scratch,desired,wantedDistance);
    const after=worldAt(ndc,scratch);
    if(anchor && after) desired.add(anchor.clone().sub(after));
    zoomAnchor=anchor?{point:anchor,ndc:ndc.clone()}:null;
    cinematicTarget=true;
    if(wantedDistance>overview*.98){desired.set(0,0,0);zoomAnchor=null;}
    bounds(desired);
  }
  return {
    resize, zoom, worldAt,
    setReduced(value) { reduced=value; },
    setPointer(x,y) { pointer.set(x,y); },
    pan(from,to) { zoomAnchor=null;cinematicTarget=false;targetVelocity.set(0,0,0);const a=worldAt(from),b=worldAt(to);if(a&&b){desired.add(a.sub(b));bounds(desired);} },
    nudge(x,z) { zoomAnchor=null;cinematicTarget=false;targetVelocity.set(0,0,0);desired.x+=x*distance*.03;desired.z+=z*distance*.03;bounds(desired); },
    reset() { zoomAnchor=null;cinematicTarget=true;wantedDistance=overview;desired.set(0,0,0);pointer.set(0,0); },
    focus(u,v) { zoomAnchor=null;cinematicTarget=true;desired.copy(mapPoint(u,v)); wantedDistance=overview*.35;bounds(desired); },
    step(dt,ambient) {
      if(reduced){distance=wantedDistance;zoomVelocity=0;target.copy(desired);targetVelocity.set(0,0,0);}
      else {
        // Logarithmic distance gives equally weighted easing in both directions.
        const [logDistance,velocity]=settle(Math.log(distance),zoomVelocity,Math.log(wantedDistance),dt);
        distance=MathUtils.clamp(Math.exp(logDistance),overview*.18,overview);zoomVelocity=velocity;
        if(distance===overview||distance===overview*.18)zoomVelocity=0;
        if(Math.abs(Math.log(distance/wantedDistance))<.00001&&Math.abs(zoomVelocity)<.0001){distance=wantedDistance;zoomVelocity=0;}
        if(cinematicTarget){
          for(const axis of ['x','z'])[target[axis],targetVelocity[axis]]=settle(target[axis],targetVelocity[axis],desired[axis],dt);
        }else target.lerp(desired,1-Math.exp(-4.5*dt));
      }
      // Solve the focal point every frame as both distance and lens change.
      // Interpolating just the start/end targets would drift across the map.
      if(zoomAnchor){
        scratch.copy(camera);pose(scratch,target,distance);
        const underPointer=worldAt(zoomAnchor.ndc,scratch);
        if(underPointer)target.add(zoomAnchor.point.clone().sub(underPointer));
        targetVelocity.set(0,0,0);
      }
      bounds(target);
      sway.lerp(ambient&&!reduced?pointer:new Vector2(),1-Math.exp(-1.5*dt));
      pose(camera,target,distance,sway.clone().multiplyScalar(.18*Math.min(1,distance/overview)));
      return overview/distance;
    },
    get state() { return { zoom:overview/distance, target:target.toArray(), distance, angle:MathUtils.radToDeg(angle(distance)), fov:camera.fov }; },
  };
}
