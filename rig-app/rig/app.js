/* Rig – Angeltagebuch · App-Logik */
'use strict';

/* =========================================================
   Konstanten
   ========================================================= */
const SPECIES = ['Hecht','Zander','Barsch','Forelle','Karpfen','Wels','Aal','Weißfisch','Sonstige'];
const WEATHER = [
  {id:'sonnig', name:'Sonnig'}, {id:'bewoelkt', name:'Bewölkt'}, {id:'regen', name:'Regen'},
  {id:'wind', name:'Windig'}, {id:'nebel', name:'Nebel'}
];
const DEFAULT_BAITS = ['Gummifisch','Spinner','Wobbler','Blinker','Jig','Tauwurm','Made','Mais','Boilie','Köderfisch','Fliege'];
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

const IC = {
  fish:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c3-4 7-6 11-6 4 0 7 2.5 9 6-2 3.5-5 6-9 6-4 0-8-2-11-6z"/><path d="M13 6l3-3M13 18l3 3"/><circle cx="8.5" cy="11" r=".9" fill="currentColor" stroke="none"/></svg>`,
  pin:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s7-7.4 7-12.5A7 7 0 0 0 5 9.5C5 14.6 12 22 12 22z"/><circle cx="12" cy="9.5" r="2"/></svg>`,
  camera:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
  close:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
  down:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>`,
  up:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>`,
  flat:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12h16M14 6l6 6-6 6"/></svg>`,
  sonnig:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  bewoelkt:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 18h12a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.7-1.7A4.5 4.5 0 0 0 6 18z"/></svg>`,
  regen:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 15h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6-1.6A4.4 4.4 0 0 0 6 15z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/></svg>`,
  wind:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 8h11a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3 13h15a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3 18h9"/></svg>`,
  nebel:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h16M2 12h20M4 16h16M6 20h12"/></svg>`,
  thermo:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/></svg>`
};

/* =========================================================
   Hilfsfunktionen
   ========================================================= */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
function esc(s){ return String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function fmtDate(d){ if(!d) return '–'; const [y,m,day] = d.split('-'); return `${day}.${m}.${y}`; }
function fmtNum(n, digits=1){ return Number(n).toLocaleString('de-DE', {maximumFractionDigits:digits}); }
function sortKey(c){ return (c.datum||'') + 'T' + (c.zeit||'00:00'); }
function sortCatches(){ CATCHES.sort((a,b) => sortKey(b).localeCompare(sortKey(a))); }
function catchTime(c){ return new Date(sortKey(c)).getTime(); }
function todayStr(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function nowTime(){ const d=new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function shiftDate(d, n){ const dt = new Date(d+'T12:00:00Z'); dt.setUTCDate(dt.getUTCDate()+n); return dt.toISOString().slice(0,10); }
function uid(){ return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function haversine(a, b){
  const R=6371000, toR=x=>x*Math.PI/180;
  const dLat=toR(b.lat-a.lat), dLng=toR(b.lng-a.lng);
  const h=Math.sin(dLat/2)**2 + Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function lsGet(k, fallback){ try{ const v = localStorage.getItem(k); return v===null ? fallback : v; }catch(e){ return fallback; } }
function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

let toastTimer;
function toast(msg, ms=2400){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove('show'), ms);
}

/* =========================================================
   Mondphase (lokal berechnet, keine Internetverbindung nötig)
   ========================================================= */
const MOON_NAMES = ['Neumond','Zunehmende Sichel','Erstes Viertel','Zunehmender Mond','Vollmond','Abnehmender Mond','Letztes Viertel','Abnehmende Sichel'];
function moonPhase(datum, zeit){
  const t = new Date(datum + 'T' + (zeit || '12:00')).getTime();
  const ref = Date.UTC(2000, 0, 6, 18, 14);   // bekannter Neumond
  const syn = 29.530588853;
  let age = ((t - ref) / 864e5) % syn; if(age < 0) age += syn;
  const frac = age / syn;
  return { frac, age, name: MOON_NAMES[Math.floor(frac*8 + 0.5) % 8], illum: (1 - Math.cos(2*Math.PI*frac)) / 2 };
}
function moonQuarter(frac){ return Math.floor(((frac + 0.125) % 1) * 4); } // 0 Neumond, 1 zunehmend, 2 Vollmond, 3 abnehmend
function moonSvg(frac){
  const r=9, cx=10, cy=10;
  const k = Math.cos(2*Math.PI*frac);
  const rx = Math.abs(k) * r;
  const waxing = frac < 0.5;
  const outer = waxing ? 1 : 0;
  const inner = ((k > 0) === waxing) ? 0 : 1;
  const lit = frac > 0.97 || frac < 0.03 ? '' :
    `<path d="M${cx},${cy-r} A${r},${r} 0 0 ${outer} ${cx},${cy+r} A${rx.toFixed(2)},${r} 0 0 ${inner} ${cx},${cy-r}Z" fill="#e8c374"/>`;
  return `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b4d49" stroke="rgba(232,241,236,.25)" stroke-width=".8"/>${lit}</svg>`;
}

/* =========================================================
   Speicher: IndexedDB (verträgt auch viele Fotos)
   ========================================================= */
