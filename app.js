const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const KEY='intervalo_state_v2';
const initial={accepted:false,prologue:false,step:0,answers:{},events:[],started:null,completed:null};
let state={...initial,...JSON.parse(localStorage.getItem(KEY)||'{}')};
let deferredInstall=null,z=20;
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const now=()=>new Date().toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'});

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installBtn')?.classList.remove('hidden')});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

function boot(){
 if(!state.accepted)return showEntry();
 if(!state.prologue)return showPrologue();
 showDesktop();
}
function showEntry(){
 document.body.innerHTML=`<section class="entry"><article class="entry-card"><div class="eyebrow">una experiencia de observación</div><h1>INTERVALO</h1><div class="lead">Hay cosas que ocurren sin esperar a que las entendamos. Esta experiencia usa la ciudad, el tiempo y tus decisiones como parte de una ficción. No necesitas convertirte en otra persona. Basta con estar donde ya estás.</div><div class="consent-box"><div class="label">antes de entrar</div><label><input id="c1" type="checkbox"> Entiendo que las historias documentales y la ficción se distinguen dentro de la experiencia.</label><label><input id="c2" type="checkbox"> Haré los recorridos únicamente en espacios públicos y seguros. Una misión puede abandonarse en cualquier momento.</label><label><input id="c3" type="checkbox"> Entiendo que el progreso se guarda localmente en este dispositivo y puedo borrarlo.</label><div class="actions"><button class="btn" id="enterBtn">aceptar y entrar</button><button class="btn soft hidden" id="installBtn">instalar</button><button class="btn soft" id="policyBtn">leer nota de uso</button></div></div></article></section><dialog id="policy"><div class="dialog"><div class="dialog-head"><strong>nota de uso</strong><button onclick="this.closest('dialog').close()">cerrar</button></div><p>INTERVALO mezcla ficción, observación y material documental identificado como tal. No solicita una identidad real para esta versión y no envía tus respuestas a un servidor. No sigas instrucciones que te lleven a tráfico, propiedad privada, lugares aislados o situaciones que consideres inseguras. Una emergencia real siempre está por encima del juego.</p><p>Los datos narrativos de esta versión permanecen en el almacenamiento local del navegador hasta que decidas reiniciar la experiencia o borrar los datos del sitio.</p></div></dialog>`;
 $('#enterBtn').onclick=()=>{if(!$('#c1').checked||!$('#c2').checked||!$('#c3').checked)return alert('Lee y acepta los tres puntos para continuar.');state.accepted=true;state.started=state.started||new Date().toISOString();save();showPrologue()};
 $('#policyBtn').onclick=()=>$('#policy').showModal();
 $('#installBtn').onclick=installPWA;
}
async function installPWA(){if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null}else alert('Si tu navegador admite instalación, usa “Añadir a pantalla de inicio” o “Instalar aplicación” desde su menú.')}

const prologueLines=[
 ['dim','ARCHIVO / APERTURA'],
 ['','Una ciudad amanece.'],
 ['','La gente abre puertas, sube persianas, espera transporte, cuenta monedas.'],
 ['','En algún lugar ocurre algo que nadie esperaba.'],
 ['','Durante unas horas todos preguntan por qué.'],
 ['','Después alguien tiene hambre.'],
 ['','Alguien llega tarde.'],
 ['','Alguien tiene que trabajar.'],
 ['a','A.  Siempre me ha parecido extraña esa parte.'],
 ['','> ¿qué parte?'],
 ['a','A.  Continuar.'],
 ['',''],
 ['a','A.  No tengo una explicación para ofrecerte.'],
 ['a','A.  Tengo algo menos cómodo: una pregunta.'],
 ['dim','Escribe ENTRAR cuando quieras comenzar.']
];
function showPrologue(){
 document.body.innerHTML=`<section class="prologue"><div class="terminal"><div id="tlog" class="terminal-log"></div><form id="tform" class="terminal-input-row"><span>›</span><input id="tin" autocomplete="off" autofocus><button>enviar</button></form></div></section>`;
 const log=$('#tlog');let i=0;function next(){if(i>=prologueLines.length)return;let [cl,tx]=prologueLines[i++];let p=document.createElement('div');p.className='terminal-line '+cl;p.textContent=tx;log.appendChild(p);log.scrollTop=log.scrollHeight;setTimeout(next,tx?480:220)}next();
 $('#tform').onsubmit=e=>{e.preventDefault();let v=$('#tin').value.trim().toLowerCase();$('#tin').value='';if(['entrar','enter','iniciar'].includes(v)){state.prologue=true;save();showDesktop()}else{let p=document.createElement('div');p.className='terminal-line a';p.textContent='A.  No era una contraseña. Escribe ENTRAR cuando estés listo.';log.appendChild(p)}};
}

