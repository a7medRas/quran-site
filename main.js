/* =========================================================
   MAIN.JS — نسخة ذاتية الإصلاح Self-Healing
   - يضبط التاريخ/الوقت (هجري + ميلادي)
   - المصحف كامل (نص عثماني) + ترجمة + تفسير عند الضغط
   - الأذكار (تبويبات) + أدوات
   - مواقيت الصلاة + عدّاد الأذان
   - البث المباشر + التلاوات (إن وُجدت عناصرها)
   - يعمل حتى لو العناصر ناقصة: ينشئها تلقائيًا
   - يعتمد على APIs عامة: AlQuran Cloud / AlAdhan / quranapi.pages.dev
========================================================= */

/* ============ أدوات مساعدة عامة ============ */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
function ensureEl(selector, maker) {
  let el = $(selector);
  if (!el && typeof maker === 'function') {
    el = maker();
  }
  return el;
}

/* ============ الوضع الليلي/النهاري ============ */
(function theme(){
  const btn = ensureEl('#toggle-theme', () => {
    // لو مفيش زر في الهيدر، نضيفه لأقرب .nav-tools أو الهيدر
    const host = $('.nav-tools') || $('.navbar') || document.body;
    const b = document.createElement('button');
    b.id = 'toggle-theme'; b.title='الوضع الليلي/النهاري'; b.textContent='🌙';
    host.appendChild(b);
    return b;
  });
  function apply() {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', saved==='dark');
    if (btn) btn.textContent = saved==='dark' ? '☀️' : '🌙';
  }
  btn && btn.addEventListener('click', ()=>{
    const d = !document.body.classList.contains('dark');
    localStorage.setItem('theme', d?'dark':'light');
    apply();
  });
  apply();
})();

/* ============ الوقت والتاريخ (هجري + ميلادي) ============ */
(function dateTime(){
  // يدعم شكلين:
  // 1) عنصر واحد #datetime يعرض الوقت+التاريخ الميلادي.
  // 2) ثلاثة عناصر: #current-time + #greg-date + #hijri-date
  const dtAll = ensureEl('#datetime', () => null);
  const curT = $('#current-time');
  const gEl = $('#greg-date');
  const hEl = $('#hijri-date');

  function tick(){
    const now = new Date();
    const greg = now.toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    const time = now.toLocaleTimeString('ar-EG');
    if (dtAll) dtAll.textContent = `${greg} - ${time}`;
    if (curT) curT.textContent = time;
    if (gEl) gEl.textContent = greg;
  }
  tick(); setInterval(tick, 1000);

  // هجري عبر AlAdhan (مرة عند التحميل)
  (async function(){
    try{
      const ts = Math.floor(Date.now()/1000);
      const r = await fetch('https://api.aladhan.com/v1/gToH?timestamp='+ts);
      const j = await r.json();
      if (j?.data?.hijri) {
        const h = j.data.hijri;
        const txt = `${h.weekday.ar} ${h.day} ${h.month.ar} ${h.year}`;
        if (hEl) hEl.textContent = txt;
        if (!hEl && dtAll) dtAll.textContent = dtAll.textContent + ' — هجري: ' + txt;
      }
    }catch{}
  })();
})();

