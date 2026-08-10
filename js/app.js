const root=document.documentElement;
const themeButton=document.querySelector("#themeButton");
const soundButton=document.querySelector("#soundButton");
const toast=document.querySelector("#toast");
const savedTheme=localStorage.getItem("dsk-theme");
const prefersLight=matchMedia("(prefers-color-scheme: light)").matches;
let theme=savedTheme||(prefersLight?"light":"dark");
let sound=localStorage.getItem("dsk-sound")!=="off";
let context=null,master=null,musicTimer=null,nextNote=0,toastTimer=null;

function apply(){
  root.dataset.theme=theme;
  document.querySelector('meta[name="theme-color"]').content=theme==="dark"?"#090b18":"#f4efe5";
  themeButton.setAttribute("aria-label",theme==="dark"?"Helles Design einschalten":"Dunkles Design einschalten");
  soundButton.classList.toggle("sound-off",!sound);
  soundButton.setAttribute("aria-label",sound?"Ton ausschalten":"Ton einschalten");
  if(master)master.gain.setTargetAtTime(sound?.24:0,context.currentTime,.08);
}
function unlock(){
  if(!context){
    const AudioApi=window.AudioContext||window.webkitAudioContext;
    if(!AudioApi)return;
    context=new AudioApi();master=context.createGain();master.gain.value=sound?.24:0;master.connect(context.destination);
  }
  if(context.state==="suspended")context.resume();
  if(sound&&!musicTimer)startMusic();
}
function tone(frequency,duration=.09,volume=.12,type="sine",delay=0){
  if(!sound)return;unlock();const now=context.currentTime+delay,osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,now);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.012);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+duration+.03);
}
function clickSound(){tone(420,.07,.13,"sine");tone(680,.1,.08,"sine",.035)}
function hoverSound(){tone(310,.045,.035,"sine")}
function startMusic(){
  const notes=[146.83,174.61,220,196,164.81,220,246.94,196];nextNote=0;
  const play=()=>{if(!sound||!context)return;const f=notes[nextNote++%notes.length];tone(f,2.8,.075,"sine");tone(f*2,2.1,.035,"triangle",.08)};
  musicTimer=setInterval(play,1850);play();
}
function showToast(text){toast.textContent=text;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),1700)}

themeButton.addEventListener("click",()=>{unlock();clickSound();theme=theme==="dark"?"light":"dark";localStorage.setItem("dsk-theme",theme);apply()});
soundButton.addEventListener("click",()=>{unlock();sound=!sound;localStorage.setItem("dsk-sound",sound?"on":"off");if(sound&&!musicTimer)startMusic();apply();if(sound){clickSound();showToast("Ton und Musik eingeschaltet")}else showToast("Ton ausgeschaltet")});
document.addEventListener("pointerdown",()=>unlock(),{once:true});
document.querySelectorAll(".play-button").forEach(link=>{
  link.addEventListener("pointerenter",hoverSound);
  link.addEventListener("click",()=>clickSound());
});
document.querySelectorAll(".icon-button,.discover,.vk-link").forEach(item=>item.addEventListener("pointerenter",hoverSound));
apply();
