const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const KEY='intervalo_state_v3';
const initial={accepted:false,briefing:false,step:0,answers:{},events:[],started:null,completed:null};
let state={...initial,...JSON.parse(localStorage.getItem(KEY)||'{}')};
let deferredInstall=null,z=20;
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const now=()=>new Date().toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'});

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

function boot(){showDesktop()}

async function installPWA(){
 if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null}
 else alert('Si tu navegador admite instalación, usa “Añadir a pantalla de inicio” o “Instalar aplicación” desde su menú.')
}

function showDesktop(){
 document.body.innerHTML=`<main class="desktop">
   <header class="topbar"><div class="brand">Intervalo</div><div class="top-meta"><span>LOCAL NODE / 001</span><span id="clock"></span></div></header>
   <section id="workspace" class="workspace"></section>
   <nav class="dock">
     <button data-app="story">misiones</button>
     <button data-app="archive">archivo</button>
     <button data-app="map">recorrido</button>
     <button data-app="about">sistema</button>
     <button id="installDock">instalar</button>
   </nav>
 </main>
 <dialog id="memoDialog"><div class="dialog"><div class="dialog-head"><strong id="memoTitle">memo</strong><button onclick="this.closest('dialog').close()">cerrar</button></div><div id="memoBody"></div></div></dialog>`;
 const tick=()=>{$('#clock').textContent=new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})};tick();setInterval(tick,30000);
 $$('.dock [data-app]').forEach(b=>b.onclick=()=>openApp(b.dataset.app));
 $('#installDock').onclick=installPWA;
 // Intentionally empty: desktop is the starting state. No Zork window opens on boot.
}

function makeWindow(id,title,body,x=55,y=45,w=610){
 let old=$('#win-'+id);if(old){old.classList.remove('min');old.style.zIndex=++z;return old}
 let el=document.createElement('section');
 el.className='window';el.id='win-'+id;el.style.cssText=`left:${x}px;top:${y}px;width:${w}px;z-index:${++z}`;
 el.innerHTML=`<header class="window-header"><span class="window-title">${title}</span><span class="window-controls"><button data-min>—</button><button data-max>□</button><button data-close>×</button></span></header><div class="window-body">${body}</div>`;
 $('#workspace').appendChild(el);el.onpointerdown=()=>el.style.zIndex=++z;
 el.querySelector('[data-close]').onclick=()=>el.remove();
 el.querySelector('[data-min]').onclick=()=>el.classList.toggle('min');
 el.querySelector('[data-max]').onclick=()=>el.classList.toggle('max');
 drag(el);return el;
}
function drag(el){
 let h=el.querySelector('.window-header'),sx,sy,sl,st,moving=false;
 h.onpointerdown=e=>{if(innerWidth<701||e.target.closest('button'))return;moving=true;sx=e.clientX;sy=e.clientY;sl=el.offsetLeft;st=el.offsetTop;h.setPointerCapture(e.pointerId)};
 h.onpointermove=e=>{if(!moving)return;el.style.left=Math.max(0,sl+e.clientX-sx)+'px';el.style.top=Math.max(0,st+e.clientY-sy)+'px'};
 h.onpointerup=()=>moving=false;
}
window.makeWindow=makeWindow;
window.openApp=openApp;

function openApp(app){
 if(app==='story')return storyWindow();
 if(app==='archive')return archiveWindow();
 if(app==='map')return mapWindow();
 if(app==='about')return aboutWindow();
}

function storyWindow(){
 let el=makeWindow('story','misiones / terminal','',120,55,700);
 renderStory(el.querySelector('.window-body'));
}
const A=t=>`<div class="story-copy assistant">${t}</div>`;
const choices=arr=>`<div class="choice-row">${arr.map(([n,t])=>`<button class="choice" data-step="${n}">${t}</button>`).join('')}</div>`;
const zork=ph=>`<form class="zork-line"><span>›</span><input autocomplete="off" placeholder="${ph}"><button>enviar</button></form>`;
function setStep(n){state.step=n;save();renderStory($('#win-story .window-body'))}
function setAnswer(k,v,n){state.answers[k]=v;setStep(n)}

