/* 로그인 없는 동기화 모듈: 앱이 쓰는 db/user 인터페이스를 localStorage + /api/sync 로 구현 */
(function(){
var KEY="lt-store-v1",CK="lt-sync-code",store={},subs=[],dirty=false,busy=false,again=false,state="",lastT=0,tm=null;
try{store=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}}
function code(){return localStorage.getItem(CK)||""}
function now(){lastT=Math.max(Date.now(),lastT+1);return lastT}
function notify(){subs.slice().forEach(function(f){f()})}
function put(p,rec){rec.t=now();store[p]=rec;save();dirty=true;schedule();notify()}
function live(p){var r=store[p];return r&&!r.x?r.d:undefined}
function schedule(){clearTimeout(tm);tm=setTimeout(sync,700)}
function label(){
  var s=document.getElementById("status"),c=code(),t,ok=false;
  if(!c)t="이 기기에만 저장됨";else if(state==="busy")t="동기화 중…";else if(state==="off")t="오프라인 – 나중에 동기화";else{t="☁ 동기화됨";ok=true}
  if(s){s.textContent=t;s.className="badge"+(ok?"":" local")}
  var d=document.getElementById("syncinfo");if(d)d.textContent=t;
}
window.__stat=label;
async function sync(){
  var c=code();if(!c){label();return}
  if(busy){again=true;return}
  busy=true;state="busy";label();
  try{
    var r=await fetch("/api/sync",dirty?{method:"PUT",headers:{"x-sync-code":c,"content-type":"application/json"},body:JSON.stringify(store)}:{headers:{"x-sync-code":c}});
    if(!r.ok)throw 0;
    var srv=await r.json(),ch=false;
    for(var k in srv){var v=srv[k];if(v&&(!store[k]||v.t>store[k].t)){store[k]=v;ch=true}}
    dirty=false;save();state="ok";if(ch)notify();
  }catch(e){state="off"}
  busy=false;label();
  if(again){again=false;schedule()}
}
function plain(x){return JSON.parse(JSON.stringify(x))}
function docRef(p){return{
  set:function(d){put(p,{d:plain(d)});return Promise.resolve()},
  delete:function(){put(p,{x:1});return Promise.resolve()},
  onSnapshot:function(cb){var f=function(){cb({data:function(){return live(p)}})};subs.push(f);setTimeout(f,0);return function(){subs=subs.filter(function(z){return z!==f})}}
}}
var db={
  doc:docRef,
  collection:function(path){return{
    doc:function(id){return docRef(path+"/"+id)},
    onSnapshot:function(cb){var f=function(){var a=[];Object.keys(store).forEach(function(k){if(k.indexOf(path+"/")===0&&k.slice(path.length+1).indexOf("/")<0&&!store[k].x)a.push({id:k.slice(path.length+1),data:function(){return store[k].d}})});cb({docs:a})};subs.push(f);setTimeout(f,0);return function(){subs=subs.filter(function(z){return z!==f})}}
  }}
};
window.claude={use:async function(n){return n==="db"?db:n==="user"?{id:async function(){return "me"}}:null}};
function newCode(){var a=new Uint8Array(24);crypto.getRandomValues(a);return btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}
function ui(){
  var st=document.createElement("style");
  st.textContent="#syncbtn{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:20;box-shadow:0 2px 8px rgba(0,0,0,.25)}#syncdlg code{display:block;word-break:break-all;background:var(--field);border:1px solid var(--line);border-radius:9px;padding:9px 11px;margin:6px 0}#syncdlg p{margin:6px 0;font-size:.88rem;color:var(--mut)}";
  document.head.appendChild(st);
  var b=document.createElement("button");b.id="syncbtn";b.textContent="☁ 동기화";document.body.appendChild(b);
  var d=document.createElement("dialog");d.id="syncdlg";document.body.appendChild(d);
  function draw(){
    var c=code();
    d.innerHTML='<h2 style="margin:0 0 4px;font-size:1.1rem">기기 간 동기화</h2><p>상태: <b id="syncinfo"></b></p>'+
    (c?'<p>다른 기기에서 아래 코드를 입력하면 같은 데이터가 보여요. 이 코드를 아는 사람은 누구나 데이터를 볼 수 있으니 공개하지 마세요.</p><code>'+c+'</code><div class="acts"><button id="scopy">코드 복사</button><button id="soff" class="danger">이 기기 연결 끊기</button></div>':
     '<p>처음이라면 새 코드를 만들고, 이미 다른 기기에서 만들었다면 그 코드를 입력하세요.</p><div class="acts"><button id="snew" class="pri">새 동기화 코드 만들기</button></div>')+
    '<label for="sin">다른 기기의 코드 입력</label><input id="sin" autocomplete="off" placeholder="코드를 붙여넣으세요"><div class="foot"><button id="sclose">닫기</button><button id="sgo" class="pri">연결</button></div>';
    label();
    var q=function(i){return d.querySelector("#"+i)};
    q("sclose").onclick=function(){d.close()};
    if(q("scopy"))q("scopy").onclick=function(){try{navigator.clipboard.writeText(code());this.textContent="복사됨 ✓"}catch(e){}};
    if(q("soff"))q("soff").onclick=function(){localStorage.removeItem(CK);draw()};
    if(q("snew"))q("snew").onclick=function(){localStorage.setItem(CK,newCode());dirty=true;draw();sync()};
    q("sgo").onclick=function(){var v=q("sin").value.trim();if(!/^[A-Za-z0-9_-]{24,64}$/.test(v)){alert("코드 형식이 올바르지 않아요.");return}localStorage.setItem(CK,v);dirty=true;draw();sync()};
  }
  b.onclick=function(){draw();d.showModal()};
  label();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ui);else ui();
document.addEventListener("visibilitychange",function(){if(!document.hidden)sync()});
window.addEventListener("online",sync);
setInterval(function(){if(!document.hidden)sync()},60000);
setTimeout(sync,500);
if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})});
})();