/* ============ المصحف (نص + ترجمة + تفسير عند الضغط) ============ */
(function quranReader(){
  // لازم منطقة للمصحف. لو مش موجودة هننشئها.
  let qSection = $('.quran');
  if (!qSection) {
    // لو الصفحة quran.html غالبًا في body، نضيف بلوك بسيط
    if (location.pathname.endsWith('quran.html') || $('title')?.textContent.includes('المصحف')) {
      qSection = document.createElement('section');
      qSection.className = 'quran';
      qSection.innerHTML = `
        <h2>📖 المصحف</h2>
        <div class="quran-toolbar" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <label>السورة:</label>
          <select id="surah-select"></select>
          <button id="font-plus">A+</button>
          <button id="font-minus">A-</button>
          <select id="translation-select">
            <option value="">بدون ترجمة</option>
            <option value="en.sahih">English - Sahih International</option>
            <option value="fr.hamidullah">Français - Hamidullah</option>
          </select>
          <input id="ayah-search" type="search" placeholder="ابحث عن آية..." />
        </div>
        <div id="quran-content" class="mushaf" style="font-size:22px;line-height:2.2"></div>
        <div id="tafsi-box" class="card hidden"></div>
      `;
      ( $('.page') || $('.container') || document.body ).appendChild(qSection);
    }
  }
  if (!qSection) return; // صفحة ليست للمصحف

  const surahSelect = ensureEl('#surah-select', null);
  const content = ensureEl('#quran-content', null);
  const tSel = ensureEl('#translation-select', null);
  const tafsiBox = ensureEl('#tafsi-box', null);
  const fontPlus = ensureEl('#font-plus', null);
  const fontMinus = ensureEl('#font-minus', null);
  const ayahSearch = ensureEl('#ayah-search', null);

  if (!surahSelect || !content) return;

  let mushafFS = parseInt(getComputedStyle(content).fontSize) || 22;
  fontPlus && (fontPlus.onclick = ()=>{ mushafFS = Math.min(40, mushafFS+2); content.style.fontSize = mushafFS+'px'; });
  fontMinus && (fontMinus.onclick = ()=>{ mushafFS = Math.max(16, mushafFS-2); content.style.fontSize = mushafFS+'px'; });

  ayahSearch && (ayahSearch.oninput = ()=>{
    const q = ayahSearch.value.trim();
    $$('.ayah', content).forEach(el=>{
      el.classList.toggle('active', q && el.textContent.includes(q));
    });
  });

  let meta = [];
  (async function loadList(){
    try{
      const r = await fetch('https://api.alquran.cloud/v1/surah');
      const j = await r.json();
      meta = j.data || [];
      surahSelect.innerHTML = '';
      meta.forEach(s=>{
        const opt = document.createElement('option');
        opt.value = s.number;
        opt.textContent = `${s.number} - ${s.englishName} / ${s.name}`;
        surahSelect.appendChild(opt);
      });
      surahSelect.value = '1';
      render(1);
    }catch{
      // فشل: حط 1..114
      surahSelect.innerHTML = Array.from({length:114}, (_,k)=>{
        const o = document.createElement('option'); o.value=String(k+1); o.textContent=(k+1); return o;
      }).map(o=>o.outerHTML).join('');
      surahSelect.value = '1';
      render(1);
    }
  })();

  async function render(number) {
    content.innerHTML = '<div class="muted">جاري التحميل...</div>';
    const trans = tSel?.value || '';
    try{
      const arRes = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
      const ar = await arRes.json();
      let trAyat = [];
      if (trans) {
        const trRes = await fetch(`https://api.alquran.cloud/v1/surah/${number}/${trans}`);
        const tr = await trRes.json();
        trAyat = (tr.data?.ayahs||[]).map(a=>a.text);
      }
      content.innerHTML = '';
      (ar.data?.ayahs || []).forEach((a, idx)=>{
        const span = document.createElement('span');
        span.className = 'ayah';
        span.dataset.idx = String(idx+1);
        const trPart = trAyat[idx] ? `<div class="muted" style="font-size:16px;margin-top:6px">${trAyat[idx]}</div>` : '';
        span.innerHTML = `${a.text} <small>۝${idx+1}</small>${trPart}`;
        span.addEventListener('click', ()=> showTafsir(number, idx+1));
        content.appendChild(span);
      });
    }catch{
      content.innerHTML = '<div class="muted">تعذر تحميل السورة. تأكد من الاتصال بالإنترنت.</div>';
    }
  }

  async function showTafsir(surah, ayah){
    try{
      const r = await fetch(`https://quranapi.pages.dev/api/tafsir/${surah}_${ayah}.json`);
      const j = await r.json();
      tafsiBox && tafsiBox.classList.remove('hidden');
      if (tafsiBox) {
        tafsiBox.innerHTML = `<h3>📘 تفسير مختصر</h3>
          <details open><summary>ابن كثير</summary><div>${(j?.tafsir?.['Ibn Kathir']||'—')}</div></details>`;
        tafsiBox.scrollIntoView({behavior:'smooth'});
      }
    }catch{}
  }

  surahSelect.addEventListener('change', ()=> render(surahSelect.value));
  tSel && tSel.addEventListener('change', ()=> render(surahSelect.value));
})();