function renderStory(root){
 if(!root)return;
 if(!state.accepted){renderConsent(root);return}
 if(!state.briefing){renderBriefing(root);return}
 const a=state.answers;let html='';
 const shell=(title,copy)=>`<div class="story-head"><span class="story-id">MISSION://001</span><span class="story-id">${state.step<17?'ACTIVE':'ARCHIVED'}</span></div><h1 class="story-title">${title}</h1>${copy}`;
 switch(state.step){
  case 0:html=shell('CAUSA INDETERMINADA',`<div class="terminal-card"><span class="tiny">DOCUMENT / 001</span><p><span class="accent">158 aves.</span></p><p>Una ciudad colombiana. Una mañana cualquiera.</p><p>Se investigaron causas. Algunas fueron descartadas. La respuesta definitiva no llegó con la misma rapidez que la noticia.</p></div>${A('<p>Me gusta “causa indeterminada”.</p><p>Suena mejor que “no sabemos”.</p><p>Lo extraño no es que algo ocurra sin explicación inmediata.</p><p>Lo extraño es que después haya que almorzar.</p>')}${choices([[1,'iniciar misión']])}`);break;
  case 1:html=shell('LO QUE CAE',A('<p>Sal.</p><p>Encuentra algo que haya caído y que nadie esté intentando recoger.</p><p>No personas. No animales. No tráfico ni propiedad privada.</p><p>Cuando lo encuentres, escríbelo.</p>')+zork('una hoja, un papel, una flor…'));break;
  case 2:html=shell('LO QUE PERMANECE',A(`<p>“${esc(a.fallen)}”.</p><p>Bien. Déjalo donde está.</p><p>Ahora encuentra algo que parezca llevar mucho tiempo en su sitio. Un árbol, un muro, una escalera, un edificio.</p>`)+zork('descríbelo'));break;
  case 3:html=shell('DOS COSAS',`<div class="memo">OBJETO A    ${esc(a.fallen)}\nESTADO      CAÍDO\n\nOBJETO B    ${esc(a.standing)}\nESTADO      PERMANECE</div>${A('<p>Una dejó su lugar. La otra sigue ahí.</p><p>No significa nada todavía.</p><p>Procuremos no arruinarlo demasiado pronto.</p>')}${choices([[4,'seguir']])}`);break;
  case 4:html=shell('RECORRIDO',A('<p>Camina unos minutos por una ruta pública que ya conozcas.</p><p>No busques nada especial.</p><p>Cuando algo que normalmente ignorarías consiga llamar tu atención, descríbelo.</p>')+zork('¿qué viste?'));break;
  case 5:html=shell('INTERVALO',A(`<p>“${esc(a.observed)}”. Archivado.</p><p>Ahora quédate donde estés, siempre que sea público y seguro.</p><p>Durante tres minutos no hagas nada para esta misión.</p>`)+choices([[6,'empezar espera']]));break;
  case 6:html=shell('MIRA ALREDEDOR',`<div class="story-copy"><p>No hace falta mirar esta pantalla.</p><p>La realidad puede encargarse de los próximos tres minutos.</p></div><div class="choice-row"><button class="choice" id="waitDone">ya pasaron</button></div>`);break;
  case 7:html=shell('¿QUÉ PASÓ?',A('<p>No necesito una crónica. Solo la impresión.</p>')+choices([[8,'alguien pasó'],[9,'algo cambió'],[10,'nada'],[11,'no presté atención']]));break;
  case 12:html=shell('PATRONES',A(`<p>${a.wait==='nada'?'Tres minutos y ningún acontecimiento digno de archivo. Qué lujo.':'Eso bastará.'}</p><p>Una cosa ocurre. Después otra.</p><p>Si ocurren suficientemente cerca, inventamos una relación: causa, suerte, culpa, destino.</p><p>Necesitamos patrones para orientarnos. El problema empieza cuando confundimos el patrón con el mundo.</p><p>Una vida en la que todo significara algo quizá sería peor.</p>`)+choices([[13,'continuar']]));break;
  case 13:html=shell('UNA PERSONA',A('<p>Piensa en alguien que probablemente esté teniendo un día completamente ordinario.</p><p>No necesito saber quién.</p><p>Si quieres, escríbele algo sencillo. No porque vaya a cambiar la historia. Precisamente porque probablemente no la cambie.</p>')+choices([[14,'lo hice'],[15,'prefiero no hacerlo']]));break;
  case 16:html=shell('CIERRE',`<div class="memo">CAUSA       INDETERMINADA\nCAÍDO       ${esc(a.fallen)}\nPERMANECE   ${esc(a.standing)}\nOBSERVADO   ${esc(a.observed)}\nESPERA      ${esc(a.wait)}\nCONTACTO    ${esc(a.contact)}\nCONCLUSIÓN  NINGUNA</div>${A('<p>Intenté encontrar una conclusión.</p><p>No encontré ninguna.</p><p>Parece suficiente para un día.</p>')}${choices([[17,'archivar proceso']])}`);break;
  case 17:html=shell('ARCHIVADO',A('<p>El proceso terminó.</p><p>No desapareció. Ahora ocupa una carpeta.</p><p>Las personas llaman memoria a algo parecido, aunque con peor sistema de búsqueda.</p>')+`<div class="choice-row"><button class="choice" id="openCompleted">abrir carpeta</button></div>`);break;
  default:html=shell('CAUSA INDETERMINADA',A('<p>Hay algo pendiente.</p>'));
 }
 root.innerHTML=html;wireStory(root);
}

