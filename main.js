
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // Theme
  const themeBtn = $('#toggle-theme');
  function applyTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', saved==='dark');
    if(themeBtn) themeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  }
  themeBtn && themeBtn.addEventListener('click', ()=>{
    const nowDark = !document.body.classList.contains('dark');
    localStorage.setItem('theme', nowDark?'dark':'light'); applyTheme();
  });
  applyTheme();

  // Background audio
  const bgAudio = $('#bg-audio');
  const bgToggle = $('#bg-audio-toggle');
  if(bgToggle && bgAudio){
    bgToggle.addEventListener('click', async () => {
      try{ if(bgAudio.paused){ await bgAudio.play(); bgToggle.textContent='⏸️'; } else { bgAudio.pause(); bgToggle.textContent='▶️'; } }catch{ alert('أضف ملفًا إلى assets/audio/bg.mp3'); }
    });
  }

  // Global search
  const search = $('#global-search');
  if(search){
    search.addEventListener('keydown', (e)=>{
      if(e.key==='Enter'){
        const q = search.value.trim();
        if(/سورة|آية|ayah|surah/i.test(q)) location.href='quran.html?q='+encodeURIComponent(q);
        else if(/ذكر|أذكار|zekr|azkar/i.test(q)) location.href='azkar.html?q='+encodeURIComponent(q);
        else if(/صلاة|fajr|dhuhr|asr|maghrib|isha|city|مدينة/i.test(q)) location.href='prayers.html?q='+encodeURIComponent(q);
        else location.href='index.html?q='+encodeURIComponent(q);
      }
    });
  }

  // Home clock & dates
  const gregEl = $('#greg-date'); const hijriEl = $('#hijri-date'); const timeEl = $('#current-time');
  function tick(){ timeEl && (timeEl.textContent=new Date().toLocaleTimeString('ar-EG')); gregEl && (gregEl.textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})); }
  tick(); setInterval(tick, 1000);
  (async function(){ try{ const ts=Math.floor(Date.now()/1000); const r=await fetch('https://api.aladhan.com/v1/gToH?timestamp='+ts); const j=await r.json(); if(hijriEl && j?.data?.hijri){ const h=j.data.hijri; hijriEl.textContent=`${h.weekday.ar} ${h.day} ${h.month.ar} ${h.year}`; } }catch{} })();

  // Prayers
  const grid = $('#prayer-grid'), countdownEl = $('#countdown');
  const locateBtn = $('#locate-btn'), cityInput=$('#city-input'), countryInput=$('#country-input'), fetchByCity=$('#fetch-by-city');
  async function renderTimings(data){
    if(!grid) return;
    grid.innerHTML='';
    const names=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    names.forEach(n=>{
      const div=document.createElement('div'); div.className='prayer-card'; div.innerHTML=`<div style="font-weight:700">${n}</div><div style="font-size:24px;margin-top:6px">${data.timings[n]}</div>`; grid.appendChild(div);
    });
    function parseHHMM(s){ const [h,m]=s.split(':').map(Number); const now=new Date(); const d=new Date(now); d.setHours(h,m,0,0); if(d<now) d.setDate(d.getDate()+1); return d; }
    const nextTimes = names.map(n=>({name:n,time:parseHHMM(data.timings[n])})).sort((a,b)=>a.time-b.time);
    function updateCountdown(){ const now=new Date(); const t=nextTimes.find(x=>x.time>now)||nextTimes[0]; const diff=t.time-now; const hh=String(Math.floor(diff/3600000)).padStart(2,'0'); const mm=String(Math.floor((diff%3600000)/60000)).padStart(2,'0'); const ss=String(Math.floor((diff%60000)/1000)).padStart(2,'0'); countdownEl && (countdownEl.textContent = `${t.name}: ${hh}:${mm}:${ss}`); }
    updateCountdown(); setInterval(updateCountdown,1000);
  }
  async function timingsByCoords(lat,lon){ const r=await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`); const j=await r.json(); j?.data && renderTimings(j.data); }
  async function timingsByCity(city,country){ const r=await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country||'')}&method=5`); const j=await r.json(); j?.data && renderTimings(j.data); }
  locateBtn && locateBtn.addEventListener('click', ()=>{
    navigator.geolocation.getCurrentPosition(p=>timingsByCoords(p.coords.latitude,p.coords.longitude), e=>alert('تعذر تحديد الموقع.'), {enableHighAccuracy:true,timeout:8000});
  });
  fetchByCity && fetchByCity.addEventListener('click', ()=>{ const c=cityInput.value.trim()||'Cairo'; const k=countryInput.value.trim()||'Egypt'; timingsByCity(c,k); });

  // Quran: full fetch + translation + tafsir
  (async function enhanceQuran(){
    const surahSelect = $('#surah-select'), content=$('#quran-content'), tafsiBox=$('#tafsi-box'), tSel=$('#translation-select');
    const fontPlus=$('#font-plus'), fontMinus=$('#font-minus'), ayahSearch=$('#ayah-search');
    if(!surahSelect || !content) return;
    let mushafFontSize=22; fontPlus && (fontPlus.onclick=()=>{ mushafFontSize=Math.min(40,mushafFontSize+2); content.style.fontSize=mushafFontSize+'px'; });
    fontMinus && (fontMinus.onclick=()=>{ mushafFontSize=Math.max(16,mushafFontSize-2); content.style.fontSize=mushafFontSize+'px'; });
    ayahSearch && (ayahSearch.oninput=()=>{ $$('.ayah').forEach(el=>el.classList.toggle('active', el.textContent.includes(ayahSearch.value.trim()))); });

    let meta=[];
    try{ const r=await fetch('https://api.alquran.cloud/v1/surah'); const j=await r.json(); meta=j.data||[]; meta.forEach(s=>{ const opt=document.createElement('option'); opt.value=s.number; opt.textContent=`${s.number} - ${s.englishName} / ${s.name}`; surahSelect.appendChild(opt); }); }catch{}
    async function render(number){
      content.innerHTML='<div class="muted">جاري التحميل...</div>'; const trans=tSel?.value||'';
      try{
        const arRes=await fetch(`https://api.alquran.cloud/v1/surah/${number}`); const ar=await arRes.json();
        let trAyat=[]; if(trans){ const trRes=await fetch(`https://api.alquran.cloud/v1/surah/${number}/${trans}`); const tr=await trRes.json(); trAyat=(tr.data?.ayahs||[]).map(a=>a.text); }
        content.innerHTML='';
        (ar.data?.ayahs||[]).forEach((a,idx)=>{
          const span=document.createElement('span'); span.className='ayah'; span.dataset.idx=idx+1;
          const trPart=trAyat[idx]?`<div class="muted" style="font-size:16px;margin-top:6px">${trAyat[idx]}</div>`:'';
          span.innerHTML=`${a.text} <small>۝${idx+1}</small>${trPart}`;
          span.addEventListener('click', ()=> showTafsir(number, idx+1));
          content.appendChild(span);
        });
      }catch{ content.innerHTML='<div class="muted">تعذر التحميل.</div>'; }
    }
    async function showTafsir(surah,ayah){
      try{ const r=await fetch(`https://quranapi.pages.dev/api/tafsir/${surah}_${ayah}.json`); const j=await r.json(); tafsiBox.classList.remove('hidden'); tafsiBox.innerHTML=`<h3>📘 تفسير مختصر</h3><details open><summary>ابن كثير</summary><div>${(j?.tafsir?.['Ibn Kathir']||'—')}</div></details>`; tafsiBox.scrollIntoView({behavior:'smooth'}); }catch{}
    }
    surahSelect.value='1'; render(1); surahSelect.onchange=()=>render(surahSelect.value); tSel && (tSel.onchange=()=>render(surahSelect.value));
  })();

  // Recitations page basic cards
  (function reciters(){
    const wrap = $('#reciters'); if(!wrap) return;
    (window.APP_DATA.reciters||[]).forEach(r=>{
      const card=document.createElement('div'); card.className='reciter-card';
      card.innerHTML=`<div style="font-weight:700">${r.name}</div><div class="muted">${r.note||''}</div>
      <a class="card" target="_blank" href="${r.note?.includes('quran.com')?'https://quran.com/en/reciters/2':(r.note?.includes('maher')?'https://qurancentral.com/audio/maher-al-mueaqly/':'https://qurancentral.com/audio/fares-abbad/')}">فتح قائمة التلاوات</a>
      <button data-fav="${r.name}">⭐ إضافة للمفضلة</button>`;
      card.querySelector('button').onclick=()=>{ addFavorite('recitation', r.name); alert('تمت إضافة التلاوة للمفضلة'); };
      wrap.appendChild(card);
    });
  })();

  // Azkar
  const tabs = $$('.tab'), azkarList=$('#azkar-list');
  function renderAzkar(cat){
    if(!azkarList) return;
    const data=(window.APP_DATA.azkar[cat]||[]);
    azkarList.innerHTML='';
    data.forEach(z=>{
      const div=document.createElement('div'); div.className='zekr';
      div.innerHTML=`<div>${z.text}</div>
      <div class="zekr-tools">
        <button class="copy">نسخ</button><button class="share">مشاركة</button>
        <div class="counter"><button class="dec">-</button><input type="number" value="${z.repeat||1}" min="1"/><button class="inc">+</button></div>
        <button class="fav">⭐</button>
      </div>`;
      azkarList.appendChild(div);
      const input=div.querySelector('input');
      div.querySelector('.inc').onclick=()=> input.value=Number(input.value)+1;
      div.querySelector('.dec').onclick=()=> input.value=Math.max(1, Number(input.value)-1);
      div.querySelector('.copy').onclick=()=> navigator.clipboard.writeText(z.text);
      div.querySelector('.share').onclick=async()=>{ if(navigator.share){ try{ await navigator.share({text:z.text}); }catch{} } else alert('المشاركة غير مدعومة'); };
      div.querySelector('.fav').onclick=()=>{ addFavorite('zekr', z.text); alert('أضيف للْمفضلة'); };
    });
  }
  if(tabs.length){ tabs.forEach(b=> b.onclick=()=>{ tabs.forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderAzkar(b.dataset.tab); }); renderAzkar('morning'); }

  // Favorites
  const favAzkar=$('#fav-azkar'), favRec=$('#fav-recitations'), favAyat=$('#fav-ayat'), playAll=$('#play-all'), clearFavs=$('#clear-favs');
  function getFav(){ try{ return JSON.parse(localStorage.getItem('favorites')||'{"zekr":[],"recitation":[],"ayat":[]}'); }catch{ return {zekr:[],recitation:[],ayat:[]}; } }
  function setFav(f){ localStorage.setItem('favorites', JSON.stringify(f)); }
  function addFavorite(type,value){ const f=getFav(); if(!f[type].includes(value)) f[type].push(value); setFav(f); renderFavs(); }
  window.addFavorite=addFavorite;
  function renderFavs(){
    if(favAzkar){ const f=getFav().zekr; favAzkar.innerHTML=''; f.forEach(v=> favAzkar.insertAdjacentHTML('beforeend', `<div class="fav-card">🌿 ${v}</div>`)); }
    if(favRec){ const f=getFav().recitation; favRec.innerHTML=''; f.forEach(v=> favRec.insertAdjacentHTML('beforeend', `<div class="fav-card">🎧 ${v}</div>`)); }
    if(favAyat){ const f=getFav().ayat; favAyat.innerHTML=''; f.forEach(v=> favAyat.insertAdjacentHTML('beforeend', `<div class="fav-card">📖 ${v}</div>`)); }
  }
  renderFavs(); playAll && (playAll.onclick=()=> alert('سوف يتم تشغيل قائمة المفضلة عند إضافة روابط التلاوات')); clearFavs && (clearFavs.onclick=()=>{ localStorage.removeItem('favorites'); renderFavs(); });

  // Tasbeeh page
  (function tsb(){
    const select=$('#dhikr-select'), countEl=$('#count'), goalEl=$('#daily-goal');
    const inc=$('#inc'), reset=$('#reset'); const vibr=$('#vibrate');
    if(!select || !countEl) return;
    function key(d){ return 'tsb_'+d; }
    function load(){ const d=select.value; const obj=JSON.parse(localStorage.getItem(key(d))||'{"count":0,"goal":100,"date":""}'); const today=new Date().toISOString().slice(0,10); if(obj.date!==today) obj.count=0, obj.date=today; countEl.textContent=obj.count; goalEl.value=obj.goal||100; localStorage.setItem(key(d), JSON.stringify(obj)); }
    function save(){ const d=select.value; const obj=JSON.parse(localStorage.getItem(key(d))||'{"count":0,"goal":100,"date":""}'); obj.count=Number(countEl.textContent); obj.goal=Number(goalEl.value||100); obj.date=new Date().toISOString().slice(0,10); localStorage.setItem(key(d), JSON.stringify(obj)); const goalReached=obj.count>=obj.goal; if(goalReached){ if('Notification' in window && Notification.permission==='granted'){ new Notification('ما شاء الله ✨', { body: 'تم الوصول للهدف اليومي: '+d }); } try{ navigator.vibrate&&navigator.vibrate([100,50,100]); }catch{} alert('ما شاء الله ✨ وصلت للهدف!'); } }
    select.onchange=load; inc.onclick=()=>{ countEl.textContent=Number(countEl.textContent)+1; save(); }; reset.onclick=()=>{ countEl.textContent=0; save(); }; vibr && (vibr.onclick=()=>{ try{ navigator.vibrate&&navigator.vibrate(80);}catch{} });
    goalEl.onchange=save; if('Notification' in window && Notification.permission==='default'){ Notification.requestPermission(); } load();
  })();

  // Mosque screen
  (async function mosque(){
    const grid=$('#mosque-times'); if(!grid) return;
    try{ const r=await fetch('https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5'); const j=await r.json(); const names=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha']; names.forEach(n=>{ const div=document.createElement('div'); div.className='prayer-card'; div.innerHTML=`<div style="font-size:34px;font-weight:900">${n}</div><div style="font-size:34px">${j.data.timings[n]}</div>`; grid.appendChild(div); }); }catch{}
    try{ const r=await fetch('https://api.alquran.cloud/v1/ayah/random'); const j=await r.json(); $('#verse-day') && ($('#verse-day').textContent=j.data.text); const sid=j.data.surah.number, aid=j.data.numberInSurah; const tr=await fetch(`https://quranapi.pages.dev/api/tafsir/${sid}_${aid}.json`); const tj=await tr.json(); $('#tafsir-day') && ($('#tafsir-day').textContent=(tj?.tafsir?.['Ibn Kathir']||'').slice(0,400)+'...'); }catch{} $('#zekr-day') && ($('#zekr-day').textContent='سبحان الله وبحمده، سبحان الله العظيم');
  })();

  // Reminders (simple)
  (function reminders(){
    const key='reminders'; if(!localStorage.getItem(key)){ localStorage.setItem(key, JSON.stringify({morning:'08:00', maghrib:'-' })); }
    if('Notification' in window && Notification.permission==='default'){ Notification.requestPermission(); }
    function scheduleAll(){ const cfg=JSON.parse(localStorage.getItem(key)||'{}'); schedule('🌅 لا تنس أذكار الصباح', cfg.morning); if(cfg.maghrib && cfg.maghrib!=='-') schedule('🌇 اقترب وقت صلاة المغرب', cfg.maghrib); }
    function schedule(title, hhmm){ if(!hhmm || hhmm==='-') return; const [h,m]=hhmm.split(':').map(Number); const now=new Date(); const t=new Date(); t.setHours(h,m,0,0); if(t<now) t.setDate(t.getDate()+1); const ms=t-now; setTimeout(()=>{ if('Notification' in window && Notification.permission==='granted'){ new Notification(title); } else alert(title); schedule(title, hhmm); }, ms); }
    window.setReminder=function(type,time){ const cfg=JSON.parse(localStorage.getItem(key)||'{}'); cfg[type]=time; localStorage.setItem(key, JSON.stringify(cfg)); alert('تم حفظ التذكير'); };
    scheduleAll();
  })();

  // Settings panel
  (function settings(){
    const nav=$('.navbar'); if(!nav) return;
    const btn=document.createElement('button'); btn.textContent='⚙️'; btn.title='الإعدادات'; nav.querySelector('.nav-tools')?.appendChild(btn);
    const panel=document.createElement('div'); panel.className='card settings-panel hidden'; panel.style.position='fixed'; panel.style.bottom='16px'; panel.style.left='16px'; panel.style.maxWidth='340px'; panel.style.zIndex='20'; panel.innerHTML=`
      <h3>الإعدادات</h3>
      <div>الألوان: <select id="pal"><option value="green">أخضر</option><option value="blue">أزرق</option><option value="gold">ذهبي</option></select></div>
      <div>حجم الخط: <input id="fs" type="range" min="90" max="120" value="100"> <span id="fsv">100%</span></div>
      <div>القارئ الافتراضي: <select id="reciter"><option>فارس عباد</option><option>ماهر المعيقلي</option><option>عبد الباسط عبد الصمد</option></select></div>
      <div>تذكير الأذكار (HH:MM): <input id="rem-morning" type="time"></div>
      <div>تذكير المغرب (HH:MM): <input id="rem-maghrib" type="time"></div>
      <div style="margin-top:6px"><button id="save-settings">حفظ</button><button id="close-settings" style="margin-inline-start:8px">إغلاق</button></div>`;
    document.body.appendChild(panel);
    btn.onclick=()=> panel.classList.toggle('hidden');
    panel.querySelector('#close-settings').onclick=()=> panel.classList.add('hidden');
    function load(){ try{ const s=JSON.parse(localStorage.getItem('settings')||'{}'); if(s.palette) document.documentElement.dataset.palette=s.palette, panel.querySelector('#pal').value=s.palette; if(s.fontScale){ document.documentElement.style.fontSize=s.fontScale+'%'; panel.querySelector('#fs').value=s.fontScale; panel.querySelector('#fsv').textContent=s.fontScale+'%'; } if(s.reciter) panel.querySelector('#reciter').value=s.reciter; if(s.remMorning) panel.querySelector('#rem-morning').value=s.remMorning; if(s.remMaghrib) panel.querySelector('#rem-maghrib').value=s.remMaghrib; }catch{} }
    panel.querySelector('#fs').oninput=(e)=> panel.querySelector('#fsv').textContent=e.target.value+'%';
    panel.querySelector('#save-settings').onclick=()=>{ const s={ palette:panel.querySelector('#pal').value, fontScale:panel.querySelector('#fs').value, reciter:panel.querySelector('#reciter').value, remMorning:panel.querySelector('#rem-morning').value, remMaghrib:panel.querySelector('#rem-maghrib').value }; localStorage.setItem('settings', JSON.stringify(s)); document.documentElement.dataset.palette=s.palette; document.documentElement.style.fontSize=s.fontScale+'%'; window.setReminder && window.setReminder('morning', s.remMorning); window.setReminder && window.setReminder('maghrib', s.remMaghrib); alert('تم الحفظ'); };
    load();
  })();

  // Daily ayah & zekr on home
  (async function homeDaily(){
    if(!/index\.html$/.test(location.pathname)) return;
    const box=document.createElement('div'); box.className='card'; box.innerHTML='<h3>📌 آية / ذكر اليوم</h3><div id="daily-ayah">—</div><div class="muted" id="daily-tafsir">—</div><div id="daily-zekr" style="margin-top:8px">—</div>'; document.querySelector('.hero')?.appendChild(box);
    try{ const r=await fetch('https://api.alquran.cloud/v1/ayah/random'); const j=await r.json(); $('#daily-ayah').textContent=j.data.text; const sid=j.data.surah.number, aid=j.data.numberInSurah; const tr=await fetch(`https://quranapi.pages.dev/api/tafsir/${sid}_${aid}.json`); const tj=await tr.json(); $('#daily-tafsir').textContent=(tj?.tafsir?.['Ibn Kathir']||'').slice(0,300)+'...'; }catch{} $('#daily-zekr').textContent='لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير';
  })();

  // Set page backgrounds
  (function pageBackgrounds(){ const body=document.body; if(document.querySelector('.quran')) body.classList.add('bg-quran'); if(document.querySelector('.azkar')) body.classList.add('bg-azkar'); if(/live\.html/.test(location.pathname)) body.classList.add('bg-live'); if(/mosque\.html/.test(location.pathname)) body.classList.add('bg-mosque'); })();
})();