let dbPromise;
function idb(){
  if(!dbPromise){
    dbPromise = new Promise((res, rej) => {
      const r = indexedDB.open('rig', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if(!d.objectStoreNames.contains('catches')) d.createObjectStore('catches', {keyPath:'id'});
        if(!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return dbPromise;
}
async function dbReq(store, mode, fn){
  const d = await idb();
  return new Promise((res, rej) => {
    const tx = d.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => res(req ? req.result : undefined);
    tx.onerror = () => rej(tx.error);
    tx.onabort = () => rej(tx.error);
  });
}
const dbAll   = () => dbReq('catches', 'readonly', s => s.getAll());
const dbPut   = c  => dbReq('catches', 'readwrite', s => s.put(c));
const dbDel   = id => dbReq('catches', 'readwrite', s => s.delete(id));
const metaGet = k  => dbReq('meta', 'readonly', s => s.get(k));
const metaSet = (k, v) => dbReq('meta', 'readwrite', s => s.put(v, k));

/* =========================================================
   Zustand
   ========================================================= */
let CATCHES = [];
let lastBackup = null;
let currentView = null;
let currentRoute = null;
let detailId = null;
const form = { species:null, weather:null, verbleib:null, photo:null, thumb:null, pos:null, editingId:null };

/* =========================================================
   Navigation (Hash-Routen, Zurück-Taste von Android funktioniert)
   ========================================================= */
const TABS = ['home','map','stats'];
let openOverlay = null;
let afterOverlayClose = null;

function navigate(hash, {replace=false}={}){
  const state = { inApp:true };
  if(replace) history.replaceState(state, '', '#'+hash);
  else history.pushState(state, '', '#'+hash);
  route();
}
function goTab(tab){
  const cur = (location.hash.slice(1) || 'home');
  navigate(tab, {replace: TABS.includes(cur)});
}
function goBack(){
  if(history.state && history.state.inApp) history.back();
  else navigate('home', {replace:true});
}
function showOverlay(el){
  el.hidden = false; openOverlay = el;
  history.pushState({inApp:true, overlay:true}, '', location.hash);
}
function closeOverlay(then){
  afterOverlayClose = then || null;
  if(history.state && history.state.overlay) history.back();
  else { hideOverlayNow(); }
}
function hideOverlayNow(){
  if(openOverlay){ openOverlay.hidden = true; openOverlay = null; }
  const fn = afterOverlayClose; afterOverlayClose = null;
  if(fn) setTimeout(fn, 0);
}
window.addEventListener('popstate', () => {
  if(openOverlay){ hideOverlayNow(); return; }
  route();
});

function setView(name){
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-'+name));
  document.body.classList.toggle('no-nav', name==='form' || name==='detail');
  $('#fab').hidden = name !== 'home';
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === name));
  currentView = name;
}
function route(){
  const h = location.hash.slice(1) || 'home';
  const same = h === currentRoute;
  currentRoute = h;
  if(h === 'home'){ setView('home'); renderHome(); }
  else if(h === 'map'){ setView('map'); renderAllMap(); }
  else if(h === 'stats'){ setView('stats'); renderStats(); }
  else if(h === 'new'){ if(!same || currentView!=='form') openForm(null); setView('form'); }
  else if(h.startsWith('edit-')){ if(!same || currentView!=='form') openForm(h.slice(5)); setView('form'); }
  else if(h.startsWith('catch-')){
    const id = h.slice(6);
    if(!CATCHES.some(c => c.id === id)){ navigate('home', {replace:true}); return; }
    setView('detail'); renderDetail(id);
  }
  else navigate('home', {replace:true});
  if(!same) { const v = $('.view.active'); if(v && h !== 'map') v.scrollTop = 0; }
}

/* =========================================================
   Übersicht
   ========================================================= */
function renderHome(){
  const n = CATCHES.length;
  let biggest = null; const freq = {};
  CATCHES.forEach(c => {
    if(c.groesse && (!biggest || c.groesse > biggest.groesse)) biggest = c;
    freq[c.speciesName] = (freq[c.speciesName]||0) + 1;
  });
  const top = Object.entries(freq).sort((a,b) => b[1]-a[1])[0];
  const last = CATCHES[0];
  $('#statsGrid').innerHTML = `
    <div class="stat"><div class="stat-num">${n}</div><div class="stat-label">Fänge</div></div>
    <div class="stat"><div class="stat-num">${biggest ? fmtNum(biggest.groesse)+' cm' : '–'}</div><div class="stat-label">Größter${biggest ? ' · '+esc(biggest.speciesName) : ' Fisch'}</div></div>
    <div class="stat"><div class="stat-num sm">${top ? esc(top[0]) : '–'}</div><div class="stat-label">Häufigste Art</div></div>
    <div class="stat"><div class="stat-num sm">${last ? fmtDate(last.datum) : '–'}</div><div class="stat-label">Letzter Fang</div></div>`;

  // Backup-Erinnerung
  const banner = $('#backupBanner');
  const days = lastBackup ? Math.floor((Date.now() - lastBackup) / 864e5) : null;
  if(n >= 5 && (days === null || days > 30)){
    banner.innerHTML = `<div class="banner"><div>${days === null ? '<b>Noch kein Backup.</b> Sichere deine Fänge, damit nichts verloren geht.' : `<b>Letztes Backup vor ${days} Tagen.</b> Zeit für ein neues.`}</div><button class="btn btn-ghost btn-sm" type="button" id="bannerBackup">Sichern</button></div>`;
    $('#bannerBackup').onclick = () => { goTab('stats'); setTimeout(() => $('#backup').scrollIntoView({behavior:'smooth'}), 60); };
  } else banner.innerHTML = '';

  $('#searchWrap').hidden = n < 6;
  renderList();
}

function renderList(){
  const q = ($('#search').value || '').trim().toLowerCase();
  const list = q ? CATCHES.filter(c =>
      [c.speciesName, c.ort, c.koeder, c.notizen].some(f => f && f.toLowerCase().includes(q))) : CATCHES;
  $('#catchCount').textContent = CATCHES.length ? (q ? `${list.length} von ${CATCHES.length}` : `${CATCHES.length} Einträge`) : '';
  const box = $('#catchList');
  if(!CATCHES.length){
    box.innerHTML = `<div class="empty">${IC.fish}<p>Noch kein Fang eingetragen.<br><b>Tippe auf „Neuer Fang“</b>, um dein erstes Angelerlebnis festzuhalten.</p></div>`;
    return;
  }
  if(!list.length){ box.innerHTML = `<div class="empty"><p>Keine Fänge zu „${esc(q)}“.</p></div>`; return; }

  let html = '', month = null;
  list.forEach(c => {
    const m = c.datum.slice(0,7);
    if(m !== month){
      if(month !== null) html += '</div>';
      const [y, mm] = m.split('-');
      html += `<div class="month-label">${MONTHS[+mm-1]} ${y}</div><div class="catch-list">`;
      month = m;
    }
    const img = c.thumb || c.foto;
    html += `<button class="catch-card" type="button" data-id="${esc(c.id)}">
      <div class="thumb">${img ? `<img src="${img}" alt="" loading="lazy">` : IC.fish}</div>
      <div class="catch-body">
        <div class="catch-top"><div class="catch-species">${esc(c.speciesName)}</div>${c.groesse ? `<div class="catch-size">${fmtNum(c.groesse)} cm</div>` : ''}</div>
        <div class="catch-meta">${fmtDate(c.datum)} · ${esc(c.zeit)}</div>
        <div class="catch-sub">${IC.pin}<span>${esc(c.ort)}${c.koeder ? ' · '+esc(c.koeder) : ''}</span></div>
      </div></button>`;
  });
  html += '</div>';
  box.innerHTML = html;
}

/* =========================================================
   Formular
   ========================================================= */
function renderChips(){
  $('#speciesGrid').innerHTML = SPECIES.map(s =>
    `<button type="button" class="chip" data-species="${s}">${IC.fish}<span>${s}</span></button>`).join('');
  $('#weatherGrid').innerHTML = WEATHER.map(w =>
    `<button type="button" class="chip" data-weather="${w.id}">${IC[w.id]}<span>${w.name}</span></button>`).join('');
}
function selectSpecies(s){
  form.species = s;
  $$('#speciesGrid .chip').forEach(el => el.classList.toggle('selected', el.dataset.species === s));
  $('#customSpecies').hidden = s !== 'Sonstige';
}
function selectWeather(id){
  form.weather = form.weather === id ? null : id;
  $$('#weatherGrid .chip').forEach(el => el.classList.toggle('selected', el.dataset.weather === form.weather));
}
function selectVerbleib(v){
  form.verbleib = form.verbleib === v ? null : v;
  $$('#verbleibSeg button').forEach(el => el.classList.toggle('selected', el.dataset.v === form.verbleib));
}
function setPos(pos){
  form.pos = pos ? {lat:+pos.lat.toFixed(6), lng:+pos.lng.toFixed(6)} : null;
  const box = $('#locChosen');
  if(!form.pos){ box.hidden = true; return; }
  box.hidden = false;
  $('#locCoords').innerHTML = `${form.pos.lat.toFixed(5)}, ${form.pos.lng.toFixed(5)}<small>Position gespeichert</small>`;
  const ort = $('#fOrt');
  if(!ort.value.trim()){
    const near = nearestOrt(form.pos);
    if(near){ ort.value = near; toast(`Gewässer übernommen: ${near}`); }
  }
}
function nearestOrt(pos){
  let best = null;
  CATCHES.forEach(c => {
    if(!c.position || c.id === form.editingId) return;
    const d = haversine(pos, c.position);
    if(d < 800 && (!best || d < best.d)) best = {d, ort:c.ort};
  });
  return best ? best.ort : null;
}
function fillDatalists(){
  const count = (key) => {
    const m = new Map();
    CATCHES.forEach(c => { const v = (c[key]||'').trim(); if(v) m.set(v, (m.get(v)||0)+1); });
    return [...m.entries()].sort((a,b) => b[1]-a[1]).map(e => e[0]);
  };
  $('#ortList').innerHTML = count('ort').map(o => `<option value="${esc(o)}">`).join('');
  const baits = count('koeder');
  DEFAULT_BAITS.forEach(b => { if(!baits.some(x => x.toLowerCase() === b.toLowerCase())) baits.push(b); });
  $('#koederList').innerHTML = baits.map(o => `<option value="${esc(o)}">`).join('');
}
function renderPhoto(){
  const box = $('#photoDrop');
  if(form.photo){
    box.innerHTML = `<div class="photo-drop has-photo"><img src="${form.photo}" alt="Foto des Fangs"><button class="photo-remove" type="button" id="photoRemove" aria-label="Foto entfernen">${IC.close}</button></div>`;
    $('#photoRemove').onclick = (e) => { e.stopPropagation(); form.photo = null; form.thumb = null; renderPhoto(); };
  } else {
    box.innerHTML = `<button class="photo-drop" type="button" id="photoPick">${IC.camera}<div>Foto aufnehmen oder auswählen</div></button>`;
    $('#photoPick').onclick = () => $('#photoInput').click();
  }
}

function openForm(editId){
  Object.assign(form, { species:null, weather:null, verbleib:null, photo:null, thumb:null, pos:null, editingId:null });
  renderChips(); fillDatalists();
  ['fOrt','fGroesse','fGewicht','fKoeder','fNotizen','customSpecies'].forEach(id => $('#'+id).value = '');
  $('#customSpecies').hidden = true;
  $$('#verbleibSeg button').forEach(b => b.classList.remove('selected'));
  setPos(null);
  const c = editId ? CATCHES.find(x => x.id === editId) : null;
  if(c){
    form.editingId = c.id;
    $('#formModeLabel').textContent = 'Fang bearbeiten';
    const known = SPECIES.includes(c.speciesName) && c.speciesName !== 'Sonstige';
    selectSpecies(known ? c.speciesName : 'Sonstige');
    if(!known) $('#customSpecies').value = c.speciesName === 'Sonstige' ? '' : c.speciesName;
    if(c.weather) selectWeather(c.weather);
    if(c.verbleib) selectVerbleib(c.verbleib);
    $('#fOrt').value = c.ort || '';
    $('#fDatum').value = c.datum; $('#fZeit').value = c.zeit;
    $('#fGroesse').value = c.groesse ?? ''; $('#fGewicht').value = c.gewicht ?? '';
    $('#fKoeder').value = c.koeder || ''; $('#fNotizen').value = c.notizen || '';
    form.photo = c.foto || null; form.thumb = c.thumb || null;
    form.pos = c.position || null;
    if(form.pos){ $('#locChosen').hidden = false; $('#locCoords').innerHTML = `${form.pos.lat.toFixed(5)}, ${form.pos.lng.toFixed(5)}<small>Position gespeichert</small>`; }
  } else {
    $('#formModeLabel').textContent = 'Neuer Fang';
    $('#fDatum').value = todayStr(); $('#fZeit').value = nowTime();
  }
  renderPhoto();
}

async function processPhoto(file){
  const url = URL.createObjectURL(file);
  try{
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const w = img.naturalWidth, h = img.naturalHeight;
    const s = Math.min(1, 1400 / Math.max(w, h));
    const cv = document.createElement('canvas'); cv.width = Math.round(w*s); cv.height = Math.round(h*s);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    form.photo = cv.toDataURL('image/jpeg', 0.78);
    const side = Math.min(w, h), t = document.createElement('canvas'); t.width = t.height = 160;
    t.getContext('2d').drawImage(img, (w-side)/2, (h-side)/2, side, side, 0, 0, 160, 160);
    form.thumb = t.toDataURL('image/jpeg', 0.72);
    renderPhoto();
  } catch(e){ toast('Das Foto konnte nicht gelesen werden.'); }
  finally{ URL.revokeObjectURL(url); }
}

function parseNum(v){ if(v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) && n > 0 ? n : null; }

async function saveForm(){
  const ort = $('#fOrt').value.trim(), datum = $('#fDatum').value, zeit = $('#fZeit').value;
  let speciesName = form.species;
  if(form.species === 'Sonstige') speciesName = $('#customSpecies').value.trim() || 'Sonstige';
  const missing = [];
  if(!form.species) missing.push(['Fischart', '#speciesGrid']);
  if(!ort) missing.push(['Ort', '#fOrt']);
  if(!datum) missing.push(['Datum', '#fDatum']);
  if(!zeit) missing.push(['Uhrzeit', '#fZeit']);
  if(missing.length){
    toast('Bitte noch angeben: ' + missing.map(m => m[0]).join(', '));
    $(missing[0][1]).scrollIntoView({behavior:'smooth', block:'center'});
    return;
  }
  const old = form.editingId ? CATCHES.find(c => c.id === form.editingId) : null;
  const entry = {
    ...(old || {}),
    id: old ? old.id : uid(),
    speciesName, ort, datum, zeit,
    groesse: parseNum($('#fGroesse').value),
    gewicht: parseNum($('#fGewicht').value),
    koeder: $('#fKoeder').value.trim() || null,
    weather: form.weather,
    weatherAuto: old && old.weather === form.weather ? !!old.weatherAuto : false,
    verbleib: form.verbleib,
    notizen: $('#fNotizen').value.trim() || null,
    foto: form.photo, thumb: form.thumb,
    position: form.pos,
    createdAt: old ? old.createdAt : Date.now(),
    updatedAt: Date.now()
  };
  const condInvalid = !old || old.datum !== datum || old.zeit !== zeit ||
    JSON.stringify(old.position || null) !== JSON.stringify(form.pos || null);
  if(condInvalid){ entry.conditions = null; entry.condTries = 0; entry.condPending = !!form.pos; }

  try{ await dbPut(entry); }
  catch(e){ toast('Speichern fehlgeschlagen: Der Gerätespeicher ist voll oder gesperrt.', 4000); return; }
  if(old) CATCHES[CATCHES.indexOf(old)] = entry; else CATCHES.push(entry);
  sortCatches(); mapDirty = true;
  if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(()=>{});
  toast(old ? 'Änderungen gespeichert' : 'Fang gespeichert');
  goBack();
  if(entry.condPending) enrich(entry.id);
}

/* =========================================================
   Wetterdaten zur Fangzeit (Open-Meteo, kostenlos, ohne Konto)
   ========================================================= */
const enriching = new Set();
function weatherFromCode(code, wind){
  let w = null;
  if(code <= 1) w = 'sonnig';
  else if(code <= 3) w = 'bewoelkt';
  else if(code === 45 || code === 48) w = 'nebel';
  else if(code >= 51) w = 'regen';
  if(wind >= 30 && (w === 'sonnig' || w === 'bewoelkt')) w = 'wind';
  return w;
}
function windDir(deg){ return ['N','NO','O','SO','S','SW','W','NW'][Math.round(((deg % 360) / 45)) % 8]; }

async function fetchJson(url, ms=9000){
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try{ const r = await fetch(url, {signal:ctl.signal}); if(!r.ok) throw Object.assign(new Error('HTTP '+r.status), {server:true}); return await r.json(); }
  finally{ clearTimeout(t); }
}
async function fetchConditions(c){
  const day = c.datum, prev = shiftDate(day, -1);
  const ageDays = (Date.now() - catchTime(c)) / 864e5;
  const params = new URLSearchParams({
    latitude: c.position.lat.toFixed(4), longitude: c.position.lng.toFixed(4),
    hourly: 'temperature_2m,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code',
    start_date: prev, end_date: day, timezone: 'auto', wind_speed_unit: 'kmh'
  });
  const forecast = 'https://api.open-meteo.com/v1/forecast?' + params;
  const archive = 'https://archive-api.open-meteo.com/v1/archive?' + params;
  const urls = ageDays > 60 ? [archive, forecast] : [forecast, archive];
  let lastErr;
  for(const url of urls){
    try{
      const j = await fetchJson(url);
      const H = j.hourly; if(!H || !H.time) throw Object.assign(new Error('keine Daten'), {server:true});
      const idx = H.time.indexOf(day + 'T' + c.zeit.slice(0,2) + ':00');
      const p = H.pressure_msl?.[idx];
      if(idx < 0 || p == null) throw Object.assign(new Error('Zeitpunkt fehlt'), {server:true});
      const p3 = H.pressure_msl[idx-3];
      const diff = p3 == null ? null : p - p3;
      const wind = H.wind_speed_10m?.[idx];
      const code = H.weather_code?.[idx];
      return {
        temp: H.temperature_2m?.[idx] ?? null,
        pressure: Math.round(p),
        pressureDiff: diff == null ? null : Math.round(diff*10)/10,
        trend: diff == null ? null : diff <= -1 ? 'fallend' : diff >= 1 ? 'steigend' : 'stabil',
        wind: wind ?? null,
        windDir: H.wind_direction_10m?.[idx] ?? null,
        code: code ?? null,
        weatherGuess: code == null ? null : weatherFromCode(code, wind || 0)
      };
    } catch(e){ lastErr = e; }
  }
  throw lastErr;
}
async function enrich(id){
  const c = CATCHES.find(x => x.id === id);
  if(!c || !c.condPending || !c.position || enriching.has(id) || !navigator.onLine) return;
  if(catchTime(c) > Date.now()) return; // Fangzeit liegt in der Zukunft
  enriching.add(id);
  try{
    const cond = await fetchConditions(c);
    const cur = CATCHES.find(x => x.id === id); if(!cur) return;
    cur.conditions = cond; cur.condPending = false;
    if(!cur.weather && cond.weatherGuess){ cur.weather = cond.weatherGuess; cur.weatherAuto = true; }
    await dbPut(cur); refresh();
  } catch(e){
    const cur = CATCHES.find(x => x.id === id);
    if(cur && e.server){ cur.condTries = (cur.condTries||0) + 1; if(cur.condTries >= 6) cur.condPending = false; await dbPut(cur).catch(()=>{}); }
  } finally { enriching.delete(id); }
}
async function enrichPending(){
  for(const c of CATCHES.filter(c => c.condPending)) await enrich(c.id);
}
window.addEventListener('online', enrichPending);

function refresh(){
  if(currentView === 'home') renderHome();
  else if(currentView === 'stats') renderStats();
  else if(currentView === 'detail' && detailId) renderDetail(detailId);
}

/* =========================================================
   Karten (Leaflet + OpenStreetMap / Satellit)
   ========================================================= */
const hasLeaflet = () => typeof L !== 'undefined';
const TILES = {
  map: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'© OpenStreetMap'}],
  sat: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'Esri, Maxar, Earthstar Geographics'}]
};
function makeMap(el, opts={}){
  const m = L.map(el, Object.assign({zoomControl:false}, opts));
  m._rigLayers = { map: L.tileLayer(...TILES.map), sat: L.tileLayer(...TILES.sat) };
  const pref = lsGet('rig-layer', 'map') === 'sat' ? 'sat' : 'map';
  m._rigLayers[pref].addTo(m); m._rigLayer = pref;
  return m;
}
function setLayer(m, which, toggleEl){
  if(!m || m._rigLayer === which) return;
  m.removeLayer(m._rigLayers[m._rigLayer]); m._rigLayers[which].addTo(m); m._rigLayer = which;
  lsSet('rig-layer', which);
  if(toggleEl) $$('button', toggleEl).forEach(b => b.classList.toggle('active', b.dataset.layer === which));
}
function syncToggle(toggleEl, m){ $$('button', toggleEl).forEach(b => b.classList.toggle('active', b.dataset.layer === m._rigLayer)); }
function pinIcon(){
  return L.divIcon({ className:'', iconSize:[28,34], iconAnchor:[14,34], popupAnchor:[0,-30],
    html:`<svg width="28" height="34" viewBox="0 0 28 34"><path d="M14 0C6.3 0 0 6.3 0 14c0 10 14 20 14 20s14-10 14-20C28 6.3 21.7 0 14 0z" fill="#c99a3d"/><circle cx="14" cy="13" r="5" fill="#0e2124"/></svg>` });
}
function lastPosition(){ const c = CATCHES.find(x => x.position); return c ? c.position : null; }

