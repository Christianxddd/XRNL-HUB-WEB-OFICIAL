/* Matrix rain */
(function(){
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let width, height, cols, fontSize, drops;
  const chars = "01一二三四五六七八九零@#$%&*!<>/?=+-";
  function resize(){ width = canvas.width = innerWidth; height = canvas.height = innerHeight; fontSize = Math.max(12, Math.min(18, Math.floor(width/120))); cols = Math.floor(width/fontSize); drops = Array.from({length:cols}).map(()=>Math.random()*height); ctx.font = fontSize + "px monospace"; }
  window.addEventListener('resize', resize);
  resize();
  function draw(){
    ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(0,0,width,height);
    ctx.fillStyle = "rgba(0,255,209,0.85)";
    for(let i=0;i<cols;i++){
      const text = chars.charAt(Math.floor(Math.random()*chars.length));
      const x = i * ctx.measureText('あ').width;
      const y = drops[i] * 1.2;
      ctx.fillText(text, x, y);
      if(drops[i] * ctx.measureText('あ').width > height && Math.random() > 0.975) drops[i]=0;
      drops[i] += Math.random()*7+2;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* SPA tab navigation */
(function(){
  function showView(name){
    document.querySelectorAll('.view').forEach(v=>v.style.display='none');
    const el = document.getElementById(name);
    if(el) el.style.display = '';
    document.querySelectorAll('.tab').forEach(t=>{ t.classList.toggle('active', t.dataset.target === name); });
  }
  // initial
  showView('home');
  // tab clicks
  document.querySelectorAll('.tab, .sidebar .btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const t = btn.dataset.target;
      if(t) showView(t);
    });
  });
  // helper buttons
  document.getElementById('btn-open-messages').addEventListener('click', ()=>showView('messages'));
})();

/* Sample scripts list (can be extended) */
const SAMPLE_SCRIPTS = [
  {title:'XRNL HUB', desc:'Panel flotante con ESP, Speed, Jump, Teleport y secciones', load:'https://raw.githubusercontent.com/tuusuario/loadring/main/xrnl_hub.lua'},
  {title:'Tides of Crystals', desc:'Juego estilo Blox Fruits con cristales y DataStore', load:'https://raw.githubusercontent.com/tuusuario/loadring/main/tides_of_crystals.lua'},
  {title:'Access Joiner', desc:'Script para unirse a servidores privados usando códigos', load:'https://raw.githubusercontent.com/tuusuario/loadring/main/access_joiner.lua'}
];
function renderScripts(){
  const container = document.getElementById('scripts-list');
  container.innerHTML = '';
  SAMPLE_SCRIPTS.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'script-item';
    el.innerHTML = `<div style="max-width:70%"><div style="font-weight:700">${s.title}</div><div style="color:var(--muted)">${s.desc}</div></div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn small" onclick="copyLoad('${encodeURIComponent(s.load)}')">Copiar</button>
        <a class="btn small" href="${s.load}" target="_blank">Abrir</a>
      </div>`;
    container.appendChild(el);
  });
}
renderScripts();
function copyLoad(urlEnc){
  const txt = `loadstring(game:HttpGet(decodeURIComponent('${urlEnc}')))()`;
  navigator.clipboard?.writeText(txt).then(()=>alert('Loadstring copiado al portapapeles'), ()=>alert('Copia manual: '+txt));
}

/* Search */
document.getElementById('search-btn').addEventListener('click', ()=>{
  const q = document.getElementById('global-search').value.trim().toLowerCase();
  const results = [];
  SAMPLE_SCRIPTS.forEach(s=>{ if(s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)) results.push(s); });
  const resEl = document.getElementById('search-results');
  if(results.length===0) resEl.textContent = 'No hay resultados';
  else resEl.innerHTML = results.map(r=>`<div style="padding:6px;border-bottom:1px dashed rgba(255,255,255,0.02)"><strong>${r.title}</strong> — <span style="color:var(--muted)">${r.desc}</span></div>`).join('');
});

/* Messages repository (localStorage) */
const MSG_KEY = 'loadring_messages_v1';
function getMsgs(){ try{ const raw=localStorage.getItem(MSG_KEY); return raw?JSON.parse(raw):[] }catch(e){return[]} }
function saveMsgs(arr){ localStorage.setItem(MSG_KEY, JSON.stringify(arr)) }
function renderMsgs(filter=''){
  const list = document.getElementById('msg-list');
  list.innerHTML = '';
  const arr = getMsgs();
  const filtered = arr.filter(m=>m.text.toLowerCase().includes(filter.toLowerCase()));
  if(filtered.length===0){ list.innerHTML = `<div style="color:var(--muted)">No hay mensajes</div>`; return; }
  filtered.forEach((m,idx)=>{
    const node = document.createElement('div'); node.className='msg';
    node.innerHTML = `<div style="flex:1"><p>${escapeHtml(m.text)}</p><small>${new Date(m.created).toLocaleString()}</small></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn small" onclick="useMsg(${idx})">Usar</button>
        <button class="btn small" onclick="delMsg(${idx})">Borrar</button>
      </div>`;
    list.appendChild(node);
  });
}
function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }
function addMsg(text){
  if(!text || !text.trim()) return alert('Escribe un mensaje');
  const arr = getMsgs();
  arr.unshift({text:text.trim(), created: Date.now()});
  saveMsgs(arr);
  renderMsgs(document.getElementById('filter-msg').value || '');
  document.getElementById('new-msg').value='';
}
function delMsg(index){
  const arr = getMsgs();
  if(index<0 || index>=arr.length) return;
  if(!confirm('Borrar mensaje?')) return;
  arr.splice(index,1);
  saveMsgs(arr);
  renderMsgs(document.getElementById('filter-msg').value || '');
}
function useMsg(index){
  const arr = getMsgs();
  if(!arr[index]) return alert('Mensaje no encontrado');
  const txt = arr[index].text;
  navigator.clipboard?.writeText(txt).then(()=>alert('Mensaje copiado'), ()=>alert('Copia manual: '+txt));
  document.getElementById('last-random').textContent = txt;
}

