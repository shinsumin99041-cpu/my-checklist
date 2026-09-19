// 1) Supabase Dashboard에서 만든 프로젝트의 URL과 anon key를 아래에 넣으세요.
const SUPABASE_URL = "https://ubqfwrlqnfyheaztkeyc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vkcCgcUgMzReNKa6bpAdHQ_04yNDvl8";

const subjectsDefault = [
  "부모교육 및 상담","콜잉","컴퓨터과학개론","컴퓨팅사고",
  "서양의 역사와 여성 스토리텔링","노동인권"
];

let client = null, user = null, rows = [];

const $ = id => document.getElementById(id);
$("date").textContent = new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"});

function configured(){return SUPABASE_URL.startsWith("http") && !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_")}
if(configured()) client = window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

$("signup").onclick = async()=>{
  if(!client) return setMsg("먼저 app.js의 Supabase 설정을 입력하세요.");
  const {error}=await client.auth.signUp({email:$("email").value.trim(),password:$("password").value});
  setMsg(error ? error.message : "회원가입 완료! 이메일 확인이 필요할 수 있습니다.");
};
$("login").onclick = login;
$("password").addEventListener("keydown",e=>{if(e.key==="Enter")login()});
$("logout").onclick = async()=>{await client.auth.signOut();};

async function login(){
  if(!client) return setMsg("먼저 app.js의 Supabase 설정을 입력하세요.");
  const {error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  setMsg(error ? error.message : "");
}
function setMsg(x){$("authMsg").textContent=x}

async function boot(){
  if(!client){$("auth").classList.remove("hidden");setMsg("배포 전에 app.js에 Supabase URL과 anon key를 입력하세요.");return}
  const {data:{session}}=await client.auth.getSession();
  setSession(session);
  client.auth.onAuthStateChange((_e,s)=>setSession(s));
}
async function setSession(session){
  user=session?.user||null;
  $("auth").classList.toggle("hidden",!!user);
  $("main").classList.toggle("hidden",!user);
  $("logout").classList.toggle("hidden",!user);
  if(user) await load();
}
async function load(){
  const {data,error}=await client.from("tasks").select("*").eq("user_id",user.id).order("created_at",{ascending:true});
  if(error){alert(error.message);return}
  rows=data||[];
  render();
}
function group(){
  const map={};
  subjectsDefault.forEach(s=>map[s]=[]);
  rows.forEach(r=>{if(!map[r.subject])map[r.subject]=[];map[r.subject].push(r)});
  return map;
}
function render(){
  const map=group();
  $("subjects").innerHTML=Object.keys(map).map(subject=>{
    const list=map[subject], done=list.filter(x=>x.done).length;
    return `<section class="subject">
      <div class="subject-head"><div><span class="subject-title">${esc(subject)}</span><span class="count">${done} / ${list.length}</span></div>
      <button class="add" onclick="showAdd(${JSON.stringify(subject)})">+ 할 일 추가</button></div>
      <div class="items">${list.length?list.map(task=>`
        <div class="item ${task.done?'done':''}">
          <input type="checkbox" ${task.done?'checked':''} onchange="toggle('${task.id}',${!task.done})">
          <div class="item-body"><div class="text">${esc(task.text)}</div><div class="item-date">${new Date(task.created_at).toLocaleString("ko-KR")}</div></div>
          <button class="delete" onclick="removeTask('${task.id}')">삭제</button>
        </div>`).join(""):`<div class="empty">아직 추가된 할 일이 없습니다.</div>`}</div>
      <div class="addform" id="${formId(subject)}"><input id="${inputId(subject)}" placeholder="과제, 할 일, 수업 내용..." onkeydown="if(event.key==='Enter')addTask(${JSON.stringify(subject)})"><button class="add" onclick="addTask(${JSON.stringify(subject)})">추가</button><button onclick="hideAdd(${JSON.stringify(subject)})">취소</button></div>
    </section>`;
  }).join("");
  let total=rows.length, done=rows.filter(x=>x.done).length;
  $("progressText").textContent=`${done} / ${total} 완료`;
  $("bar").style.width=total?`${done/total*100}%`:"0%";
}
function key(s){return btoa(unescape(encodeURIComponent(s))).replace(/=/g,"")}
function formId(s){return "f_"+key(s)}
function inputId(s){return "i_"+key(s)}
function showAdd(s){$(formId(s)).classList.add("show");$(inputId(s)).focus()}
function hideAdd(s){$(formId(s)).classList.remove("show")}
async function addTask(subject){
  const input=$(inputId(subject)), text=input.value.trim(); if(!text)return;
  const {error}=await client.from("tasks").insert({user_id:user.id,subject,text,done:false});
  if(error)return alert(error.message); await load(); showAdd(subject);
}
async function toggle(id,done){
  const {error}=await client.from("tasks").update({done}).eq("id",id).eq("user_id",user.id);
  if(error)alert(error.message); else await load();
}
async function removeTask(id){
  if(!confirm("이 항목을 삭제할까요?"))return;
  const {error}=await client.from("tasks").delete().eq("id",id).eq("user_id",user.id);
  if(error)alert(error.message); else await load();
}
function esc(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML}
boot();