import test from 'node:test';
import assert from 'node:assert/strict';
import { Texture } from 'three';
import { createClouds } from '../lib/masterplan-3d/clouds.js';

test('moving cloud shadows stay aligned with the sun and pause without jumping',()=>{
  const texture=new Texture(),clouds=createClouds(texture);
  for(const delta of [0,1,15,80,170]){
    clouds.update(delta);
    const mesh=clouds.group.children[0];
    assert.ok(Math.abs(clouds.state.shadowX-(mesh.position.x+65/120*mesh.position.y))<1e-8);
  }
  const time=clouds.state.time,position=clouds.group.children[0].position.clone();
  clouds.update(10,{motion:false});clouds.update(10,{reduced:true});
  assert.equal(clouds.state.time,time);assert.ok(position.equals(clouds.group.children[0].position));
  clouds.dispose();texture.dispose();
});

test('mobile reduces cloud geometry and cloud wraps fade outside the map',()=>{
  const texture=new Texture(),clouds=createClouds(texture,{mobile:true});
  assert.equal(clouds.group.children.length,2);
  clouds.update(235*(1-.29),{reduced:false});
  assert.ok(clouds.group.children[0].material.opacity<.000001);
  clouds.dispose();texture.dispose();
});