function showDesktop(){
 document.body.innerHTML=`<main class="desktop"><header class="topbar"><div class="brand">Intervalo</div><div class="top-meta"><span>la ciudad no cabe en esta pantalla</span><span id="clock"></span></div></header><section id="workspace" class="workspace"></section><nav class="dock"><button data-app="story">relato</button><button data-app="archive">archivo</button><button data-app="map">recorrido</button><button data-app="about">nota</button><button id="installDock">instalar</button></nav></main><dialog id="memoDialog"><div class="dialog"><div class="dialog-head"><strong id="memoTitle">memo</strong><button onclick="this.closest('dialog').close()">cerrar</button></div><div id="memoBody"></div></div></dialog>`;
 const tick=()=>{$('#clock').textContent=new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})};tick();setInterval(tick,30000);
 $$('.dock [data-app]').forEach(b=>b.onclick=()=>openApp(b.dataset.app));$('#installDock').onclick=installPWA;
 // Important: no app is opened automatically. The player decides when to launch RELATO/MISIONES.
}
function makeWindow(id,title,body,x=55,y=45,w=610){
 let old=$('#win-'+id);if(old){old.classList.remove('min');old.style.zIndex=++z;return old}
 let el=document.createElement('section');el.className='window';el.id='win-'+id;el.style.cssText=`left:${x}px;top:${y}px;width:${w}px;z-index:${++z}`;el.innerHTML=`<header class="window-header"><span class="window-title">${title}</span><span class="window-controls"><button data-min>—</button><button data-max>□</button><button data-close>×</button></span></header><div class="window-body">${body}</div>`;$('#workspace').appendChild(el);el.onpointerdown=()=>el.style.zIndex=++z;el.querySelector('[data-close]').onclick=()=>el.remove();el.querySelector('[data-min]').onclick=()=>el.classList.toggle('min');el.querySelector('[data-max]').onclick=()=>el.classList.toggle('max');drag(el);return el;
}
function drag(el){let h=el.querySelector('.window-header'),sx,sy,sl,st,moving=false;h.onpointerdown=e=>{if(innerWidth<701||e.target.closest('button'))return;moving=true;sx=e.clientX;sy=e.clientY;sl=el.offsetLeft;st=el.offsetTop;h.setPointerCapture(e.pointerId)};h.onpointermove=e=>{if(!moving)return;el.style.left=Math.max(0,sl+e.clientX-sx)+'px';el.style.top=Math.max(0,st+e.clientY-sy)+'px'};h.onpointerup=()=>moving=false}
function openApp(app){if(app==='story')return storyWindow();if(app==='archive')return archiveWindow();if(app==='map')return mapWindow();if(app==='about')return aboutWindow()}

