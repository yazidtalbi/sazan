import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector2 } from 'three';
import { createCameraRig, mapPoint } from '../lib/masterplan-3d/camera.js';

function setup(width=1440,height=900){const camera=new PerspectiveCamera(38,1,.1,2500),rig=createCameraRig(camera);rig.resize(width,height);rig.setReduced(true);rig.step(1,false);return{camera,rig};}
test('full uncropped image fits desktop and portrait at an oblique angle',()=>{
  for(const [w,h] of [[1440,900],[390,844],[1920,1080]]){
    const {camera,rig}=setup(w,h);
    assert.ok(camera.isPerspectiveCamera);assert.equal(Math.round(rig.state.angle),58);
    for(const [u,v] of [[0,0],[1,0],[1,1],[0,1]]){const p=mapPoint(u,v).project(camera);assert.ok(Math.abs(p.x)<.95&&Math.abs(p.y)<.80);}
  }
});
test('dolly zoom preserves the world point under the pointer',()=>{
  const {rig}=setup(),pointer=new Vector2(.3,-.2),before=rig.worldAt(pointer);
  rig.zoom(2,pointer);rig.step(1,false);
  assert.ok(before.distanceTo(rig.worldAt(pointer))<.00001);assert.ok(rig.state.angle<58);
});
test('zoom clamps, fixed orientation, focus, and reset remain stable',()=>{
  const {rig,camera}=setup();rig.zoom(1e6);rig.step(1,false);
  assert.ok(rig.state.zoom<=1/.18+1e-6);assert.equal(camera.up.y,1);
  rig.focus(.8,.6);rig.step(1,false);assert.ok(Math.abs(rig.state.target[0]-60)<.0001);
  rig.reset();rig.step(1,false);assert.equal(rig.state.zoom,1);assert.deepEqual(rig.state.target,[0,0,0]);
  rig.zoom(.0001);rig.step(1,false);assert.equal(rig.state.zoom,1);
});

test('zoom has a slow launch and a long arrival in both directions',()=>{
  const {rig}=setup();rig.setReduced(false);
  for(const factor of [2,.5]){
    const start=rig.state.distance;rig.zoom(factor);
    const travel=Math.abs(Math.log(factor)),samples=[];
    for(let i=0;i<400;i++){rig.step(.01,false);samples.push(Math.abs(Math.log(rig.state.distance/start))/travel);}
    assert.ok(samples[9]<.02,'first 100ms should move less than 2%');
    assert.ok(samples[79]>.35&&samples[79]<.55,'gradual acceleration');
    assert.ok(samples[249]>.94&&samples[249]<.97,'long eased arrival');
    assert.ok(samples[399]>.99,'settles without a permanent lag');
    assert.ok(samples.every((value,i)=>!i||value>=samples[i-1]-1e-8),'no overshoot');
    for(let i=0;i<600;i++)rig.step(.01,false);
  }
});

test('FOV follows the eased dolly and the cursor stays anchored throughout',()=>{
  const {rig}=setup(),pointer=new Vector2(.18,-.15),anchor=rig.worldAt(pointer);
  rig.setReduced(false);rig.zoom(5.56,pointer);
  let previousFov=46;
  for(let i=0;i<500;i++){
    rig.step(.016,false);
    assert.ok(rig.state.fov<=previousFov+1e-6&&rig.state.fov>=32);
    assert.ok(anchor.distanceTo(rig.worldAt(pointer))<.0001,'focal point must not drift as FOV changes');
    previousFov=rig.state.fov;
  }
  assert.ok(Math.abs(rig.state.fov-32)<.001);
  assert.ok(Math.abs(rig.state.angle-34)<.001,'close view tilts down to 34 degrees');
  rig.reset();for(let i=0;i<500;i++)rig.step(.016,false);
  assert.ok(Math.abs(rig.state.fov-46)<.001);
  assert.ok(Math.abs(rig.state.angle-58)<.001);
});

test('continuous input retains momentum and easing is frame-rate independent',()=>{
  const a=setup().rig,b=setup().rig,slow=setup().rig;
  for(const rig of [a,b,slow]){rig.setReduced(false);rig.zoom(2);}
  for(let i=0;i<60;i++)a.step(1/60,false);
  for(let i=0;i<144;i++)b.step(1/144,false);
  slow.step(1,false);
  assert.ok(Math.abs(a.state.distance-b.state.distance)<1e-8);
  assert.ok(Math.abs(a.state.distance-slow.state.distance)<1e-8);
  const before=a.state.distance;a.zoom(1.2);a.step(1/60,false);
  assert.ok(before-a.state.distance>.1,'another wheel event must not restart the ease-in');
});
