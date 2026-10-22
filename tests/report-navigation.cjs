const fs=require('fs'),http=require('http'),assert=require('node:assert/strict'),{pathToFileURL}=require('url');
const {chromium}=require(process.env.SITEKNIGHT_PLAYWRIGHT||'playwright');
(async()=>{
 const worker=(await import(pathToFileURL(__dirname+'/../worker.mjs').href)).default;
 const server=http.createServer(async(req,res)=>{try{const r=await worker.fetch(new Request('http://127.0.0.1:'+server.address().port+req.url),{},{});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()))}catch(e){res.writeHead(500);res.end(String(e))}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({executablePath:process.env.SITEKNIGHT_CHROME||undefined,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>{errors.push(String(e));console.error('PAGE ERROR',String(e))});
  await page.route('**/*',route=>route.request().url().startsWith(origin)||route.request().url().startsWith('data:')?route.continue():route.abort());
  await page.goto(origin,{waitUntil:'domcontentloaded'});console.log('Home loaded');await page.waitForFunction(()=>typeof analysePageHTML==='function',{},{timeout:15000});
  await page.evaluate(()=>{
   const html='<html><head><title>Print and jump fixture</title><meta name="description" content="Report fixture"><style>body{font:16px Arial}.gap{height:1200px}.reveal{opacity:0;visibility:hidden;transform:translateY(60px)}.mobile{display:none}@media(max-width:767px){.desktop{display:none}.mobile{display:block}}</style></head><body><nav><a href="/contact">Contact sales</a></nav><main><h1>Jump fixture</h1><p id="top-error">We recieve packages.</p><div class="gap"></div><section x-intersect="shown=true" class="reveal"><p id="lower-error">Our solutionsfor fresh produce.</p></section><div class="gap"></div><p id="last-error">Food SafetyCertified.</p><p>Good punctuation - optional style review.</p><a href="/missing">Broken product</a><button aria-label="Open menu">Menu</button><button id="unlabelled"></button></main></body></html>';
   function report(url,html){const r=analysePageHTML({url,html});return {...r,scannedAt:new Date().toISOString(),linkChecks:[{url:'https://fixture.com/missing',name:'Broken product',state:'broken',status:404,result:'Page not found (404)',sources:[{label:'Broken product',location:'Main content'}]},{url:'https://other.com',name:'Other',state:'unverified',result:'Timed out'},{url:'https://fixture.com/contact',name:'Contact sales',state:'verified',status:200,result:'Loads successfully'}],linksComplete:true,copyProgress:{completed:1,total:1}}}
   current=report('https://fixture.com/',html);const r2=report('https://fixture.com/contact','<html><head><title>Contact page</title></head><body><main><h1>Contact sales</h1><p>We recieve requests.</p><form action="/submit"><label>Email<input name="email" required></label><button>Send request</button></form></main></body></html>');
   siteScan={root:'https://fixture.com',pages:[{url:'https://fixture.com',report:current,status:'done'},{url:'https://fixture.com/contact',report:r2,status:'partial'},{url:'https://fixture.com/unavailable',status:'failed',error:'The website returned HTTP 404.'}],downloads:['https://fixture.com/file.dwg'],options:{}};render();const index=current.findings.findIndex(f=>f.original==='solutionsfor');if(index<0)throw Error('Missing solutionsfor fixture finding');showVisual(current.findings[index],index);
  });
  console.log('Fixture opened');const frame=()=>page.frameLocator('#text-page-preview');await frame().locator('#lower-error').waitFor();
  console.log('Preview element present',await page.locator('#viewer-status').innerText());await page.waitForFunction(()=>document.querySelector('#viewer-status').textContent.includes('selected and centred'),{},{timeout:15000});
  const first=await frame().locator('#lower-error').evaluate(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom,height:innerHeight,opacity:getComputedStyle(el.parentElement).opacity,visibility:getComputedStyle(el.parentElement).visibility}));assert.equal(first.opacity,'1');assert.equal(first.visibility,'visible');assert(first.top>=0&&first.bottom<=first.height,JSON.stringify(first));
  const handle=await page.locator('#text-page-preview').elementHandle();
  await page.locator('#viewer-findings button').filter({hasText:'Safety Certified'}).click();await page.waitForTimeout(50);
  await page.locator('#viewer-findings button').filter({hasText:'solutions for'}).click();await page.waitForTimeout(50);
  const topIndex=await page.evaluate(()=>current.findings.findIndex(f=>f.replacement==='receive'));assert(topIndex>=0,'Spelling fixture exists');await page.locator('#viewer-findings button[data-index="'+topIndex+'"]').click();await page.waitForTimeout(800);
  assert(await handle.evaluate(el=>el===document.querySelector('#text-page-preview')),'Switching backwards must reuse the preview iframe');
  const top=await frame().locator('#top-error').evaluate(el=>({y:el.getBoundingClientRect().top,b:el.getBoundingClientRect().bottom,h:innerHeight,outline:el.style.outline}));assert(top.y>=0&&top.b<=top.h,JSON.stringify(top));assert.match(top.outline,/5px/);
  assert.match(await page.locator('#visual-replacement').innerText(),/receive/);
  await page.locator('#viewer-findings button').filter({hasText:'solutions for'}).click();await page.waitForTimeout(100);await page.locator('#jump-finding').click();await page.waitForTimeout(100);
  assert(await frame().locator('#lower-error').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}));
  console.log('PASS: scroll-animated solutionsfor passage reveals and centres; forward/backward selection reuses iframe; delayed load preserves latest selection; Jump to finding follows selected issue.');
  await page.evaluate(()=>{activeTool='links';render();buildFullPrintReport()});
  await page.emulateMedia({media:'print'});
  const report=await page.locator('#full-print-report').innerText();for(const label of ['Scan summary','Pages checked and scan coverage','Content map','Errors by page','Cautions by page','Broken and unverified destinations','All link check results','Page content inventory, forms and buttons','Contact page','solutionsfor','SafetyCertified','receive','404','unavailable','Email','Style'])assert(report.toLowerCase().includes(label.toLowerCase()),'Missing '+label);
  assert.equal(await page.locator('#full-print-report').isVisible(),true);assert.equal(await page.locator('main').isVisible(),false);
  assert.equal(await page.locator('#full-print-report .print-content-tree ul').count()>0,true);
  await page.pdf({path:require('node:path').join(require('node:os').tmpdir(),'siteknight-report-navigation-test.pdf'),printBackground:true,preferCSSPageSize:true});
  const layout=await page.locator('#full-print-report').evaluate(el=>({width:el.getBoundingClientRect().width,scroll:el.scrollWidth}));assert(layout.scroll<=layout.width+3,JSON.stringify(layout));
  await page.emulateMedia({media:'screen'});assert.equal(await page.locator('#full-print-report').isVisible(),false);assert.equal(await page.locator('#visual-viewer').evaluate(el=>el.open),true,'Printing must not destroy current review');
  assert.deepEqual(errors,[]);console.log('PASS: full printed report contains all pages, expanded content map, errors, cautions, broken and unverified links, metadata, headings, form fields and failures across all tabs; no horizontal overflow; screen review preserved.');
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});