function getGps(){
  return new Promise((res, rej) => {
    if(!navigator.geolocation) return rej(new Error('Dein Gerät bietet keine Standortbestimmung an.'));
    navigator.geolocation.getCurrentPosition(
      p => res({lat:p.coords.latitude, lng:p.coords.longitude, acc:p.coords.accuracy}),
      e => rej(new Error(e.code === 1
        ? 'Standortzugriff ist gesperrt. Erlaube ihn für Rig in den Einstellungen.'
        : 'Kein GPS-Signal. Versuche es erneut oder wähle den Ort auf der Karte.')),
      {enableHighAccuracy:true, timeout:15000, maximumAge:30000});
  });
}

/* Auswahl im Formular */
let pickerMap;
function openPicker(){
  if(!hasLeaflet()){ toast('Die Karte braucht beim ersten Öffnen Internet. Nutze „Mein Standort“.', 3500); return; }
  showOverlay($('#pickerOverlay'));
  setTimeout(() => {
    const start = form.pos || lastPosition();
    if(!pickerMap){
      pickerMap = makeMap('pickerMap', {attributionControl:true});
      pickerMap.on('click', e => pickerMap.panTo(e.latlng));
    }
    syncToggle($('.layer-toggle[data-map="picker"]'), pickerMap);
    pickerMap.invalidateSize();
    if(start) pickerMap.setView([start.lat, start.lng], form.pos ? 16 : 13);
    else pickerMap.setView([51.1657, 10.4515], 6);
  }, 60);
}