/* ============ الأذكار (تبويبات + أدوات) ============ */
(function azkar(){
  // هنتعامل حتى لو الصفحة مافيهاش التبويبات—ننشئها
  let azSec = $('.azkar');
  if (!azSec) {
    if (location.pathname.endsWith('azkar.html') || $('title')?.textContent.includes('الأذكار')) {
      azSec = document.createElement('section');
      azSec.className = 'azkar';
      azSec.innerHTML = `
        <h2>🌿 الأذكار</h2>
        <div class="tabs">
          <button class="tab active" data-tab="morning">أذكار الصباح 🌅</button>
          <button class="tab" data-tab="evening">أذكار المساء 🌙</button>
          <button class="tab" data-tab="sleep">أذكار النوم 🛏</button>
          <button class="tab" data-tab="prayer">أذكار الصلاة 🙏</button>
          <button class="tab" data-tab="wudu">أذكار الوضوء 💧</button>
        </div>
        <div id="azkar-list" class="azkar-list"></div>
      `;
      ( $('.page') || $('.container') || document.body ).appendChild(azSec);
    }
  }
  if (!azSec) return;

  // مصدر البيانات: APP_DATA إن وُجد، وإلا افتراضي داخلي
  const base = (window.APP_DATA && window.APP_DATA.azkar) || {
    morning: [
      { text: 'أَصْـبَحْـنا وأَصْبَـحَ المـلكُ لله...', repeat: 1 },
      { text: 'اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْت...', repeat: 1 }
    ],
    evening: [{ text:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ...', repeat:1 }],
    sleep: [{ text:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', repeat:1 }],
    prayer: [{ text:'أستغفر الله ثلاثًا بعد الصلاة', repeat:3 }],
    wudu: [{ text:'سبحانك اللهم وبحمدك، أشهد أن لا إله إلا أنت...', repeat:1 }]
  };

  const tabs = $$('.tab', azSec);
  const list = ensureEl('#azkar-list', null);
  if (!list) return;

  function render(cat){
    const data = base[cat] || [];
    list.innerHTML = '';
    data.forEach(z=>{
      const div = document.createElement('div');
      div.className = 'zekr';
      div.innerHTML = `
        <div>${z.text}</div>
        <div class="zekr-tools" style="display:flex;gap:8px;align-items:center;margin-top:6px">
          <button class="copy">نسخ</button>
          <button class="share">مشاركة</button>
          <div class="counter">
            <button class="dec">-</button>
            <input type="number" value="${z.repeat||1}" min="1" />
            <button class="inc">+</button>
          </div>
          <button class="fav">⭐</button>
        </div>`;
      list.appendChild(div);
      const input = $('input', div);
      $('.inc', div).onclick = ()=> input.value = Number(input.value)+1;
      $('.dec', div).onclick = ()=> input.value = Math.max(1, Number(input.value)-1);
      $('.copy', div).onclick = ()=> navigator.clipboard.writeText(z.text);
      $('.share', div).onclick = async ()=>{
        if (navigator.share) { try{ await navigator.share({text:z.text}); }catch{} }
        else alert('المشاركة غير مدعومة في هذا المتصفح');
      };
      $('.fav', div).onclick = ()=> {
        const fav = JSON.parse(localStorage.getItem('favorites')||'{"zekr":[]}');
        fav.zekr = fav.zekr || [];
        if (!fav.zekr.includes(z.text)) fav.zekr.push(z.text);
        localStorage.setItem('favorites', JSON.stringify(fav));
        alert('تمت إضافة الذكر للمفضلة');
      };
    });
  }
  tabs.forEach(b=> b.onclick = ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    render(b.dataset.tab);
  });
  // افتراضي: الصباح
  render('morning');
})();

/* ============ مواقيت الصلاة + عدّاد الأذان ============ */
(function prayers(){
  // نبني القسم لو مش موجود
  let grid = $('#prayer-grid');
  if (!grid) {
    if (location.pathname.endsWith('prayers.html') || $('title')?.textContent.includes('توقيتات الصلاة')) {
      const sec = document.createElement('section');
      sec.innerHTML = `
        <h2>🕰 مواقيت الصلاة</h2>
        <div class="controls" style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="locate-btn">تحديد الموقع تلقائيًا</button>
          <input id="city-input" type="text" placeholder="المدينة (مثال: Cairo)" />
          <input id="country-input" type="text" placeholder="الدولة (مثال: Egypt)" />
          <button id="fetch-by-city">بحث</button>
        </div>
        <div id="prayer-grid" class="prayer-grid" style="margin-top:12px"></div>
        <div class="next-athan card" style="margin-top:12px">
          <h3>الوقت المتبقي للأذان التالي:</h3>
          <div id="countdown">--:--:--</div>
        </div>`;
      ( $('.page') || $('.container') || document.body ).appendChild(sec);
      grid = $('#prayer-grid');
    }
  }
  if (!grid) return;

  const countdownEl = $('#countdown');
  const locateBtn = $('#locate-btn');
  const cityInput = $('#city-input');
  const countryInput = $('#country-input');
  const fetchByCity = $('#fetch-by-city');

  async function renderTimings(data){
    grid.innerHTML = '';
    const names = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    names.forEach(n=>{
      const div = document.createElement('div');
      div.className = 'prayer-card';
      div.innerHTML = `<div style="font-weight:700">${n}</div><div style="font-size:24px;margin-top:6px">${data.timings[n]}</div>`;
      grid.appendChild(div);
    });
    // عدّاد
    function parseHHMM(s){
      const [h,m] = s.split(':').map(Number);
      const now = new Date(); const d = new Date(now);
      d.setHours(h,m,0,0); if (d<now) d.setDate(d.getDate()+1);
      return d;
    }
    const set = names.map(n=>({name:n, time:parseHHMM(data.timings[n])})).sort((a,b)=>a.time-b.time);
    function updateCountdown(){
      const now = new Date();
      const t = set.find(x=>x.time>now) || set[0];
      const diff = t.time - now;
      const hh = String(Math.floor(diff/3600000)).padStart(2,'0');
      const mm = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
      const ss = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
      if (countdownEl) countdownEl.textContent = `${t.name}: ${hh}:${mm}:${ss}`;
    }
    updateCountdown(); setInterval(updateCountdown, 1000);
  }

  async function timingsByCoords(lat, lon){
    const r = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`);
    const j = await r.json();
    j?.data && renderTimings(j.data);
  }
  async function timingsByCity(city, country){
    const r = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country||'')}&method=5`);
    const j = await r.json();
    j?.data && renderTimings(j.data);
  }

  locateBtn && locateBtn.addEventListener('click', ()=>{
    navigator.geolocation.getCurrentPosition(p=> timingsByCoords(p.coords.latitude, p.coords.longitude),
      _=> alert('تعذر تحديد الموقع.'), {enableHighAccuracy:true, timeout:8000});
  });
  fetchByCity && fetchByCity.addEventListener('click', ()=>{
    const c = cityInput?.value?.trim() || 'Cairo';
    const k = countryInput?.value?.trim() || 'Egypt';
    timingsByCity(c, k);
  });

  // تحميل افتراضي (القاهرة) لو مفيش تفاعل
  timingsByCity('Cairo', 'Egypt');
})();

/* ============ البث المباشر + التلاوات (لو موجودة عناصرها) ============ */
(function mediaPlayers(){
  // Egypt Radio
  const egyptAudio = $('#egypt-radio');
  if (egyptAudio){
    const streams = [
      'https://stream.zeno.fm/tv0x28xvyc9uv',
      'https://stream.zeno.fm/rwq8bkh4n18uv'
    ];
    let i = 0;
    function tryPlay(){
      egyptAudio.src = streams[i];
      egyptAudio.play().catch(()=>{ i=(i+1)%streams.length; if(i!==0) tryPlay(); });
    }
    tryPlay();
  }
  // Makkah HLS (يتطلب hls.js في live.html)
  const makkahVideo = $('#makkah-hls');
  if (makkahVideo){
    const hlsSrc = 'https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/saudi_quran/hls1/saudi_quran.m3u8';
    if (window.Hls && Hls.isSupported()){
      const hls = new Hls({ maxBufferLength: 30 });
      hls.loadSource(hlsSrc);
      hls.attachMedia(makkahVideo);
    } else if (makkahVideo.canPlayType('application/vnd.apple.mpegurl')) {
      makkahVideo.src = hlsSrc;
    }
  }

  // Recitations (لو الصفحة فيها عناصرها)
  const audioSelect = $('#surah-audio-select');
  const reciterSelect = $('#reciter-select');
  const bitrateSelect = $('#bitrate-select');
  const player = $('#surah-player');

  async function loadSurahs(){
    if(!audioSelect) return;
    try{
      const r = await fetch('https://api.alquran.cloud/v1/surah');
      const j = await r.json();
      audioSelect.innerHTML='';
      (j.data||[]).forEach(s=>{
        const o = document.createElement('option');
        o.value = s.number;
        o.textContent = `${s.number} - ${s.name} / ${s.englishName}`;
        audioSelect.appendChild(o);
      });
    }catch{
      audioSelect.innerHTML = Array.from({length:114}, (_,k)=>`<option value="${k+1}">${k+1}</option>`).join('');
    }
  }
  function setAudio(){
    if(!player || !audioSelect || !reciterSelect || !bitrateSelect) return;
    const surah = audioSelect.value || '1';
    const edition = reciterSelect.value || 'ar.mahermuaiqly';
    const br = bitrateSelect.value || '128';
    const url = `https://cdn.islamic.network/quran/audio-surah/${br}/${edition}/${surah}.mp3`;
    player.src = url;
    player.play().catch(()=>{});
    localStorage.setItem('last_reciter', edition);
    localStorage.setItem('last_bitrate', br);
  }
  if(audioSelect){
    loadSurahs().then(()=>{
      const lastR = localStorage.getItem('last_reciter');
      const lastB = localStorage.getItem('last_bitrate');
      if(lastR) reciterSelect.value = lastR;
      if(lastB) bitrateSelect.value = lastB;
      setAudio();
    });
    [audioSelect, reciterSelect, bitrateSelect].forEach(el=> el && el.addEventListener('change', setAudio));
  }
})();

/* ============ التسبيح الذكي + الختمة ============ */
(function smartTasbeeh(){
  const select = $('#dhikr-select');
  const countEl = $('#count');
  const goalEl = $('#daily-goal');
  const inc = $('#inc');
  const reset = $('#reset');
  const vibr = $('#vibrate');

  if(!select || !countEl) return;

  function key(d){ return 'tsb_'+d; }
  function load(){
    const d = select.value;
    const obj = JSON.parse(localStorage.getItem(key(d))||'{"count":0,"goal":100,"date":""}');
    const today = new Date().toISOString().slice(0,10);
    if (obj.date !== today) obj.count = 0, obj.date = today;
    countEl.textContent = obj.count;
    goalEl && (goalEl.value = obj.goal || 100);
    localStorage.setItem(key(d), JSON.stringify(obj));
  }
  function save(){
    const d = select.value;
    const obj = JSON.parse(localStorage.getItem(key(d))||'{"count":0,"goal":100,"date":""}');
    obj.count = Number(countEl.textContent);
    obj.goal = Number(goalEl ? goalEl.value : 100);
    obj.date = new Date().toISOString().slice(0,10);
    localStorage.setItem(key(d), JSON.stringify(obj));
    if (obj.count >= obj.goal) {
      if ('Notification' in window && Notification.permission==='granted'){
        new Notification('ما شاء الله ✨',{ body:'تم الوصول للهدف اليومي من التسبيح: '+d });
      }
      try{ navigator.vibrate && navigator.vibrate([100,50,100]); }catch{}
      alert('ما شاء الله ✨ وصلت للهدف!');
    }
  }
  select.addEventListener('change', load);
  inc && inc.addEventListener('click', ()=>{ countEl.textContent = Number(countEl.textContent)+1; save(); });
  reset && reset.addEventListener('click', ()=>{ countEl.textContent = 0; save(); });
  vibr && vibr.addEventListener('click', ()=>{ try{ navigator.vibrate && navigator.vibrate(80);}catch{} });
  goalEl && goalEl.addEventListener('change', save);
  if ('Notification' in window && Notification.permission==='default'){ Notification.requestPermission(); }
  load();
})();

(function khatma(){
  // يحقن صندوق الختمة تلقائيًا داخل .quran إن لم يوجد
  const section = $('.quran');
  if(!section) return;
  let box = $('#khatma-box');
  if(!box){
    box = document.createElement('div');
    box.id='khatma-box'; box.className='card';
    box.innerHTML = `
      <h3>🧭 خطة ختمة</h3>
      <div>اختر الخطة:
        <select id="plan">
          <option value="30">شهر (30 يوم)</option>
          <option value="90">3 شهور (90 يوم)</option>
          <option value="29">رمضان (~29 يوم)</option>
        </select>
      </div>
      <div style="margin-top:8px">الأجزاء المقروءة:
        <input id="parts" type="number" min="0" max="30" value="0" style="width:80px">
      </div>
      <div class="progress" style="height:14px;background:#e5e7eb;border-radius:10px;margin-top:10px;position:relative">
        <div id="pg" style="height:100%;width:0%;background:var(--gold);border-radius:10px"></div>
      </div>
      <div class="muted" id="pg-text">0%</div>
    `;
    section.appendChild(box);
  }
  const plan = $('#plan', box);
  const parts = $('#parts', box);
  const bar = $('#pg', box);
  const txt = $('#pg-text', box);

  function load(){
    try{
      const s = JSON.parse(localStorage.getItem('khatma')||'{}');
      if (s.plan) plan.value = s.plan;
      if (s.parts != null) parts.value = s.parts;
    }catch{}
    update();
  }
  function save(){
    localStorage.setItem('khatma', JSON.stringify({ plan: plan.value, parts: Number(parts.value) }));
  }
  function update(){
    const pct = Math.min(100, (Number(parts.value)/30)*100);
    bar.style.width = pct+'%';
    txt.textContent = pct.toFixed(1)+'%';
    save();
  }
  plan.addEventListener('change', save);
  parts.addEventListener('input', update);
  load();
})();
