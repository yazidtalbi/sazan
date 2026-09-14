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