function storyWindow(){let el=makeWindow('story','relato / 001','',55,42,660);renderStory(el.querySelector('.window-body'))}
const A=t=>`<div class="story-copy assistant">${t}</div>`;
const choices=arr=>`<div class="choice-row">${arr.map(([n,t])=>`<button class="choice" data-step="${n}">${t}</button>`).join('')}</div>`;
function setStep(n){state.step=n;save();renderStory($('#win-story .window-body'))}
function setAnswer(k,v,n){state.answers[k]=v;setStep(n)}
function renderStory(root){if(!root)return;let a=state.answers,html='';
 const shell=(title,copy)=>`<div class="story-head"><span class="story-id">misión 001</span><span class="story-id">${state.step<17?'en curso':'concluida'}</span></div><h1 class="story-title">${title}</h1>${copy}`;
 switch(state.step){
 case 0:html=shell('Causa indeterminada',`<div class="story-copy"><p>158 aves.</p><p>Una ciudad colombiana. Una mañana cualquiera.</p><p>Se investigaron causas. Algunas fueron descartadas. La respuesta definitiva no llegó con la misma rapidez que la noticia.</p></div>${A('<p>Me gusta “causa indeterminada”.</p><p>Suena mejor que “no sabemos”.</p><p>Lo extraño no es que algo ocurra sin explicación inmediata. Lo extraño es que después haya que almorzar.</p>')}${choices([[1,'comenzar']])}`);break;
 case 1:html=shell('Lo que cae',A('<p>Sal.</p><p>Encuentra algo que haya caído y que nadie esté intentando recoger.</p><p>No personas. No animales. No tráfico ni propiedad privada.</p><p>Cuando lo encuentres, escríbelo.</p>')+zork('una hoja, un papel, una flor…'));break;
 case 2:html=shell('Lo que permanece',A(`<p>“${esc(a.fallen)}”.</p><p>Bien. Déjalo donde está.</p><p>Ahora encuentra algo que parezca llevar mucho tiempo en su sitio. Un árbol, un muro, una escalera, un edificio.</p>`)+zork('descríbelo'));break;
 case 3:html=shell('Dos cosas',`<div class="memo">OBJETO A    ${esc(a.fallen)}\nESTADO      CAÍDO\n\nOBJETO B    ${esc(a.standing)}\nESTADO      PERMANECE</div>${A('<p>Una dejó su lugar. La otra sigue ahí.</p><p>No significa nada todavía.</p><p>Procuremos no arruinarlo demasiado pronto.</p>')}${choices([[4,'seguir']])}`);break;
 case 4:html=shell('Recorrido',A('<p>Camina unos minutos por una ruta pública que ya conozcas.</p><p>No busques nada especial.</p><p>Cuando algo que normalmente ignorarías consiga llamar tu atención, descríbelo.</p>')+zork('¿qué viste?'));break;
 case 5:html=shell('Intervalo',A(`<p>“${esc(a.observed)}”. Archivado.</p><p>Ahora quédate donde estés, siempre que sea público y seguro.</p><p>Durante tres minutos no hagas nada para esta misión.</p>`)+choices([[6,'empezar espera']]));break;
 case 6:html=shell('Mira alrededor.',`<div class="story-copy"><p>No hace falta mirar esta pantalla.</p><p>La realidad puede encargarse de los próximos tres minutos.</p></div><div class="choice-row"><button class="choice" id="waitDone">ya pasaron</button></div>`);break;
 case 7:html=shell('¿Qué pasó?',A('<p>No necesito una crónica. Solo la impresión.</p>')+choices([[8,'alguien pasó'],[9,'algo cambió'],[10,'nada'],[11,'no presté atención']]));break;
 case 12:html=shell('Patrones',A(`<p>${a.wait==='nada'?'Tres minutos y ningún acontecimiento digno de archivo. Qué lujo.':'Eso bastará.'}</p><p>Una cosa ocurre. Después otra.</p><p>Si ocurren suficientemente cerca, inventamos una relación: causa, suerte, culpa, destino.</p><p>Necesitamos patrones para orientarnos. El problema empieza cuando confundimos el patrón con el mundo.</p><p>Una vida en la que todo significara algo quizá sería peor.</p>`)+choices([[13,'continuar']]));break;
 case 13:html=shell('Una persona',A('<p>Piensa en alguien que probablemente esté teniendo un día completamente ordinario.</p><p>No necesito saber quién.</p><p>Si quieres, escríbele algo sencillo. No porque vaya a cambiar la historia. Precisamente porque probablemente no la cambie.</p>')+choices([[14,'lo hice'],[15,'prefiero no hacerlo']]));break;
 case 16:html=shell('Cierre',`<div class="memo">CAUSA       INDETERMINADA\nCAÍDO       ${esc(a.fallen)}\nPERMANECE   ${esc(a.standing)}\nOBSERVADO   ${esc(a.observed)}\nESPERA      ${esc(a.wait)}\nCONTACTO    ${esc(a.contact)}\nCONCLUSIÓN  NINGUNA</div>${A('<p>Intenté encontrar una conclusión.</p><p>No encontré ninguna.</p><p>Parece suficiente para un día.</p>')}${choices([[17,'archivar proceso']])}`);break;
 case 17:html=shell('Archivado',A('<p>El proceso terminó.</p><p>No desapareció. Ahora ocupa una carpeta.</p><p>Las personas llaman memoria a algo parecido, aunque con peor sistema de búsqueda.</p>')+`<div class="choice-row"><button class="choice" id="openCompleted">abrir memo</button></div>`);break;
 default:html=shell('Causa indeterminada',A('<p>Hay algo pendiente.</p>'));
 }
 root.innerHTML=html;wireStory(root);
}
function zork(ph){return `<form class="zork-line"><span>›</span><input autocomplete="off" placeholder="${ph}"><button>enviar</button></form>`}
function wireStory(root){root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{
 let n=+b.dataset.step;if([8,9,10,11].includes(n)){state.answers.wait={8:'alguien pasó',9:'algo cambió',10:'nada',11:'no presté atención'}[n];setStep(12)}else if([14,15].includes(n)){state.answers.contact=n===14?'realizado':'omitido';setStep(16)}else if(n===17){completeMission();setStep(17)}else setStep(n)});
 let form=root.querySelector('.zork-line');if(form)form.onsubmit=e=>{e.preventDefault();let v=form.querySelector('input').value.trim();if(!v)return;if(state.step===1)setAnswer('fallen',v,2);else if(state.step===2)setAnswer('standing',v,3);else if(state.step===4)setAnswer('observed',v,5)};
 root.querySelector('#waitDone')?.addEventListener('click',()=>setStep(7));root.querySelector('#openCompleted')?.addEventListener('click',()=>openMemo(state.events[0]));
}
function completeMission(){if(state.events.some(e=>e.id==='001'))return;state.completed=new Date().toISOString();state.events.unshift({id:'001',title:'Causa indeterminada',date:now(),status:'concluido',answers:{...state.answers},memo:'Una cosa cayó. Otra permaneció. Algo fue observado. Hubo un intervalo. Una persona pensó en otra. No se obtuvo una conclusión.'});save();archiveWindow(true)}

