import { test, expect } from '@playwright/test';

test('desktop scene, every destination, keyboard navigation, and reset',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/masterplan-3d');
  const scene=page.getByRole('region',{name:/Interactive island/});
  await expect(scene).toHaveAttribute('data-zoom',/1\.000/,{timeout:30000});
  await expect(page.getByRole('button',{name:'Zoom in',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Explore South Beach & Hill Estate',exact:true}).click();
  await expect(page.locator('#island-location-details h2')).toHaveText('South Beach & Hill Estate');
  await page.getByRole('button',{name:'Close location details'}).click();
  const selector=page.getByRole('combobox',{name:'Explore a location'});
  expect(await selector.locator('option').count()).toBe(11);
  for(let i=0;i<10;i++){
    await selector.selectOption(String(i));
    await expect(page.locator('#island-location-details h2')).toHaveText((await selector.locator(`option[value="${i}"]`).innerText()).replace(/^\d+ — /,''));
  }
  await page.getByRole('button',{name:'Close location details'}).click();
  await page.getByRole('button',{name:'Reset view'}).click();
  await expect(scene).toHaveAttribute('data-zoom',/1\.00[0-5]/,{timeout:20000});
  await scene.focus();await page.keyboard.press('+');
  await expect.poll(async()=>Number(await scene.getAttribute('data-zoom'))).toBeGreaterThan(1.15);
  expect(Number(await scene.getAttribute('data-fov'))).toBeLessThan(46);
  expect(Number(await scene.getAttribute('data-angle'))).toBeLessThan(58);
  await page.keyboard.press('Home');await expect(scene).toHaveAttribute('data-zoom',/1\.00[0-5]/,{timeout:20000});
  expect(Number(await scene.getAttribute('data-fov'))).toBeCloseTo(46,1);
  await page.getByRole('link',{name:'Masterplan',exact:true}).click();
  await expect(page).toHaveURL(/\/masterplan$/,{timeout:15000});
  await expect(page.locator('[data-zoom]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('clouds drift with their shadows, pause, and respect reduced motion',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/masterplan-3d');
  const scene=page.getByRole('region',{name:/Interactive island/});
  await expect(scene).toHaveAttribute('data-cloud-count','3',{timeout:30000});
  const firstShadow=Number(await scene.getAttribute('data-cloud-shadow-x'));
  await expect.poll(async()=>Number(await scene.getAttribute('data-cloud-shadow-x')),{timeout:15000}).toBeGreaterThan(firstShadow+.1);
  await page.getByRole('button',{name:'Pause motion'}).click();
  await page.waitForTimeout(400);
  const paused=await scene.getAttribute('data-cloud-time');
  await page.waitForTimeout(600);await expect(scene).toHaveAttribute('data-cloud-time',paused);
  await page.getByRole('button',{name:'Resume motion'}).click();
  await expect.poll(async()=>Number(await scene.getAttribute('data-cloud-time'))).toBeGreaterThan(Number(paused));
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(400);
  const reducedTime=await scene.getAttribute('data-cloud-time');
  await page.waitForTimeout(600);await expect(scene).toHaveAttribute('data-cloud-time',reducedTime);
  await page.screenshot({path:'test-results/masterplan-clouds.png'});
  await page.getByRole('combobox',{name:'Explore a location'}).selectOption('3');
  await page.getByRole('button',{name:'Close location details'}).click();
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  await expect.poll(async()=>Number(await scene.getAttribute('data-angle'))).toBeLessThan(37);
  await page.screenshot({path:'test-results/masterplan-close-tilt.png'});
  expect(errors).toEqual([]);
});

test('mobile pinch, responsive details, and reduced motion',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto('/masterplan-3d');
  const scene=page.getByRole('region',{name:/Interactive island/});
  await expect(scene).toHaveAttribute('data-zoom',/1\.000/,{timeout:30000});
  await expect(page.getByRole('button',{name:'Reduced motion'})).toBeDisabled();
  const client=await context.newCDPSession(page);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:410,id:1},{x:230,y:410,id:2}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:410,id:1},{x:290,y:410,id:2}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(async()=>Number(await scene.getAttribute('data-zoom'))).toBeGreaterThan(1.5);
  await expect(page.locator('#island-location-details')).toHaveCount(0);
  await page.getByRole('combobox',{name:'Explore a location'}).selectOption('7');
  await expect(page.locator('#island-location-details h2')).toHaveText('Atlantis');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/masterplan-mobile.png'});
  await context.close();
});

test('asset failure keeps the original plan and all location details usable',async({page})=>{
  await page.route('**/masterplan-3d/registration.json',route=>route.abort());
  await page.goto('/masterplan-3d');
  await expect(page.getByRole('button',{name:'Retry 3D'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Zoom in',exact:true})).toBeDisabled();
  await page.getByRole('combobox',{name:'Explore a location'}).selectOption('8');
  await expect(page.locator('#island-location-details h2')).toHaveText('Aliee');
  await page.getByRole('button',{name:'Close location details'}).click();
  await page.unroute('**/masterplan-3d/registration.json');
  await page.getByRole('button',{name:'Retry 3D'}).click();
  await expect(page.getByRole('region',{name:/Interactive island/})).toHaveAttribute('data-zoom',/1\.000/,{timeout:30000});
});

test('WebGL context loss offers a working retry',async({page})=>{
  await page.goto('/masterplan-3d');
  const scene=page.getByRole('region',{name:/Interactive island/});
  await expect(scene).toHaveAttribute('data-zoom',/1\.000/,{timeout:30000});
  await scene.locator('canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(page.getByRole('button',{name:'Retry 3D'})).toBeVisible();
  await page.getByRole('button',{name:'Retry 3D'}).click();
  await expect(page.getByRole('button',{name:'Zoom in',exact:true})).toBeEnabled({timeout:30000});
  await expect(scene.locator('canvas')).toHaveCount(1);
});
