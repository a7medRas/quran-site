/* =========================================================
   MAIN.JS — نسخة كاملة ذاتية الإصلاح Self-Healing
   - الوضع الليلي/النهاري
   - الوقت/التاريخ (ميلادي + هجري)
   - المصحف كامل + ترجمة + تفسير عند الضغط
   - الأذكار (تبويبات) + أدوات المشاركة/النسخ والمفضلة
   - مواقيت الصلاة + عدّاد الأذان التالي
   - البث المباشر (إذاعة مصر) + بث الحرم (HLS)
   - التلاوات (اختيار قارئ/سورة/جودة)
   - التسبيح الذكي (عداد + هدف يومي)
   - ختمة القرآن (خطة + نسبة تقدّم)
   - وضع المسجد: آية اليوم + تفسير + ذكر اليوم (تتحدث يوميًا وتخزّن محليًا)
========================================================= */

/* ============ أدوات عامة ============ */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
function ensureEl(selector, maker) {
  let el = $(selector);
  if (!el && typeof maker === 'function') el = maker();
  return el;
}

/* ============ الوضع الليلي/النهاري ============ */
(function theme(){
  const btn = ensureEl('#toggle-theme', () => {
    const host = $('.nav-tools') || $('.navbar') || document.body;
    const b = document.createElement('button');
    b.id = 'toggle-theme'; b.title='الوضع الليلي/النهاري'; b.textContent='🌙';
    host.appendChild(b); return b;
  });
  function apply() {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', saved==='dark');
    if (btn) btn.textContent = saved==='dark' ? '☀️' : '🌙';
  }
  btn && btn.addEventListener('click', ()=>{
    const d = !document.body.classList.contains('dark');
    localStorage.setItem('theme', d?'dark':'light'); apply();
  });
  apply();
})();