function archiveWindow(focus=false){let body=`<div class="story-head"><span class="story-id">procesos concluidos</span><span class="story-id">${state.events.length}</span></div><h2 class="story-title" style="font-size:34px">Archivo</h2><p>Cuando una etapa termina, deja de ocupar el presente y pasa a ocupar una carpeta.</p><div class="folder-grid">${state.events.length?state.events.map(e=>`<button class="folder" data-event="${e.id}"><div class="folder-mark">⌑</div><strong>${e.id} / ${e.title}</strong><small>${e.date}</small></button>`).join(''):'<div class="tiny">todavía no hay procesos concluidos</div>'}</div>`;let el=makeWindow('archive','archivo',body,180,105,540);el.querySelectorAll('[data-event]').forEach(b=>b.onclick=()=>openMemo(state.events.find(e=>e.id===b.dataset.event)));if(focus)el.style.zIndex=++z}
function openMemo(e){if(!e)return;$('#memoTitle').textContent=`memo / ${e.id}`;$('#memoBody').innerHTML=`<h2 style="font-weight:400">${esc(e.title)}</h2><div class="memo">ESTADO      CONCLUIDO\nFECHA       ${esc(e.date)}\n\nCAÍDO       ${esc(e.answers.fallen||'—')}\nPERMANECE   ${esc(e.answers.standing||'—')}\nOBSERVADO   ${esc(e.answers.observed||'—')}\nESPERA      ${esc(e.answers.wait||'—')}\nCONTACTO    ${esc(e.answers.contact||'—')}\n\nNOTA\n${esc(e.memo)}</div><p class="tiny" style="margin-top:18px">Este memo existe únicamente en el almacenamiento local de este dispositivo.</p>`;$('#memoDialog').showModal()}
function mapWindow(){makeWindow('map','recorrido',`<div class="story-head"><span class="story-id">mapa no geográfico</span></div><h2 class="story-title" style="font-size:34px">Recorrido</h2><p>INTERVALO no necesita dibujar la ciudad completa. Solo conserva relaciones entre momentos.</p><div class="map-abstract"><span class="map-dot" style="left:22%;top:68%"></span><span class="map-note" style="left:25%;top:66%">caída</span><span class="map-dot" style="left:49%;top:40%"></span><span class="map-note" style="left:52%;top:38%">permanencia</span><span class="map-dot" style="left:77%;top:58%"></span><span class="map-note" style="left:61%;top:62%">intervalo</span></div>`,320,65,480)}
function aboutWindow(){makeWindow('about','nota',`<div class="story-head"><span class="story-id">sobre esta experiencia</span></div><h2 class="story-title" style="font-size:34px">No es una brújula.</h2><div class="story-copy"><p>No intenta decirte dónde debes ir.</p><p>La orientación ocurre debajo de la historia: apertura, peso, aparición, despedida, espera, retorno.</p><p>El sistema solo organiza escenas. Tú decides si significan algo.</p></div><div class="choice-row"><button class="choice" id="resetAll">borrar recorrido local</button></div>`,410,150,450);$('#resetAll').onclick=()=>{if(confirm('¿Borrar todo el recorrido guardado en este dispositivo?')){localStorage.removeItem(KEY);location.reload()}}}
boot();
