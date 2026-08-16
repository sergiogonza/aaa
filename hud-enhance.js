(()=>{
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  let mounted=false;
  function folderIcon(label,app){return `<button class="desktop-icon" data-desktop-app="${app}"><div class="folder-svg"></div><span>${label}</span></button>`}
  function mount(){
    const desktop=qs('.desktop'); if(!desktop||desktop.dataset.hudEnhanced)return;
    desktop.dataset.hudEnhanced='1'; mounted=true;
    const workspace=qs('#workspace');
    const icons=document.createElement('aside'); icons.className='desktop-icons';
    icons.innerHTML=folderIcon('MISIONES','story')+folderIcon('ARCHIVO','archive')+folderIcon('RECORRIDO','map')+folderIcon('SISTEMA','about');
    desktop.insertBefore(icons,workspace);
    qsa('[data-desktop-app]',icons).forEach(b=>b.onclick=()=>window.openApp?.(b.dataset.desktopApp));
    decorateWindows();
    const observer=new MutationObserver(()=>decorateWindows()); observer.observe(workspace,{childList:true,subtree:true});
    addStatusWindow();
  }
  function decorateWindows(){
    qsa('.window').forEach(w=>{
      if(w.dataset.decorated)return;w.dataset.decorated='1';
      w.classList.add('static');
      const title=qs('.window-title',w); if(title)title.textContent='SYS://'+title.textContent.toUpperCase();
    });
  }
  function addStatusWindow(){
    if(!window.makeWindow||qs('#win-status'))return;
    const body=`<div class="terminal-card"><div class="tiny">INTERVALO / LOCAL NODE</div><p><span class="accent">● ONLINE</span> &nbsp; almacenamiento: LOCAL</p><p>Las ventanas pueden moverse, minimizarse, maximizarse y cerrarse.</p><p class="amber">Los procesos concluidos aparecen en ARCHIVO como carpetas.</p></div><div class="terminal-card"><span class="tiny">COMANDOS</span><p>&gt; abrir MISIONES</p><p>&gt; abrir ARCHIVO</p><p>&gt; observar / responder / archivar</p></div>`;
    const w=window.makeWindow('status','terminal / estado',body,Math.max(120,innerWidth-440),55,360);w.style.height='270px';
  }
  function enhanceArchive(){
    const w=qs('#win-archive');if(!w)return;
    qsa('.folder',w).forEach(f=>{if(f.dataset.fs)return;f.dataset.fs='1';f.title='Abrir carpeta del proceso concluido';});
  }
  document.addEventListener('click',e=>{if(e.target.closest('[data-app="archive"],[data-desktop-app="archive"]'))setTimeout(enhanceArchive,30)});
  const rootObserver=new MutationObserver(()=>{mount();enhanceArchive()});rootObserver.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
