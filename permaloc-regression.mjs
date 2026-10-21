import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('./worker.mjs',import.meta.url),'utf8');
const app=JSON.parse(source.match(/^const APP_SCRIPT=(.*);$/m)[1]);
function block(name,next){const start=app.indexOf('function '+name+'(');assert(start>=0);return app.slice(start,next?app.indexOf(next,start):app.indexOf('\n',start));}
const api=new Function([
 block('isStyleCaution'),block('isErrorFinding'),block('styleCount'),block('errorCount'),
 block('isDownloadURL'),block('crawlURL','\nfunction enqueueSite'),block('enqueueSite','\nfunction pageCounts'),
 block('prepareIncompleteRetries',"\n$('retry-pages')")
].join('\n')+';return {isStyleCaution,isErrorFinding,styleCount,errorCount,isDownloadURL,crawlURL,enqueueSite,prepareIncompleteRetries}')();
const root='https://permaloc.com';
for(const file of ['cl001.dwg','DRAWING.DXF','drawing%2Edwg','spec.doc','spec.docx','catalog.pdf','video.webm']){
 const url=root+'/downloads/'+file;assert(api.isDownloadURL(url),file);assert.equal(api.crawlURL(url,root),null,file);
}
for(const page of ['/edging/cleanline/','/faq/','/design-tools/','/blog/a-new-product','/index.php'])assert(api.crawlURL(root+page,root),page);
assert.equal(api.crawlURL(root+'/my-account/',root),null);
assert.equal(api.crawlURL('https://private.other/path',root),null);
const site={root,pages:[]};api.enqueueSite(site,[root+'/downloads/CAD/cl001.dwg',root+'/downloads/CAD/cl001.dwg',root+'/faq/',root+'/faq']);assert.equal(site.pages.length,1);assert.equal(site.downloads.length,1);
const findings=[{category:'quality',classification:'Caution'},{category:'quality',classification:'Cleanup'},{category:'style'},{category:'copy',classification:'Error'}];assert.equal(api.errorCount({findings}),1);assert.equal(api.styleCount({findings}),3);
assert.equal(api.isErrorFinding({category:'suggestions'}),false);
const report={page:{url:root},findings:[{done:true}],linkChecks:[{url:root+'/ok',state:'verified'},{url:root+'/missing',state:'broken'},{url:'https://external.com',state:'unverified'}],linksComplete:true};const original=JSON.stringify(report.findings);
const retry={pages:[{status:'partial',report,error:'unverified'},{status:'failed',error:'timeout'},{status:'done',report:{}}]};api.prepareIncompleteRetries(retry);assert.equal(retry.pages[0].status,'captured');assert.equal(retry.pages[0].report,report);assert.equal(report.linkChecks[0].state,'verified');assert.equal(report.linkChecks[1].state,'broken');assert.equal(report.linkChecks[2].state,'queued');assert.equal(JSON.stringify(report.findings),original);assert.equal(retry.pages[1].status,'queued');assert.equal(retry.pages[2].status,'done');
console.log('PASS: download exclusions, normal-page crawling, account exclusion, deduplication, caution/error counts, and targeted link retries.');
