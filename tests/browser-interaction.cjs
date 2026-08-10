const assert=require("node:assert/strict");
const port=Number(process.env.CDP_PORT||9333);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function main(){
  let pages;
  for(let i=0;i<30;i++){
    try{pages=await fetch(`http://127.0.0.1:${port}/json`).then(r=>r.json());if(pages.length)break}catch{}
    await wait(100);
  }
  const page=pages.find(p=>p.type==="page"&&p.url.startsWith("http://127.0.0.1:8003")),socket=new WebSocket(page.webSocketDebuggerUrl);let id=0;const pending=new Map(),exceptions=[];
  socket.addEventListener("message",event=>{const msg=JSON.parse(event.data);if(msg.method==="Runtime.exceptionThrown")exceptions.push(msg.params.exceptionDetails.text);if(msg.id&&pending.has(msg.id)){pending.get(msg.id)(msg);pending.delete(msg.id)}});
  await new Promise(resolve=>socket.addEventListener("open",resolve,{once:true}));
  const send=(method,params={})=>new Promise(resolve=>{const call=++id;pending.set(call,resolve);socket.send(JSON.stringify({id:call,method,params}))});
  const evaluate=async expression=>(await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true})).result.result.value;
  await send("Runtime.enable");await wait(500);
  const before=await evaluate("document.documentElement.dataset.theme");
  await evaluate("document.querySelector('#themeButton').click()");
  const after=await evaluate("document.documentElement.dataset.theme");
  assert.notEqual(after,before,"theme must change after click");
  await evaluate("document.querySelector('#soundButton').click();document.querySelector('#soundButton').click()");
  await wait(150);
  assert.equal(await evaluate("document.documentElement.dataset.audioReady"),"true","audio engine must initialize");
  assert.equal(await evaluate("document.querySelectorAll('.play-button').length"),3);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.play-button')].map(a=>({href:a.href,target:a.target,pointer:getComputedStyle(a).pointerEvents}))"),[
    {href:"https://irtschik913.github.io/PechaKucha/",target:"",pointer:"auto"},
    {href:"https://irtschik913.github.io/Bowling-Allee/",target:"",pointer:"auto"},
    {href:"https://irtschik913.github.io/Wissensturm/",target:"",pointer:"auto"}
  ]);
  assert.deepEqual(exceptions,[]);
  socket.close();console.log(JSON.stringify({theme:`${before} -> ${after}`,audio:"initialized",links:3,exceptions:0}));
}
main().catch(error=>{console.error(error);process.exit(1)});
