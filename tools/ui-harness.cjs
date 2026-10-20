const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
async function launch(width=915,height=412){
 const root=path.resolve(__dirname,'../app/src/main/assets');
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(req.url.split('?')[0]);
  if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream');res.end(data);});
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+': '+r.url());});
 const url='http://127.0.0.1:'+server.address().port;
 const qa=path.resolve(__dirname,'../.qa');fs.mkdirSync(qa,{recursive:true});
 await page.goto(url);await page.evaluate(()=>document.fonts.ready);
 async function settle(skip=true){
  await page.waitForFunction(()=>!document.getElementById('game').classList.contains('interacting')||!document.getElementById('cinema').hidden);
  if(skip&&await page.locator('#cinema').isVisible())await page.locator('#skipStory').tap();
  if(skip)await page.waitForFunction(()=>!document.getElementById('game').classList.contains('interacting'));
 }
 const act=async id=>{await page.locator('[data-action="'+id+'"]').tap();await settle();};
 const item=async id=>{await page.locator('[data-item="'+id+'"]').tap();await settle();};
 const code=async value=>{for(let i=0;i<value.length;i++)for(let n=0;n<+value[i];n++)await page.locator('[data-up="'+i+'"]').tap();await page.locator('#submitCode').tap();await settle();};
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('turquoise-garden-v1')));
 return {page,errors,url,qa,act,item,code,settle,state,close:async()=>{await browser.close();await new Promise(r=>server.close(r));}};
}
module.exports={launch};
