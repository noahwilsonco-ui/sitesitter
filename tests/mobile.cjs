const fs=require('fs'),http=require('http'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.SITEKNIGHT_PLAYWRIGHT||'playwright');
(async()=>{
 const worker=(await import(pathToFileURL(__dirname+'/../worker.mjs').href)).default;
 const server=http.createServer(async(req,res)=>{try{const r=await worker.fetch(new Request('http://127.0.0.1:'+server.address().port+req.url),{},{});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()))}catch(e){res.writeHead(500);res.end(String(e))}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=process.env.SITEKNIGHT_TEST_ORIGIN||'http://127.0.0.1:'+server.address().port,browser=await chromium.launch({executablePath:process.env.SITEKNIGHT_CHROME||undefined,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE ERROR',String(e))});
  await page.route('**/*',route=>route.request().url().startsWith(origin)||route.request().url().startsWith('data:')?route.continue():route.abort());
  await page.goto(origin,{waitUntil:'domcontentloaded'});console.log('Home loaded');await page.waitForFunction(()=>typeof analysePageHTML==='function',{},{timeout:15000});
  await page.evaluate(()=>{
   const html='<html><head><title>Print and jump fixture</title><meta name="description" content="Report fixture"><style>body{font:16px Arial}.gap{height:1200px}.reveal{opacity:0;visibility:hidden;transform:translateY(60px)}.mobile{display:none}@media(max-width:767px){.desktop{display:none}.mobile{display:block}}</style></head><body><nav><a href="/contact">Contact sales</a></nav><main><h1>Jump fixture</h1><p id="top-error">We recieve packages.</p><div class="gap"></div><section x-intersect="shown=true" class="reveal"><p id="lower-error">Our solutionsfor fresh produce.</p></section><div class="gap"></div><p id="last-error">Food SafetyCertified.</p><p>Good punctuation — optional style review.</p><a href="/missing">Broken product</a><button aria-label="Open menu">Menu</button><button id="unlabelled"></button></main></body></html>';
   function report(url,html){const r=analysePageHTML({url,html});return {...r,scannedAt:new Date().toISOString(),linkChecks:[{url:'https://fixture.com/missing',name:'Broken product',state:'broken',status:404,result:'Page not found (404)',sources:[{label:'Broken product',location:'Main content'}]},{url:'https://other.com',name:'Other',state:'unverified',result:'Timed out'},{url:'https://fixture.com/contact',name:'Contact sales',state:'verified',status:200,result:'Loads successfully'}],linksComplete:true,copyProgress:{completed:1,total:1}}}
   current=report('https://fixture.com/',html);const r2=report('https://fixture.com/contact','<html><head><title>Contact page</title></head><body><main><h1>Contact sales</h1><p>We recieve requests.</p><form action="/submit"><label>Email<input name="email" required></label><button>Send request</button></form></main></body></html>');
   siteScan={root:'https://fixture.com',pages:[{url:'https://fixture.com',report:current,status:'done'},{url:'https://fixture.com/contact',report:r2,status:'partial'},{url:'https://fixture.com/unavailable',status:'failed',error:'The website returned HTTP 404.'}],downloads:['https://fixture.com/file.dwg'],options:{}};render();const index=current.findings.findIndex(f=>f.original==='solutionsfor');if(index<0)throw Error('Missing solutionsfor fixture finding');showVisual(current.findings[index],index);
  });

  await page.locator('#close-viewer').click();
  await page.evaluate(()=>{for(let i=0;i<35;i++){const url='https://fixture.com/catalog/category-'+i+'/long-product-name';const report=analysePageHTML({url,html:'<html><head><title>Product category '+i+'</title></head><body><h1>Product category '+i+'</h1><p>Product details</p></body></html>'});siteScan.pages.push({url,report,status:'done'})}activeTool='map';treeRenderSignature='';renderStructure();updateToolVisibility()});
  for(const width of [320,375,390,430,750,1024,1440]){
   await page.setViewportSize({width,height:844});await page.waitForTimeout(150);
   const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,zoom:getComputedStyle(document.querySelector('.family-tree')).zoom,font:parseFloat(getComputedStyle(document.querySelector('.tree-node strong')).fontSize)}));
   assert(metrics.scroll<=width+2,JSON.stringify({width,...metrics}));if(width<=750){assert.equal(metrics.zoom,'1');assert(metrics.font>=16)}
  }
  await page.setViewportSize({width:375,height:844});
  await page.getByRole('button',{name:'Collapse branches',exact:true}).click();
  await page.locator('.tree-search').fill('category-24');await page.waitForTimeout(100);
  const card=page.locator('.tree-node').filter({hasText:'category-24'}).first();assert(await card.isVisible(),'Search reveals matching collapsed branch');
  await card.getByRole('button',{name:'Page details',exact:true}).click();assert(await page.locator('#content-map-details').isVisible());
  await page.locator('.tree-search').fill('zzzz-no-match');assert.match(await page.locator('#page-structure [role=status]').innerText(),/0 matching/);
  await page.locator('.tree-search').fill('');await page.getByRole('button',{name:'Expand all',exact:true}).click();
  await page.screenshot({path:require('path').join(process.env.SK_CASE_DIR||__dirname,'mobile-map.png'),fullPage:false});
  await page.evaluate(()=>{selectTool('inventory')});await page.waitForTimeout(150);assert.equal(await page.locator('.inventory-table').evaluate(t=>getComputedStyle(t.querySelector('td')).display),'block');assert(await page.locator('.inventory-table td').first().getAttribute('data-label'));
  for(const name of ['Saved scans & changes','Email checker','Feedback & approvals','Content requests']){await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),name+' overflows')}
  assert.deepEqual(errors,[]);console.log('PASS mobile map at 320–750px, desktop resize, branch search/collapse/details, inventory cards, all workspace panels, no horizontal overflow.');
 }catch(error){await Promise.all(browser.contexts().flatMap(c=>c.pages()).map((p,i)=>p.screenshot({path:require('path').join(process.env.SK_CASE_DIR||__dirname,'failure-'+i+'.png'),fullPage:false}).catch(()=>{})));throw error}finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});