/* Alle Fänge */
let allMap, allMarkers, mapDirty = true, youMarker;
function renderAllMap(){
  const withPos = CATCHES.filter(c => c.position);
  const note = $('#mapNote');
  if(!hasLeaflet()){ note.hidden = false; note.textContent = 'Die Karte lädt, sobald du online bist.'; return; }
  note.hidden = withPos.length > 0;
  note.textContent = 'Noch keine Fänge mit Position. Setze beim nächsten Fang „Mein Standort“, dann erscheint er hier.';
  setTimeout(() => {
    if(!allMap){
      allMap = makeMap('allMap');
      allMap.setView([51.1657, 10.4515], 6);
    }
    syncToggle($('.layer-toggle[data-map="all"]'), allMap);
    allMap.invalidateSize();
    if(!mapDirty) return;
    mapDirty = false;
    if(allMarkers) allMap.removeLayer(allMarkers);
    allMarkers = L.layerGroup();
    withPos.forEach(c => {
      const el = document.createElement('div');
      el.innerHTML = `<div class="popup-species">${esc(c.speciesName)}${c.groesse ? ' – '+fmtNum(c.groesse)+' cm' : ''}</div>
        <div class="popup-meta">${fmtDate(c.datum)}${c.koeder ? ' · '+esc(c.koeder) : ''}</div>
        <button class="popup-link" type="button">Details ansehen →</button>`;
      $('button', el).onclick = () => navigate('catch-'+c.id);
      L.marker([c.position.lat, c.position.lng], {icon:pinIcon()}).bindPopup(el).addTo(allMarkers);
    });
    allMarkers.addTo(allMap);
    if(withPos.length){
      allMap.fitBounds(L.latLngBounds(withPos.map(c => [c.position.lat, c.position.lng])).pad(0.3), {maxZoom:14});
    }
  }, 40);
}

