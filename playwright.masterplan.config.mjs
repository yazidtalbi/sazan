import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir:'./tests',testMatch:'masterplan-3d.spec.js',timeout:60000,workers:1,
  use:{baseURL:process.env.MASTERPLAN_TEST_URL||'http://localhost:3000',viewport:{width:1440,height:900},
    launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
  reporter:'list',
});