/* Tools bindings */
document.getElementById('add-msg').addEventListener('click', ()=>addMsg(document.getElementById('new-msg').value));
document.getElementById('filter-msg').addEventListener('input', (e)=>renderMsgs(e.target.value));
document.getElementById('pick-random').addEventListener('click', ()=>{
  const arr = getMsgs();
  if(arr.length===0) return alert('No hay mensajes');
  const choice = arr[Math.floor(Math.random()*arr.length)];
  document.getElementById('last-random').textContent = choice.text;
  navigator.clipboard?.writeText(choice.text).catch(()=>{});
});
document.getElementById('clear-msgs').addEventListener('click', ()=>{
  if(!confirm('Borrar todos los mensajes?')) return;
  localStorage.removeItem(MSG_KEY);
  renderMsgs();
});
document.getElementById('export-msgs').addEventListener('click', ()=>{
  const arr = getMsgs();
  const blob = new Blob([JSON.stringify(arr, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'loadring_messages.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});
document.getElementById('btn-trigger-import').addEventListener('click', ()=>document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = function(){ try{ const arr=JSON.parse(reader.result); if(Array.isArray(arr)){ saveMsgs(arr); renderMsgs(); alert('Importado'); } else alert('Formato inválido'); }catch(err){ alert('Error al importar: '+err.message) } }
  reader.readAsText(f);
});
document.getElementById('copy-random').addEventListener('click', ()=>{
  const last = document.getElementById('last-random').textContent;
  if(!last || last==='— Ninguno —') return alert('No hay mensaje'); navigator.clipboard?.writeText(last).then(()=>alert('Copiado'), ()=>alert('Copia manual: '+last));
});

/* Init messages with sample data if empty */
(function initSampleMsgs(){
  const cur = getMsgs();
  if(cur.length===0){
    const samples = [
      {text:'Tip: prueba scripts en servidores privados antes de usarlos publicamente.', created: Date.now()},
      {text:'Mensaje: XRNL HUB listo para integrarse en tu proyecto.', created: Date.now()},
      {text:'Frase: Nunca compartas tus credenciales.', created: Date.now()}
    ];
    saveMsgs(samples);
  }
  renderMsgs();
})();

/* Copy loadstring utility */
document.getElementById('copy-loadstring').addEventListener('click', ()=>{
  const txt = 'loadstring(game:HttpGet("https://raw.githubusercontent.com/tuusuario/loadring/main/main.lua"))()';
  navigator.clipboard?.writeText(txt).then(()=>alert('Loadstring copiado'), ()=>alert('Copia manual: '+txt));
});

/* Export / import repo (placeholder) */
document.getElementById('btn-export').addEventListener('click', ()=>{
  const data = {scripts:SAMPLE_SCRIPTS, messages:getMsgs()};
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='loadring_export.json'; document.body.appendChild(a); a.click(); a.remove();
});
document.getElementById('btn-import').addEventListener('click', ()=>{ alert('Usa la sección Mensajes > Importar JSON para importar mensajes. Para scripts, edita el archivo HTML.'); });

/* Links placeholders */
document.getElementById('github-link').addEventListener('click', ()=>window.open('https://github.com/tuusuario/loadring','_blank'));
document.getElementById('tiktok-link').addEventListener('click', ()=>window.open('https://www.tiktok.com/@christ_sebast_7d'));
document.getElementById('instagram-link').addEventListener('click', ()=>window.open('https://www.instagram.com/roseb_astian/'));

/* Other small helpers */
document.getElementById('changelog-copy').addEventListener('click', ()=>{ navigator.clipboard?.writeText('Changelog: 2025-10-05 — SPA mejorada con repositorio de mensajes y navegación por pestañas.').then(()=>alert('Changelog copiado')); });

document.getElementById('download-zip').addEventListener('click', (e)=>{ e.preventDefault(); alert('Placeholder: sube tu repo a GitHub y actualiza el enlace.'); });

document.getElementById('open-github').addEventListener('click', ()=>window.open('https://github.com/tuusuario/loadring','_blank'));

/* keyboard shortcuts */
document.addEventListener('keydown', (e)=>{
  if(e.key==='/' && document.activeElement.tagName!=='INPUT') { e.preventDefault(); document.getElementById('global-search').focus(); }
  if(e.key==='m') { e.preventDefault(); const v=document.getElementById('messages'); if(v.style.display==='') showView('home'); else showView('messages'); }
});

// showView helper (re-used in multiple places)
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.style.display='none');
  const el = document.getElementById(name);
  if(el) el.style.display = '';
  document.querySelectorAll('.tab').forEach(t=>{ t.classList.toggle('active', t.dataset.target === name); });
}