/* =========================================================
   Detailansicht
   ========================================================= */
let detailMap;
function renderDetail(id){
  detailId = id;
  const c = CATCHES.find(x => x.id === id); if(!c) return;
  const moon = moonPhase(c.datum, c.zeit);
  const w = WEATHER.find(x => x.id === c.weather);
  const size = [c.groesse ? fmtNum(c.groesse)+' cm' : null, c.gewicht ? fmtNum(c.gewicht, 2)+' kg' : null].filter(Boolean).join('  ·  ');
  const kv = (k, v, mono) => `<div class="kv"><div class="k">${k}</div><div class="v${mono ? ' mono' : ''}">${v}</div></div>`;

  let cond = '';
  const C = c.conditions;
  if(C){
    const tIcon = C.trend === 'fallend' ? IC.down : C.trend === 'steigend' ? IC.up : IC.flat;
    const tCls = C.trend === 'fallend' ? 'trend-down' : C.trend === 'steigend' ? 'trend-up' : '';
    cond = `<div class="kv-grid">
      ${kv('Luftdruck', `${C.pressure} hPa${C.trend ? ` <span class="${tCls}" title="${C.trend}">${tIcon}</span>` : ''}`, true)}
      ${kv('Tendenz (3 h)', C.trend ? `${C.trend[0].toUpperCase()+C.trend.slice(1)} ${C.pressureDiff > 0 ? '+' : ''}${fmtNum(C.pressureDiff)}` : '–')}
      ${kv('Luft', C.temp != null ? `${fmtNum(C.temp)} °C` : '–', true)}
      ${kv('Wind', C.wind != null ? `${Math.round(C.wind)} km/h ${C.windDir != null ? windDir(C.windDir) : ''}` : '–', true)}
      ${kv('Mond', `${moonSvg(moon.frac)} ${moon.name}`)}
      ${kv('Mondlicht', `${Math.round(moon.illum*100)} %`, true)}
    </div>`;
  } else {
    cond = `<div class="kv-grid">${kv('Mond', `${moonSvg(moon.frac)} ${moon.name}`)}${kv('Mondlicht', `${Math.round(moon.illum*100)} %`, true)}</div>`;
    if(c.condPending) cond += `<p class="pending-note" style="margin-top:9px">Luftdruck, Temperatur und Wind werden ergänzt, sobald du online bist.</p>`;
    else if(!c.position) cond += `<p class="pending-note" style="margin-top:9px">Mit einer Position beim Fang ergänzt Rig hier automatisch Luftdruck, Temperatur und Wind.</p>`;
  }

  $('#detailBody').innerHTML = `
    ${c.foto ? `<img class="detail-photo" src="${c.foto}" alt="Foto: ${esc(c.speciesName)}">` : ''}
    <div class="detail-title">${esc(c.speciesName)}</div>
    ${size ? `<div class="detail-size">${size}</div>` : ''}
    <div class="kv-grid">
      ${kv('Datum', fmtDate(c.datum), true)}
      ${kv('Uhrzeit', esc(c.zeit), true)}
      ${kv('Ort', esc(c.ort))}
      ${kv('Köder', esc(c.koeder || '–'))}
      ${kv('Wetter', w ? `${IC[w.id]} ${w.name}${c.weatherAuto ? ' <span style="color:var(--text-low);font-size:11px">auto</span>' : ''}` : '–')}
      ${kv('Verbleib', c.verbleib === 'kept' ? 'Entnommen' : c.verbleib === 'released' ? 'Zurückgesetzt' : '–')}
    </div>
    <div class="section-head"><h2>Bedingungen</h2></div>
    ${cond}
    ${c.notizen ? `<div class="section-head"><h2>Notizen</h2></div><div class="notes">${esc(c.notizen)}</div>` : ''}
    ${c.position ? `<div class="section-head"><h2>Fangort</h2></div><div id="detailMap"></div><div class="coord-line">${c.position.lat.toFixed(5)}, ${c.position.lng.toFixed(5)}</div>` : ''}
    <div style="height:28px"></div>`;

  if(detailMap){ detailMap.remove(); detailMap = null; }
  if(c.position && hasLeaflet()){
    setTimeout(() => {
      if(!$('#detailMap')) return;
      detailMap = makeMap('detailMap', {dragging:true, scrollWheelZoom:false, tap:false});
      detailMap.setView([c.position.lat, c.position.lng], 15);
      L.marker([c.position.lat, c.position.lng], {icon:pinIcon()}).addTo(detailMap);
    }, 40);
  }
  if(c.condPending) enrich(c.id);
}