/* ============ التاريخ والوقت (ميلادي + هجري) ============ */
(function dateTime(){
  const dtAll = ensureEl('#datetime', () => null);
  const curT = $('#current-time'); const gEl = $('#greg-date'); const hEl = $('#hijri-date');
  function tick(){
    const now = new Date();
    const greg = now.toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    const time = now.toLocaleTimeString('ar-EG');
    if (dtAll) dtAll.textContent = `${greg} - ${time}`;
    if (curT) curT.textContent = time;
    if (gEl) gEl.textContent = greg;
  }
  tick(); setInterval(tick, 1000);
  (async function(){ // هجري
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

/* ============ المصحف (نص + ترجمة + تفسير) ============ */
(function quranReader(){
  let qSection = $('.quran');
  if (!qSection && (location.pathname.endsWith('quran.html') || $('title')?.textContent.includes('المصحف'))) {
    qSection = document.createElement('section'); qSection.className = 'quran';
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
      <div id="tafsi-box" class="card hidden"></div>`;
    ( $('.page') || $('.container') || document.body ).appendChild(qSection);
  }
  if (!qSection) return;
  const surahSelect = $('#surah-select'), content = $('#quran-content'),
        tSel = $('#translation-select'), tafsiBox = $('#tafsi-box'),
        fontPlus = $('#font-plus'), fontMinus = $('#font-minus'),
        ayahSearch = $('#ayah-search');
  if (!surahSelect || !content) return;

  let fs = parseInt(getComputedStyle(content).fontSize)||22;
  fontPlus && (fontPlus.onclick=()=>{ fs=Math.min(40,fs+2); content.style.fontSize=fs+'px'; });
  fontMinus && (fontMinus.onclick=()=>{ fs=Math.max(16,fs-2); content.style.fontSize=fs+'px'; });
  ayahSearch && (ayahSearch.oninput=()=>{ const q=ayahSearch.value.trim(); $$('.ayah',content).forEach(el=> el.classList.toggle('active', q && el.textContent.includes(q))); });

  (async function loadList(){
    try{
      const r=await fetch('https://api.alquran.cloud/v1/surah'); const j=await r.json();
      const meta=j.data||[]; surahSelect.innerHTML='';
      meta.forEach(s=>{ const o=document.createElement('option'); o.value=s.number; o.textContent=`${s.number} - ${s.englishName} / ${s.name}`; surahSelect.appendChild(o); });
      surahSelect.value='1'; render(1);
    }catch{
      surahSelect.innerHTML=Array.from({length:114},(_,k)=>`<option value="${k+1}">${k+1}</option>`).join('');
      surahSelect.value='1'; render(1);
    }
  })();

  async function render(number){
    content.innerHTML='<div class="muted">جاري التحميل...</div>'; const trans=tSel?.value||'';
    try{
      const ar=await (await fetch(`https://api.alquran.cloud/v1/surah/${number}`)).json();
      let trAyat=[]; if(trans){ const tr=await (await fetch(`https://api.alquran.cloud/v1/surah/${number}/${trans}`)).json(); trAyat=(tr.data?.ayahs||[]).map(a=>a.text); }
      content.innerHTML=''; (ar.data?.ayahs||[]).forEach((a,idx)=>{ const span=document.createElement('span'); span.className='ayah'; span.dataset.idx=idx+1; const trPart=trAyat[idx]?`<div class="muted" style="font-size:16px;margin-top:6px">${trAyat[idx]}</div>`:''; span.innerHTML=`${a.text} <small>۝${idx+1}</small>${trPart}`; span.addEventListener('click',()=>showTafsir(number,idx+1)); content.appendChild(span); });
    }catch{ content.innerHTML='<div class="muted">تعذر تحميل السورة. تأكد من الاتصال بالإنترنت.</div>'; }
  }
  async function showTafsir(surah,ayah){
    try{
      const j=await (await fetch(`https://quranapi.pages.dev/api/tafsir/${surah}_${ayah}.json`)).json();
      tafsiBox && tafsiBox.classList.remove('hidden');
      if(tafsiBox){ tafsiBox.innerHTML=`<h3>📘 تفسير مختصر</h3><details open><summary>ابن كثير</summary><div>${(j?.tafsir?.['Ibn Kathir']||'—')}</div></details>`; tafsiBox.scrollIntoView({behavior:'smooth'}); }
    }catch{}
  }
  surahSelect.addEventListener('change', ()=>render(surahSelect.value));
  tSel && tSel.addEventListener('change', ()=>render(surahSelect.value));
})();

/* ============ الأذكار (تبويبات + أدوات) ============ */
(function azkar(){
  let azSec=$('.azkar');
  if(!azSec && (location.pathname.endsWith('azkar.html') || $('title')?.textContent.includes('الأذكار'))){
    azSec=document.createElement('section'); azSec.className='azkar';
    azSec.innerHTML=`<h2>🌿 الأذكار</h2>
      <div class="tabs">
        <button class="tab active" data-tab="morning">أذكار الصباح 🌅</button>
        <button class="tab" data-tab="evening">أذكار المساء 🌙</button>
        <button class="tab" data-tab="sleep">أذكار النوم 🛏</button>
        <button class="tab" data-tab="prayer">أذكار الصلاة 🙏</button>
        <button class="tab" data-tab="wudu">أذكار الوضوء 💧</button>
      </div>
      <div id="azkar-list" class="azkar-list"></div>`;
    ( $('.page') || $('.container') || document.body ).appendChild(azSec);
  }
  if(!azSec) return;
  const base=(window.APP_DATA&&window.APP_DATA.azkar)||{
    morning:[{text:'أَصْـبَحْـنا وأَصْبَـحَ المـلكُ لله...',repeat:1},{text:'اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْت...',repeat:1}],
    evening:[{text:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ...',repeat:1}],
    sleep:[{text:'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',repeat:1}],
    prayer:[{text:'أستغفر الله ثلاثًا بعد الصلاة',repeat:3}],
    wudu:[{text:'سبحانك اللهم وبحمدك، أشهد أن لا إله إلا أنت...',repeat:1}]
  };
  const tabs=$$('.tab',azSec); const list=$('#azkar-list'); if(!list) return;
  function render(cat){
    const data=base[cat]||[]; list.innerHTML='';
    data.forEach(z=>{
      const div=document.createElement('div'); div.className='zekr';
      div.innerHTML=`<div>${z.text}</div>
      <div class="zekr-tools" style="display:flex;gap:8px;align-items:center;margin-top:6px">
        <button class="copy">نسخ</button><button class="share">مشاركة</button>
        <div class="counter"><button class="dec">-</button><input type="number" value="${z.repeat||1}" min="1"/><button class="inc">+</button></div>
        <button class="fav">⭐</button></div>`;
      list.appendChild(div);
      const input=$('input',div);
      $('.inc',div).onclick=()=> input.value=Number(input.value)+1;
      $('.dec',div).onclick=()=> input.value=Math.max(1,Number(input.value)-1);
      $('.copy',div).onclick=()=> navigator.clipboard.writeText(z.text);
      $('.share',div).onclick=async()=>{ if(navigator.share){ try{ await navigator.share({text:z.text}); }catch{} } else alert('المشاركة غير مدعومة'); };
      $('.fav',div).onclick=()=>{ const fav=JSON.parse(localStorage.getItem('favorites')||'{"zekr":[]}'); fav.zekr=fav.zekr||[]; if(!fav.zekr.includes(z.text)) fav.zekr.push(z.text); localStorage.setItem('favorites', JSON.stringify(fav)); alert('تمت الإضافة للمفضلة'); };
    });
  }
  tabs.forEach(b=> b.onclick=()=>{ tabs.forEach(x=>x.classList.remove('active')); b.classList.add('active'); render(b.dataset.tab); });
  render('morning');
})();

/* ============ مواقيت الصلاة + عداد الأذان ============ */
(function prayers(){
  let grid=$('#prayer-grid');
  if(!grid && (location.pathname.endsWith('prayers.html') || $('title')?.textContent.includes('توقيتات الصلاة'))){
    const sec=document.createElement('section');
    sec.innerHTML=`<h2>🕰 مواقيت الصلاة</h2>
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
    grid=$('#prayer-grid');
  }
  if(!grid) return;

  const countdownEl=$('#countdown'); const locateBtn=$('#locate-btn');
  const cityInput=$('#city-input'); const countryInput=$('#country-input'); const fetchByCity=$('#fetch-by-city');

  async function renderTimings(data){
    grid.innerHTML=''; const names=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    names.forEach(n=>{ const div=document.createElement('div'); div.className='prayer-card'; div.innerHTML=`<div style="font-weight:700">${n}</div><div style="font-size:24px;margin-top:6px">${data.timings[n]}</div>`; grid.appendChild(div); });
    function parseHHMM(s){ const [h,m]=s.split(':').map(Number); const now=new Date(); const d=new Date(now); d.setHours(h,m,0,0); if(d<now) d.setDate(d.getDate()+1); return d; }
    const set=names.map(n=>({name:n,time:parseHHMM(data.timings[n])})).sort((a,b)=>a.time-b.time);
    function updateCountdown(){ const now=new Date(); const t=set.find(x=>x.time>now)||set[0]; const diff=t.time-now; const hh=String(Math.floor(diff/3600000)).padStart(2,'0'); const mm=String(Math.floor((diff%3600000)/60000)).padStart(2,'0'); const ss=String(Math.floor((diff%60000)/1000)).padStart(2,'0'); countdownEl && (countdownEl.textContent=`${t.name}: ${hh}:${mm}:${ss}`); }
    updateCountdown(); setInterval(updateCountdown,1000);
  }
  async function timingsByCoords(lat,lon){ const j=await (await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`)).json(); j?.data && renderTimings(j.data); }
  async function timingsByCity(city,country){ const j=await (await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country||'')}&method=5`)).json(); j?.data && renderTimings(j.data); }

  locateBtn && locateBtn.addEventListener('click', ()=>{ navigator.geolocation.getCurrentPosition(p=>timingsByCoords(p.coords.latitude,p.coords.longitude), _=>alert('تعذر تحديد الموقع.'), {enableHighAccuracy:true,timeout:8000}); });
  fetchByCity && fetchByCity.addEventListener('click', ()=>{ const c=cityInput?.value?.trim()||'Cairo'; const k=countryInput?.value?.trim()||'Egypt'; timingsByCity(c,k); });

  timingsByCity('Cairo','Egypt'); // افتراضي
})();

/* ============ البث المباشر + التلاوات (إن وُجدت عناصرها) ============ */
(function mediaPlayers(){
  // إذاعة القرآن المصرية
  const egyptAudio=$('#egypt-radio');
  if(egyptAudio){
    const streams=['https://stream.zeno.fm/tv0x28xvyc9uv','https://stream.zeno.fm/rwq8bkh4n18uv'];
    let i=0; function tryPlay(){ egyptAudio.src=streams[i]; egyptAudio.play().catch(()=>{ i=(i+1)%streams.length; if(i!==0) tryPlay(); }); }
    tryPlay();
  }
  // بث الحرم (hls.js مطلوب في live.html)
  const makkahVideo=$('#makkah-hls');
  if(makkahVideo){
    const hlsSrc='https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/saudi_quran/hls1/saudi_quran.m3u8';
    if(window.Hls && Hls.isSupported()){ const hls=new Hls({maxBufferLength:30}); hls.loadSource(hlsSrc); hls.attachMedia(makkahVideo); }
    else if(makkahVideo.canPlayType('application/vnd.apple.mpegurl')) makkahVideo.src=hlsSrc;
  }
  // التلاوات
  const audioSelect=$('#surah-audio-select'), reciterSelect=$('#reciter-select'), bitrateSelect=$('#bitrate-select'), player=$('#surah-player');
  async function loadSurahs(){ if(!audioSelect) return; try{ const j=await (await fetch('https://api.alquran.cloud/v1/surah')).json(); audioSelect.innerHTML=''; (j.data||[]).forEach(s=>{ const o=document.createElement('option'); o.value=s.number; o.textContent=`${s.number} - ${s.name} / ${s.englishName}`; audioSelect.appendChild(o); }); }catch{ audioSelect.innerHTML=Array.from({length:114},(_,k)=>`<option value="${k+1}">${k+1}</option>`).join(''); } }
  function setAudio(){ if(!player||!audioSelect||!reciterSelect||!bitrateSelect) return; const surah=audioSelect.value||'1'; const edition=reciterSelect.value||'ar.mahermuaiqly'; const br=bitrateSelect.value||'128'; const url=`https://cdn.islamic.network/quran/audio-surah/${br}/${edition}/${surah}.mp3`; player.src=url; player.play().catch(()=>{}); localStorage.setItem('last_reciter',edition); localStorage.setItem('last_bitrate',br); }
  if(audioSelect){ loadSurahs().then(()=>{ const r=localStorage.getItem('last_reciter'); const b=localStorage.getItem('last_bitrate'); if(r) reciterSelect.value=r; if(b) bitrateSelect.value=b; setAudio(); }); [audioSelect,reciterSelect,bitrateSelect].forEach(el=> el&&el.addEventListener('change', setAudio)); }
})();

/* ============ التسبيح الذكي ============ */
(function smartTasbeeh(){
  const select=$('#dhikr-select'), countEl=$('#count'), goalEl=$('#daily-goal'), inc=$('#inc'), reset=$('#reset'), vibr=$('#vibrate');
  if(!select||!countEl) return;
  function key(d){ return 'tsb_'+d; }
  function load(){ const d=select.value; const obj=JSON.parse(localStorage.getItem(key(d))||'{"count":0,"goal":100,"date":""}'); const today=new Date().toISOString().slice(0,10); if(obj.date!==today) obj.count=0, obj.date=today; countEl.textContent=obj.count; goalEl && (goalEl.value=obj.goal||100); localStorage.setItem(key(d), JSON.stringify(obj)); }
  function save(){ const d=select.value; const obj=JSON.parse(localStorage.getItem(key(d))||'{"count":0,"goal":100,"date":""}'); obj.count=Number(countEl.textContent); obj.goal=Number(goalEl?goalEl.value:100); obj.date=new Date().toISOString().slice(0,10); localStorage.setItem(key(d), JSON.stringify(obj)); if(obj.count>=obj.goal){ if('Notification'in window && Notification.permission==='granted'){ new Notification('ما شاء الله ✨',{ body:'تم الوصول للهدف اليومي من التسبيح: '+d }); } try{ navigator.vibrate&&navigator.vibrate([100,50,100]); }catch{} alert('ما شاء الله ✨ وصلت للهدف!'); } }
  select.addEventListener('change', load);
  inc && inc.addEventListener('click', ()=>{ countEl.textContent=Number(countEl.textContent)+1; save(); });
  reset && reset.addEventListener('click', ()=>{ countEl.textContent=0; save(); });
  vibr && vibr.addEventListener('click', ()=>{ try{ navigator.vibrate&&navigator.vibrate(80);}catch{} });
  goalEl && goalEl.addEventListener('change', save);
  if('Notification'in window && Notification.permission==='default'){ Notification.requestPermission(); }
  load();
})();

/* ============ ختمة القرآن (خطة + نسبة تقدّم) ============ */
(function khatma(){
  const section=$('.quran'); if(!section) return;
  let box=$('#khatma-box');
  if(!box){
    box=document.createElement('div'); box.id='khatma-box'; box.className='card';
    box.innerHTML=`<h3>🧭 خطة ختمة</h3>
      <div>اختر الخطة:
        <select id="plan"><option value="30">شهر (30 يوم)</option><option value="90">3 شهور (90 يوم)</option><option value="29">رمضان (~29 يوم)</option></select>
      </div>
      <div style="margin-top:8px">الأجزاء المقروءة:
        <input id="parts" type="number" min="0" max="30" value="0" style="width:80px">
      </div>
      <div class="progress" style="height:14px;background:#e5e7eb;border-radius:10px;margin-top:10px;position:relative">
        <div id="pg" style="height:100%;width:0%;background:var(--gold);border-radius:10px"></div>
      </div>
      <div class="muted" id="pg-text">0%</div>`;
    section.appendChild(box);
  }
  const plan=$('#plan',box), parts=$('#parts',box), bar=$('#pg',box), txt=$('#pg-text',box);
  function load(){ try{ const s=JSON.parse(localStorage.getItem('khatma')||'{}'); if(s.plan) plan.value=s.plan; if(s.parts!=null) parts.value=s.parts; }catch{} update(); }
  function save(){ localStorage.setItem('khatma', JSON.stringify({ plan:plan.value, parts:Number(parts.value) })); }
  function update(){ const pct=Math.min(100,(Number(parts.value)/30)*100); bar.style.width=pct+'%'; txt.textContent=pct.toFixed(1)+'%'; save(); }
  plan.addEventListener('change', save); parts.addEventListener('input', update); load();
})();

/* ============ وضع المسجد: آية اليوم + تفسير + ذكر اليوم ============ */
(function mosqueDaily(){
  const inMosque = location.pathname.endsWith('mosque.html') || document.getElementById('verse-day');
  if (!inMosque) return;

  function ensure(id, afterSel, htmlIfMissing){
    let el=document.getElementById(id);
    if(!el && htmlIfMissing){
      const host=document.querySelector(afterSel)||document.body;
      const wrap=document.createElement('div'); wrap.className='card'; wrap.innerHTML=htmlIfMissing; host.appendChild(wrap);
      el=document.getElementById(id);
    } return el;
  }
  const verseEl=ensure('verse-day','.bg-mosque, .page, body','<div><strong>آية اليوم:</strong> <span id="verse-day">—</span></div>');
  const tafsirEl=ensure('tafsir-day','.bg-mosque, .page, body','<div class="muted" id="tafsir-day">—</div>');
  const zekrEl=ensure('zekr-day','.bg-mosque, .page, body','<strong>ذكر اليوم:</strong> <span id="zekr-day">—</span>');

  const ZEKR_LIST=[
    'سبحان الله وبحمده، سبحان الله العظيم',
    'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
    'أستغفر الله العظيم وأتوب إليه',
    'اللهم صلِّ وسلم على نبينا محمد',
    'سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر',
    'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم',
    'اللهم اغفر لي ولوالدي ولجميع المسلمين'
  ];

  const today=new Date().toISOString().slice(0,10);
  const cacheKey='mosque_daily';
  const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');

  function fill(data){
    if(verseEl) verseEl.textContent=data.verse||'—';
    if(tafsirEl) tafsirEl.textContent=data.tafsir ? (data.tafsir.length>500?data.tafsir.slice(0,500)+'…':data.tafsir) : '—';
    if(zekrEl) zekrEl.textContent=data.zekr||'—';
  }
  if(cached && cached.date===today){ fill(cached); return; }

  (async ()=>{
    let verseText='', tafsirTxt='';
    try{
      const j=await (await fetch('https://api.alquran.cloud/v1/ayah/random')).json();
      verseText=j?.data?.text||'';
      const sid=j?.data?.surah?.number, aid=j?.data?.numberInSurah;
      if(sid && aid){
        try{ const tj=await (await fetch(`https://quranapi.pages.dev/api/tafsir/${sid}_${aid}.json`)).json(); tafsirTxt=tj?.tafsir?.['Ibn Kathir']||''; }catch{}
      }
    }catch{
      verseText='﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ﴾';
      tafsirTxt='دعاء جامع لخيري الدنيا والآخرة.';
    }
    const dayIdx=new Date().getDay(); const zekr=ZEKR_LIST[dayIdx % ZEKR_LIST.length];
    const data={ date:today, verse:verseText, tafsir:tafsirTxt, zekr };
    localStorage.setItem(cacheKey, JSON.stringify(data)); fill(data);
  })();
})();