function renderConsent(root){
 root.innerHTML=`<div class="story-head"><span class="story-id">SYS://ACCESS</span><span class="story-id">FIRST RUN</span></div><h1 class="story-title">ANTES DE ABRIR LA MISIÓN</h1><div class="terminal-card"><p>INTERVALO mezcla ficción, observación y material documental identificado como tal.</p><p>El recorrido se guarda localmente en este dispositivo.</p></div><div class="consent-box"><label><input id="c1" type="checkbox"> Distingo el archivo documental de la ficción.</label><label><input id="c2" type="checkbox"> Haré recorridos solo en espacios públicos y seguros.</label><label><input id="c3" type="checkbox"> Entiendo que puedo abandonar una misión cuando quiera.</label></div><div class="choice-row"><button class="choice" id="acceptMission">aceptar</button><button class="choice" id="installMission">instalar PWA</button></div>`;
 $('#acceptMission').onclick=()=>{if(!$('#c1').checked||!$('#c2').checked||!$('#c3').checked)return alert('Acepta los tres puntos para abrir la misión.');state.accepted=true;state.started=state.started||new Date().toISOString();save();renderStory(root)};
 $('#installMission').onclick=installPWA;
}

function renderBriefing(root){
 root.innerHTML=`<div class="story-head"><span class="story-id">SYS://BRIEFING</span><span class="story-id">WAITING</span></div><div id="briefLog" class="terminal-card" style="min-height:310px"></div><form id="briefForm" class="zork-line"><span>›</span><input autocomplete="off" placeholder="escribe ENTRAR"><button>enviar</button></form>`;
 const lines=[
  ['','Una ciudad amanece.'],
  ['','La gente abre puertas, sube persianas, espera transporte, cuenta monedas.'],
  ['','En algún lugar ocurre algo que nadie esperaba.'],
  ['','Durante unas horas todos preguntan por qué.'],
  ['','Después alguien tiene hambre.'],
  ['','Alguien llega tarde.'],
  ['','Alguien tiene que trabajar.'],
  ['a','A. Siempre me ha parecido extraña esa parte.'],
  ['a','A. Continuar.'],
  ['a','A. No tengo una explicación para ofrecerte.'],
  ['a','A. Tengo algo menos cómodo: una pregunta.'],
  ['dim','Escribe ENTRAR cuando quieras abrir el expediente 001.']
 ];
 let log=$('#briefLog'),i=0;function next(){if(i>=lines.length)return;let [cl,tx]=lines[i++];let p=document.createElement('div');p.className='terminal-line '+cl;p.textContent=tx;log.appendChild(p);setTimeout(next,420)}next();
 $('#briefForm').onsubmit=e=>{e.preventDefault();let v=$('#briefForm input').value.trim().toLowerCase();if(['entrar','enter','iniciar'].includes(v)){state.briefing=true;save();renderStory(root)}else{let p=document.createElement('div');p.className='terminal-line a';p.textContent='A. No es una contraseña. Solo escribe ENTRAR.';log.appendChild(p)}};
}

function wireStory(root){
 root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{
  let n=+b.dataset.step;
  if([8,9,10,11].includes(n)){state.answers.wait={8:'alguien pasó',9:'algo cambió',10:'nada',11:'no presté atención'}[n];setStep(12)}
  else if([14,15].includes(n)){state.answers.contact=n===14?'realizado':'omitido';setStep(16)}
  else if(n===17){completeMission();setStep(17)}
  else setStep(n)
 });
 let form=root.querySelector('.zork-line');if(form)form.onsubmit=e=>{e.preventDefault();let v=form.querySelector('input').value.trim();if(!v)return;if(state.step===1)setAnswer('fallen',v,2);else if(state.step===2)setAnswer('standing',v,3);else if(state.step===4)setAnswer('observed',v,5)};
 root.querySelector('#waitDone')?.addEventListener('click',()=>setStep(7));
 root.querySelector('#openCompleted')?.addEventListener('click',()=>archiveWindow(true));
}