/* =========================================================
   Auswertung
   ========================================================= */
function vbars(values, labels){
  const max = Math.max(...values, 1);
  const peak = Math.max(...values);
  return `<div class="vbars">${values.map(v =>
    `<div class="vbar">${v ? `<div class="val">${v}</div>` : ''}<div class="bar${v === 0 ? ' zero' : v === peak ? ' peak' : ''}" style="height:${v ? Math.max(4, v/max*100) : 2}%"></div></div>`).join('')}</div>
    <div class="vbar-labels">${labels.map(l => `<span>${l}</span>`).join('')}</div>`;
}
function hbars(rows){
  const max = Math.max(...rows.map(r => r.n), 1);
  return `<div class="hbars">${rows.map((r, i) =>
    `<div class="hbar-row${i === 0 ? ' lead' : ''}"><div class="top"><span class="name">${esc(r.name)}</span><span class="num">${r.n}×${r.extra ? ' · '+r.extra : ''}</span></div>
     <div class="hbar-track"><div class="hbar-fill" style="width:${r.n/max*100}%"></div></div></div>`).join('')}</div>`;
}
function groupBy(list, keyFn){
  const m = new Map();
  list.forEach(c => { const k = keyFn(c); if(!k) return; const lk = k.toLowerCase(); if(!m.has(lk)) m.set(lk, {name:k, items:[]}); m.get(lk).items.push(c); });
  return [...m.values()].sort((a,b) => b.items.length - a.items.length);
}
const avgSize = items => { const s = items.filter(c => c.groesse); return s.length ? s.reduce((a,c) => a + c.groesse, 0) / s.length : null; };

function renderStats(){
  const sel = $('#statsFilter');
  const prev = sel.value || 'all';
  const species = groupBy(CATCHES, c => c.speciesName);
  sel.innerHTML = `<option value="all">Alle Fischarten (${CATCHES.length})</option>` +
    species.map(s => `<option value="${esc(s.name)}">${esc(s.name)} (${s.items.length})</option>`).join('');
  sel.value = [...sel.options].some(o => o.value === prev) ? prev : 'all';
  const filter = sel.value;
  const list = filter === 'all' ? CATCHES : CATCHES.filter(c => c.speciesName === filter);

  const lb = lastBackup ? new Date(lastBackup).toLocaleDateString('de-DE') : null;
  $('#backupInfo').textContent = (lb ? `Letztes Backup: ${lb}. ` : 'Noch kein Backup. ') +
    'Das Backup enthält alle Fänge samt Fotos. Speichere es z. B. in iCloud Drive oder Google Drive. Die CSV-Datei öffnet sich in Excel.';

  const body = $('#statsBody');
  if(!list.length){
    body.innerHTML = `<div class="empty">${IC.fish}<p>Sobald du Fänge einträgst, siehst du hier, <b>wann, wo und womit</b> es bei dir beißt.</p></div>`;
    return;
  }

  const sized = list.filter(c => c.groesse);
  const biggest = sized.reduce((b, c) => !b || c.groesse > b.groesse ? c : b, null);
  const avg = avgSize(list);
  const waters = groupBy(list, c => c.ort);

  const byMonth = Array(12).fill(0); list.forEach(c => byMonth[+c.datum.slice(5,7) - 1]++);
  const byHour = Array(8).fill(0); list.forEach(c => byHour[Math.floor(+c.zeit.slice(0,2) / 3)]++);
  const baits = groupBy(list, c => c.koeder).slice(0, 6).map(g => {
    const a = avgSize(g.items); return {name:g.name, n:g.items.length, extra: a ? 'Ø '+fmtNum(a, 0)+' cm' : ''};
  });

  const withCond = list.filter(c => c.conditions && c.conditions.trend);
  const trends = ['fallend','stabil','steigend'].map(t => withCond.filter(c => c.conditions.trend === t).length);
  const tMax = Math.max(...trends);
  const moonQ = [0,0,0,0]; list.forEach(c => moonQ[moonQuarter(moonPhase(c.datum, c.zeit).frac)]++);
  const mMax = Math.max(...moonQ);
  const moonFr = [0, 0.25, 0.5, 0.75];

  let html = `
    <div class="stats-grid" style="margin-top:12px">
      <div class="stat"><div class="stat-num">${list.length}</div><div class="stat-label">Fänge</div></div>
      <div class="stat"><div class="stat-num">${biggest ? fmtNum(biggest.groesse)+' cm' : '–'}</div><div class="stat-label">Größter</div></div>
      <div class="stat"><div class="stat-num">${avg ? fmtNum(avg, 0)+' cm' : '–'}</div><div class="stat-label">Ø Größe</div></div>
      <div class="stat"><div class="stat-num">${waters.length}</div><div class="stat-label">Gewässer</div></div>
    </div>

    <div class="section-head"><h2>Wann es beißt</h2></div>
    <div class="panel"><p class="panel-title">Fänge nach Monat <span>alle Jahre</span></p>${vbars(byMonth, ['J','F','M','A','M','J','J','A','S','O','N','D'])}</div>
    <div class="panel"><p class="panel-title">Fänge nach Uhrzeit <span>3-Stunden-Fenster</span></p>${vbars(byHour, ['0','3','6','9','12','15','18','21'])}</div>`;

  html += `<div class="section-head"><h2>Womit es beißt</h2></div>`;
  html += baits.length ? `<div class="panel"><p class="panel-title">Erfolgreichste Köder <span>Fänge · Ø Größe</span></p>${hbars(baits)}</div>`
                       : `<div class="panel"><p class="panel-note" style="margin:0">Trage beim Fang den Köder ein, dann siehst du hier, welcher am besten läuft.</p></div>`;

  if(filter === 'all' && species.length > 1){
    html += `<div class="panel"><p class="panel-title">Fischarten</p>${hbars(species.slice(0,8).map(s => ({name:s.name, n:s.items.length})))}</div>`;
  }
  if(waters.length > 1){
    html += `<div class="panel"><p class="panel-title">Gewässer <span>Fänge</span></p>${hbars(waters.slice(0,5).map(g => ({name:g.name, n:g.items.length})))}</div>`;
  }

  html += `<div class="section-head"><h2>Bei welchen Bedingungen</h2></div>
    <div class="panel"><p class="panel-title">Luftdruck-Tendenz <span>${withCond.length} mit Wetterdaten</span></p>
      ${withCond.length ? `<div class="cond-grid">${['Fallend','Stabil','Steigend'].map((l, i) =>
        `<div class="cond${trends[i] === tMax && tMax > 0 ? ' lead' : ''}">${[IC.down, IC.flat, IC.up][i]}<div class="n">${trends[i]}</div><div class="l">${l}</div></div>`).join('')}</div>`
        : `<p class="panel-note" style="margin:0">Fänge mit Position bekommen automatisch Luftdruckdaten.</p>`}
    </div>
    <div class="panel"><p class="panel-title">Mondphase</p>
      <div class="cond-grid four">${['Neumond','Zunehmend','Vollmond','Abnehmend'].map((l, i) =>
        `<div class="cond${moonQ[i] === mMax && mMax > 0 ? ' lead' : ''}">${moonSvg(moonFr[i] === 0 ? 0.001 : moonFr[i])}<div class="n">${moonQ[i]}</div><div class="l">${l}</div></div>`).join('')}</div>
      <p class="panel-note">Jede Gruppe deckt rund eine Woche des Mondzyklus ab, die Werte sind also direkt vergleichbar.</p>
    </div>`;

  if(filter === 'all'){
    const recs = species.map(s => s.items.filter(c => c.groesse).sort((a,b) => b.groesse - a.groesse)[0]).filter(Boolean)
      .sort((a,b) => b.groesse - a.groesse);
    if(recs.length) html += `<div class="section-head"><h2>Persönliche Rekorde</h2></div><div class="panel record-list">${recs.map(recordRow).join('')}</div>`;
  } else if(sized.length){
    const top = [...sized].sort((a,b) => b.groesse - a.groesse).slice(0,3);
    html += `<div class="section-head"><h2>Größte ${esc(filter === 'Sonstige' ? 'Fänge' : filter)}</h2></div><div class="panel record-list">${top.map(recordRow).join('')}</div>`;
  }
  if(list.length < 10) html += `<p class="panel-note">Mit mehr Einträgen werden die Muster belastbarer.</p>`;
  body.innerHTML = html;
}
function recordRow(c){
  return `<button class="record" type="button" data-id="${esc(c.id)}"><div><div class="name">${esc(c.speciesName)}</div><div class="meta">${fmtDate(c.datum)} · ${esc(c.ort)}</div></div><div class="size">${fmtNum(c.groesse)} cm${c.gewicht ? ' · '+fmtNum(c.gewicht,2)+' kg' : ''}</div></button>`;
}

/* =========================================================
   Backup & Export
   ========================================================= */