function completeMission(){
 if(state.events.some(e=>e.id==='001'))return;
 state.completed=new Date().toISOString();
 state.events.unshift({id:'001',title:'Causa indeterminada',date:now(),status:'concluido',answers:{...state.answers},memo:'Una cosa cayó. Otra permaneció. Algo fue observado. Hubo un intervalo. Una persona pensó en otra. No se obtuvo una conclusión.'});save();
}

function archiveWindow(focus=false){
 let body=`<div class="story-head"><span class="story-id">FS://ARCHIVE</span><span class="story-id">${state.events.length} FOLDERS</span></div><h2 class="story-title">PROCESOS CONCLUIDOS</h2><div class="folder-grid">${state.events.length?state.events.map(e=>`<button class="folder" data-event="${e.id}"><div class="folder-mark"></div><strong>${e.id} / ${e.title}</strong><small>${e.date}</small></button>`).join(''):'<div class="tiny">NO HAY PROCESOS CONCLUIDOS</div>'}</div>`;
 let el=makeWindow('archive','archivo',body,250,100,560);
 el.querySelectorAll('[data-event]').forEach(b=>b.onclick=()=>openFolder(state.events.find(e=>e.id===b.dataset.event)));
 if(focus)el.style.zIndex=++z;
}
function openFolder(e){
 if(!e)return;
 const body=`<div class="story-head"><span class="story-id">FS://ARCHIVE/${e.id}</span><span class="story-id">READ ONLY</span></div><h2 class="story-title">${esc(e.title)}</h2><div class="file-list"><button class="file-row" data-file="memo"><span class="ico">▤</span><strong>MEMO.txt</strong><small>texto</small></button><button class="file-row" data-file="obs"><span class="ico">▥</span><strong>OBSERVACIONES.log</strong><small>registro</small></button><button class="file-row" data-file="close"><span class="ico">◇</span><strong>CIERRE.memo</strong><small>memo</small></button></div>`;
 const w=makeWindow('folder-'+e.id,`archivo / ${e.id}`,body,330,145,500);
 w.querySelectorAll('[data-file]').forEach(b=>b.onclick=()=>openFile(e,b.dataset.file));
}
function openFile(e,type){
 let title='MEMO.txt',text='';
 if(type==='memo'){text=`ESTADO      CONCLUIDO\nFECHA       ${e.date}\n\nCAÍDO       ${e.answers.fallen||'—'}\nPERMANECE   ${e.answers.standing||'—'}\nOBSERVADO   ${e.answers.observed||'—'}\nESPERA      ${e.answers.wait||'—'}\nCONTACTO    ${e.answers.contact||'—'}`}
 if(type==='obs'){title='OBSERVACIONES.log';text=`OBJETO_CAÍDO=${e.answers.fallen||'—'}\nOBJETO_ESTABLE=${e.answers.standing||'—'}\nOBSERVACIÓN=${e.answers.observed||'—'}\nINTERVALO=${e.answers.wait||'—'}`}
 if(type==='close'){title='CIERRE.memo';text=e.memo}
 makeWindow('file-'+e.id+'-'+type,title,`<div class="memo">${esc(text)}</div>`,390,190,480);
}

function mapWindow(){
 makeWindow('map','recorrido',`<div class="story-head"><span class="story-id">MAP://ABSTRACT</span></div><h2 class="story-title">RECORRIDO</h2><p class="story-copy">No dibuja la ciudad completa. Solo conserva relaciones entre momentos.</p><div class="map-abstract"><span class="map-dot" style="left:22%;top:68%"></span><span class="map-note" style="left:25%;top:66%">caída</span><span class="map-dot" style="left:49%;top:40%"></span><span class="map-note" style="left:52%;top:38%">permanencia</span><span class="map-dot" style="left:77%;top:58%"></span><span class="map-note" style="left:61%;top:62%">intervalo</span></div>`,340,75,500)
}
function aboutWindow(){
 let w=makeWindow('about','sistema',`<div class="story-head"><span class="story-id">SYS://INFO</span></div><h2 class="story-title">INTERVALO</h2><div class="terminal-card"><p><span class="accent">● LOCAL</span></p><p>Persistencia: navegador</p><p>Base de datos: ninguna</p><p>Misiones activas: ${state.step<17?1:0}</p><p>Procesos archivados: ${state.events.length}</p></div><div class="choice-row"><button class="choice" id="resetAll">borrar recorrido local</button></div>`,430,130,430);
 w.querySelector('#resetAll').onclick=()=>{if(confirm('¿Borrar todo el recorrido guardado en este dispositivo?')){localStorage.removeItem(KEY);location.reload()}}
}
boot();