async function deliverFile(blob, filename){
  try{
    const file = new File([blob], filename, {type: blob.type});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file], title:filename});
      return true;
    }
  } catch(e){ if(e.name === 'AbortError') return false; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return true;
}
async function exportBackup(){
  if(!CATCHES.length){ toast('Noch keine Fänge zum Sichern.'); return; }
  const data = { app:'rig', version:1, exportedAt:new Date().toISOString(), catches:CATCHES };
  const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
  const ok = await deliverFile(blob, `rig-backup-${todayStr()}.json`);
  if(ok){ lastBackup = Date.now(); await metaSet('lastBackup', lastBackup).catch(()=>{}); toast('Backup erstellt'); renderStats(); }
}
async function exportCsv(){
  if(!CATCHES.length){ toast('Noch keine Fänge zum Exportieren.'); return; }
  const num = v => v == null ? '' : String(v).replace('.', ',');
  const cell = v => { const s = String(v ?? ''); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const head = ['Datum','Uhrzeit','Fischart','Größe (cm)','Gewicht (kg)','Ort','Breitengrad','Längengrad','Köder','Wetter','Verbleib','Luftdruck (hPa)','Tendenz','Temperatur (°C)','Wind (km/h)','Mondphase','Notizen'];
  const rows = CATCHES.map(c => {
    const C = c.conditions || {};
    return [fmtDate(c.datum), c.zeit, c.speciesName, num(c.groesse), num(c.gewicht), c.ort,
      c.position ? num(c.position.lat) : '', c.position ? num(c.position.lng) : '',
      c.koeder || '', (WEATHER.find(w => w.id === c.weather) || {}).name || '',
      c.verbleib === 'kept' ? 'Entnommen' : c.verbleib === 'released' ? 'Zurückgesetzt' : '',
      num(C.pressure), C.trend || '', num(C.temp), C.wind != null ? num(Math.round(C.wind)) : '',
      moonPhase(c.datum, c.zeit).name, c.notizen || ''].map(cell).join(';');
  });
  const blob = new Blob(['﻿' + [head.join(';'), ...rows].join('\r\n')], {type:'text/csv;charset=utf-8'});
  await deliverFile(blob, `rig-faenge-${todayStr()}.csv`);
}
async function importBackup(file){
  try{
    const data = JSON.parse(await file.text());
    const list = Array.isArray(data) ? data : data.catches;
    if(!Array.isArray(list)) throw new Error();
    const valid = list.filter(c => c && c.id && c.speciesName && /^\d{4}-\d{2}-\d{2}$/.test(c.datum || '') && c.zeit && c.ort);
    if(!valid.length) throw new Error();
    let added = 0, updated = 0;
    for(const c of valid){
      const i = CATCHES.findIndex(x => x.id === c.id);
      await dbPut(c);
      if(i >= 0){ CATCHES[i] = c; updated++; } else { CATCHES.push(c); added++; }
    }
    sortCatches(); mapDirty = true; refresh();
    toast(`${added} Fänge importiert${updated ? `, ${updated} aktualisiert` : ''}`, 3200);
  } catch(e){ toast('Diese Datei ist kein Rig-Backup.', 3200); }
}

/* =========================================================
   Ereignisse
   ========================================================= */
function bind(){
  $$('.nav-item').forEach(b => b.onclick = () => goTab(b.dataset.nav));
  $('#fab').onclick = () => navigate('new');
  $$('[data-action="back"]').forEach(b => b.onclick = goBack);
  $('#search').addEventListener('input', renderList);

  document.addEventListener('click', e => {
    const card = e.target.closest('.catch-card, .record');
    if(card && card.dataset.id) navigate('catch-' + card.dataset.id);
    const sp = e.target.closest('#speciesGrid .chip'); if(sp) selectSpecies(sp.dataset.species);
    const wt = e.target.closest('#weatherGrid .chip'); if(wt) selectWeather(wt.dataset.weather);
    const vb = e.target.closest('#verbleibSeg button'); if(vb) selectVerbleib(vb.dataset.v);
    const lt = e.target.closest('.layer-toggle button');
    if(lt){ const which = lt.closest('.layer-toggle').dataset.map; setLayer(which === 'all' ? allMap : pickerMap, lt.dataset.layer, lt.closest('.layer-toggle')); }
  });

  $('#photoInput').addEventListener('change', e => { const f = e.target.files[0]; if(f) processPhoto(f); e.target.value = ''; });
  $('#btnSave').onclick = saveForm;

  $('#btnGps').onclick = async () => {
    const btn = $('#btnGps'), label = $('span', btn);
    btn.disabled = true; label.textContent = 'Suche …';
    try{ const p = await getGps(); setPos(p); toast(p.acc ? `Standort gesetzt (± ${Math.round(p.acc)} m)` : 'Standort gesetzt'); }
    catch(e){ toast(e.message, 4000); }
    finally{ btn.disabled = false; label.textContent = 'Mein Standort'; }
  };
  $('#btnPicker').onclick = openPicker;
  $('#btnClearLoc').onclick = () => setPos(null);

  $('#pickerOk').onclick = () => { const c = pickerMap.getCenter(); closeOverlay(() => setPos({lat:c.lat, lng:c.lng})); };
  $('#pickerCancel').onclick = () => closeOverlay();
  $('#pickerOverlay').addEventListener('click', e => { if(e.target.id === 'pickerOverlay') closeOverlay(); });
  $('#pickerGps').onclick = async () => {
    try{ const p = await getGps(); pickerMap.setView([p.lat, p.lng], 17); }
    catch(e){ toast(e.message, 4000); }
  };

  $('#mapLocate').onclick = async () => {
    if(!allMap) return;
    try{
      const p = await getGps();
      if(youMarker) allMap.removeLayer(youMarker);
      youMarker = L.circleMarker([p.lat, p.lng], {radius:8, color:'#f3f6f1', weight:2, fillColor:'#4fa98f', fillOpacity:1}).addTo(allMap);
      allMap.setView([p.lat, p.lng], 15);
    } catch(e){ toast(e.message, 4000); }
  };

  $('#btnEdit').onclick = () => navigate('edit-' + detailId);
  $('#btnDelete').onclick = () => {
    const c = CATCHES.find(x => x.id === detailId); if(!c) return;
    $('#confirmText').textContent = `${c.speciesName} vom ${fmtDate(c.datum)} wird endgültig entfernt.`;
    showOverlay($('#confirmOverlay'));
  };
  $('#confirmNo').onclick = () => closeOverlay();
  $('#confirmOverlay').addEventListener('click', e => { if(e.target.id === 'confirmOverlay') closeOverlay(); });
  $('#confirmYes').onclick = () => {
    const id = detailId;
    closeOverlay(async () => {
      try{ await dbDel(id); } catch(e){ toast('Löschen fehlgeschlagen.'); return; }
      CATCHES = CATCHES.filter(c => c.id !== id); mapDirty = true;
      toast('Fang gelöscht'); goBack();
    });
  };

  $('#statsFilter').addEventListener('change', renderStats);
  $('#btnBackup').onclick = exportBackup;
  $('#btnCsv').onclick = exportCsv;
  $('#btnImport').onclick = () => $('#importInput').click();
  $('#importInput').addEventListener('change', e => { const f = e.target.files[0]; if(f) importBackup(f); e.target.value = ''; });
}

/* =========================================================
   Start
   ========================================================= */
async function init(){
  bind();
  try{
    CATCHES = await dbAll();
    lastBackup = await metaGet('lastBackup') || null;
  } catch(e){
    toast('Der Speicher ist nicht verfügbar. Im privaten Modus kann Rig nichts speichern.', 5000);
  }
  sortCatches();
  history.replaceState(history.state, '', location.hash || '#home');
  route();
  enrichPending();
  if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')){
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
init();
