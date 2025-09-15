/* =========================================================
   MAIN.JS — نسخة كاملة ومُحسّنة للموبايل + بناء ذاتي للأقسام
   - الوضع الليلي/النهاري
   - التاريخ والوقت (ميلادي + هجري)
   - المصحف (نص عثماني + ترجمة + تفسير عند الضغط)
   - الأذكار (تبويبات) | أذكار الصباح كاملة
   - مواقيت الصلاة + عدّاد الأذان التالي (تحديد موقع/مدينة)
   - البث المباشر (إذاعة مصر + بث الحرم HLS) تشغيل داخلي
   - التلاوات (القارئ/السورة/الجودة) تشغيل داخلي
   - التسبيح الذكي (هدف يومي + إشعار عند بلوغه)
   - ختمة القرآن (خطة + نسبة التقدم)
   - وضع المسجد (آية اليوم + تفسير + ذكر اليوم) مع كاش يومي
   - بوابة “ابدأ التشغيل” لحل قيود الموبايل على الصوت/الفيديو
   - بناء الأقسام تلقائيًا لو العناصر ناقصة في الصفحة
========================================================= */

/* ============ بيانات الأذكار المدمجة: أذكار الصباح كاملة ============ */
window.APP_DATA = window.APP_DATA || {};
window.APP_DATA.azkar = {
  morning: [
    {
      text:
`أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ

اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ. [البقرة: 255]`,
      repeat: 1,
      note: 'من قالها حين يصبح أُجير من الجن حتى يمسي، وحين يمسي حتى يصبح.'
    },
    { text:
`بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم
قُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ.`,
      repeat: 3 },
    { text:
`بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم
قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ.`,
      repeat: 3 },
    { text:
`بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم
قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ، مَلِكِ ٱلنَّاسِ، إِلَٰهِ ٱلنَّاسِ، مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ، ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ، مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ.`,
      repeat: 3 },
    { text:
`أَصْـبَحْنا وَأَصْـبَحَ المُـلْكُ لله... رَبِّ أَعـوذُ بِكَ مِنْ عَـذابٍ في النّـارِ وَعَـذابٍ في القَـبْر.`,
      repeat: 1 },
    { text:
`اللّهـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ... فَاغْفـِرْ لي فَإِنَّهُ لا يَغْـفِرُ الذُّنـوبَ إِلاّ أَنْتَ.`,
      repeat: 1,
      note: 'من قالها موقنًا بها... دخل الجنة.' },
    { text: 'رَضيـتُ بِاللهِ رَبَّـاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ ﷺ نَبِيّـاً.', repeat: 3,
      note: 'من قالها حين يصبح وحين يمسي كان حقًا على الله أن يرضيه.' },
    { text:
`اللّهُـمَّ إِنِّـي أَصْبَـحْـتُ أُشْـهِدُك... أَنَّ مُحَمّـداً عَبْـدُكَ وَرَسـولُـك.`,
      repeat: 4, note: 'من قالها أعتقه الله من النار.' },
    { text:
`اللّهُـمَّ ما أَصْبَـَحَ بي مِـنْ نِعْـمَةٍ... فَلَـكَ الْحَمْـدُ وَلَـكَ الشُّكْـر.`,
      repeat: 1, note: 'من قالها أدى شكر يومه.' },
    { text: 'حَسْبِـيَ اللّهُ لا إلهَ إلاّ هُوَ... وَهُوَ رَبُّ العَرْشِ العَظـيم.', repeat: 7,
      note: 'كفاه الله ما أهمه.' },
    { text: 'بِسـمِ اللهِ الذي لا يَضُـرُّ... وَهـوَ السّمـيعُ العَلـيم.', repeat: 3, note: 'لم يضره شيء.' },
    { text: 'اللّهُـمَّ بِكَ أَصْـبَحْنا... وَإِلَـيْكَ النُّـشُور.', repeat: 1 },
    { text: 'أَصْبَـحْـنا عَلَى فِطْرَةِ الإسْلاَمِ... وَمَا كَانَ مِنَ المُشْرِكِينَ.', repeat: 1 },
    { text: 'سُبْحـانَ اللهِ وَبِحَمْـدِهِ عَدَدَ خَلْـقِه ...', repeat: 3 },
    { text: 'اللّهُـمَّ عافِـني في بَدَنـي ... لا إلهَ إلاّ أَنْـتَ.', repeat: 3 },
    { text: 'اللّهُـمَّ إِنّـي أَعـوذُ بِكَ مِنَ الْكُـفر ... لا إلهَ إلاّ أَنْـتَ.', repeat: 3 },
    { text:
`اللّهُـمَّ إِنِّـي أسْـأَلُـكَ العَـفْوَ وَالعـافِـية... وَأَعـوذُ بِعَظَمَـتِكَ أَن أُغْـتالَ مِن تَحْتـي.`,
      repeat: 1 },
    { text: 'يَا حَيُّ يَا قيُّومُ... ولا تكلني إلى نفسي طرفة عين.', repeat: 3 },
    { text:
`أَصْبَـحْـنا وَأَصْبَـحْ المُـلكُ للهِ... وَأَعـوذُ بِـكَ مِـنْ شَـرِّ ما فـيهِ.`,
      repeat: 1 },
    { text:
`اللّهُـمَّ عالِـمَ الغَـيْبِ وَالشّـهادَةِ... أَوْ أَجُـرَّهُ إِلـى مُسْـلِم.`,
      repeat: 1 },
    { text: 'أَعـوذُ بِكَلِمـاتِ اللّهِ التّـامّـاتِ مِنْ شَـرِّ ما خَلَـق.', repeat: 3 },
    { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ على نَبِيِّنَا مُحمَّد.', repeat: 10,
      note: 'تُدرك الشفاعة بإذن الله.' },
    { text: 'اللَّهُمَّ إِنَّا نَعُوذُ بِكَ... وَنَسْتَغْفِرُكَ لِمَا لَا نَعْلَمُهُ.', repeat: 3 },
    { text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْهَمِّ... وَقَهْرِ الرِّجَالِ.', repeat: 3 },
    { text: 'أسْتَغْفِرُ اللهَ العَظِيمَ... وَأتُوبُ إلَيهِ.', repeat: 3 },
    { text: 'يَا رَبِّ، لَكَ الْحَمْدُ... وَلِعَظِيمِ سُلْطَانِكَ.', repeat: 3 },
    { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا... وَعَمَلًا مُتَقَبَّلًا.', repeat: 1 },
    { text:
`اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلَّا أَنْتَ... إِنَّ رَبِّي عَلَى صِرَاطٍ مُسْتَقِيمٍ.`,
      repeat: 1, note: 'ذكر طيب.' },
    { text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ... وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.', repeat: 100,
      note: 'عدل عشر رقاب… وحرز من الشيطان.' },
    { text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ.', repeat: 100, note: 'حُطَّتْ الخطايا وإن كانت مثل زبد البحر.' },
    { text: 'أسْتَغْفِرُ اللهَ وَأتُوبُ إلَيْهِ.', repeat: 100,
      note: 'مائة حسنة ومحو مائة سيئة وحرز حتى يمسي.' }
  ],
  evening: [], sleep: [], prayer: [], wudu: []
};

/* ============ أدوات مساعدة سريعة ============ */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
function ensureEl(selector, maker) { let el=$(selector); if(!el && typeof maker==='function') el=maker(); return el; }

/* ============ الوضع الليلي/النهاري ============ */
(function theme(){
  const btn = ensureEl('#toggle-theme', () => {
    const host = $('.nav-tools') || $('.navbar') || document.body;
    const b = document.createElement('button'); b.id='toggle-theme'; b.textContent='🌙';
    host && host.appendChild(b); return b;
  });
  function apply(){
    const saved = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', saved==='dark');
    if (btn) btn.textContent = saved==='dark' ? '☀️' : '🌙';
  }
  btn && btn.addEventListener('click', ()=>{
    const isDark = !document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light'); apply();
  });
  apply();
})();

/* ============ التاريخ والوقت (ميلادي + هجري) ============ */
(function dateTime(){
  if(!document.querySelector('meta[name="viewport"]')){
    const m=document.createElement('meta'); m.name='viewport';
    m.content='width=device-width, initial-scale=1, viewport-fit=cover'; document.head.appendChild(m);
  }
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
  (async ()=>{
    try{
      const ts=Math.floor(Date.now()/1000);
      const j=await (await fetch('https://api.aladhan.com/v1/gToH?timestamp='+ts)).json();
      const h=j?.data?.hijri;
      if(h){
        const txt=`${h.weekday.ar} ${h.day} ${h.month.ar} ${h.year}`;
        if (hEl) hEl.textContent=txt; else if (dtAll) dtAll.textContent += ' — هجري: '+txt;
      }
    }catch{}
  })();
})();

/* ============ بناء أقسام مفقودة (Self-Healing) ============ */
(function bootstrapMissing(){
  const host = $('.page') || (()=>{
    const main=document.createElement('main'); main.className='container page'; document.body.appendChild(main); return main;
  })();

  // المصحف
  if (!$('.quran')){
    const sec=document.createElement('section'); sec.className='quran';
    sec.innerHTML=`
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
    host.appendChild(sec);
  }

  // الأذكار
  if (!$('.azkar')){
    const sec=document.createElement('section'); sec.className='azkar';
    sec.innerHTML=`
      <h2>🌿 الأذكار</h2>
      <div class="tabs">
        <button class="tab active" data-tab="morning">أذكار الصباح 🌅</button>
        <button class="tab" data-tab="evening">أذكار المساء 🌙</button>
        <button class="tab" data-tab="sleep">أذكار النوم 🛏</button>
        <button class="tab" data-tab="prayer">أذكار الصلاة 🙏</button>
        <button class="tab" data-tab="wudu">أذكار الوضوء 💧</button>
      </div>
      <div id="azkar-list" class="azkar-list"></div>`;
    host.appendChild(sec);
  }

  // التلاوات
  if (!$('#surah-player')){
    const sec=document.createElement('section');
    sec.innerHTML=`
      <h2>🎧 التلاوات</h2>
      <div class="card" style="display:grid;gap:8px">
        <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
          <div><label>القارئ</label>
            <select id="reciter-select">
              <option value="ar.faresabbad">فارس عباد</option>
              <option value="ar.mahermuaiqly">ماهر المعيقلي</option>
              <option value="ar.abdulbasitmurattal">عبد الباسط (مرتل)</option>
              <option value="ar.alafasy">مشاري العفاسي</option>
            </select>
          </div>
          <div><label>السورة</label><select id="surah-audio-select"></select></div>
          <div><label>الجودة</label>
            <select id="bitrate-select"><option value="128">128</option><option value="64">64</option><option value="32">32</option></select>
          </div>
        </div>
        <div class="playgate" data-target="surah-player">
          <span class="muted">الموبايل يحتاج ضغطة تشغيل أول مرة</span>
          <button class="start-play">ابدأ التشغيل</button>
        </div>
        <audio id="surah-player" controls playsinline preload="none" style="width:100%"></audio>
      </div>`;
    host.appendChild(sec);
  }

  // البث المباشر
  if (!$('#egypt-radio') || !$('#makkah-hls')){
    const sec=document.createElement('section');
    sec.innerHTML=`
      <h2>📻 البث المباشر</h2>
      <div class="card player-card">
        <div class="player-header">إذاعة القرآن الكريم المصرية</div>
        <div class="playgate" data-target="egypt-radio">
          <span class="muted">اضغط “ابدأ التشغيل” على الموبايل</span>
          <button class="start-play">ابدأ التشغيل</button>
        </div>
        <audio id="egypt-radio" preload="none" controls playsinline style="width:100%"></audio>
      </div>
      <div class="card player-card">
        <div class="player-header">بث الحرم المكي (قناة القرآن)</div>
        <div class="playgate" data-target="makkah-hls">
          <span class="muted">قد يتطلب ضغطة تشغيل على iOS/Android</span>
          <button class="start-play">ابدأ التشغيل</button>
        </div>
        <video id="makkah-hls" controls playsinline webkit-playsinline preload="metadata" muted
               style="width:100%;max-height:54dvh"></video>
        <small class="muted">لو Android: ضيف hls.js في الصفحة.</small>
      </div>`;
    host.appendChild(sec);
  }

  // مواقيت الصلاة
  if (!$('#prayer-grid')){
    const sec=document.createElement('section');
    sec.innerHTML=`
      <h2>🕰 مواقيت الصلاة</h2>
      <div class="controls" style="display:flex;gap:8px;flex-wrap:wrap">
        <button id="locate-btn">تحديد الموقع تلقائيًا</button>
        <input id="city-input" type="text" placeholder="المدينة (مثال: Cairo)">
        <input id="country-input" type="text" placeholder="الدولة (مثال: Egypt)">
        <button id="fetch-by-city">بحث</button>
      </div>
      <div id="prayer-grid" class="prayer-grid" style="margin-top:12px"></div>
      <div class="next-athan card" style="margin-top:12px">
        <h3>الوقت المتبقي للأذان التالي:</h3>
        <div id="countdown">--:--:--</div>
      </div>`;
    host.appendChild(sec);
  }
})();

/* ============ المصحف (نص + ترجمة + تفسير) ============ */
(function quranReader(){
  const section = $('.quran'); if(!section) return;
  const surahSelect = ensureEl('#surah-select', null);
  const content = ensureEl('#quran-content', null);
  const tSel = $('#translation-select'); const tafsiBox = $('#tafsi-box');
  const fontPlus = $('#font-plus'); const fontMinus = $('#font-minus'); const ayahSearch = $('#ayah-search');

  if (!surahSelect || !content) return;
  let fs = parseInt(getComputedStyle(content).fontSize)||22;
  fontPlus && (fontPlus.onclick = ()=>{ fs=Math.min(40,fs+2); content.style.fontSize=fs+'px'; });
  fontMinus && (fontMinus.onclick = ()=>{ fs=Math.max(16,fs-2); content.style.fontSize=fs+'px'; });

  ayahSearch && (ayahSearch.oninput=()=>{
    const q=ayahSearch.value.trim();
    $$('.ayah',content).forEach(el=> el.classList.toggle('active', q && el.textContent.includes(q)));
  });

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
      content.innerHTML='';
      (ar.data?.ayahs||[]).forEach((a,idx)=>{
        const span=document.createElement('span'); span.className='ayah'; span.dataset.idx=idx+1;
        const trPart=trAyat[idx]?`<div class="muted" style="font-size:16px;margin-top:6px">${trAyat[idx]}</div>`:'';
        span.innerHTML=`${a.text} <small>۝${idx+1}</small>${trPart}`;
        span.addEventListener('click',()=>showTafsir(number,idx+1));
        content.appendChild(span);
      });
    }catch{
      content.innerHTML='<div class="muted">تعذر تحميل السورة.</div>';
    }
  }
  async function showTafsir(surah,ayah){
    try{
      const j=await (await fetch(`https://quranapi.pages.dev/api/tafsir/${surah}_${ayah}.json`)).json();
      tafsiBox && tafsiBox.classList.remove('hidden');
      if(tafsiBox){
        tafsiBox.innerHTML=`<h3>📘 تفسير مختصر</h3>
          <details open><summary>ابن كثير</summary><div>${(j?.tafsir?.['Ibn Kathir']||'—')}</div></details>`;
        tafsiBox.scrollIntoView({behavior:'smooth'});
      }
    }catch{}
  }
  surahSelect.addEventListener('change', ()=>render(surahSelect.value));
  tSel && tSel.addEventListener('change', ()=>render(surahSelect.value));
})();

/* ============ الأذكار (تبويبات + أدوات) ============ */
(function azkar(){
  const azSec = $('.azkar'); if(!azSec) return;
  const base = (window.APP_DATA && window.APP_DATA.azkar) || { morning: [], evening: [], sleep: [], prayer: [], wudu: [] };
  const tabs = $$('.tab', azSec); const list = $('#azkar-list');

  function render(cat){
    const data = base[cat] || [];
    if(!list) return;
    list.innerHTML='';
    if(!data.length){ list.innerHTML='<div class="muted">لا توجد بيانات بعد لهذا القسم.</div>'; return; }
    data.forEach(z=>{
      const div=document.createElement('div'); div.className='zekr';
      const suggested=z.repeat?`<small class="muted">تكرار مقترح: ${z.repeat}×</small>`:''; const note=z.note?`<div class="muted" style="margin-top:6px">${z.note}</div>`:'';
      div.innerHTML=`
        <div style="white-space:pre-wrap">${z.text}</div>
        ${note}
        <div class="zekr-tools" style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">
          <button class="copy">نسخ</button>
          <button class="share">مشاركة</button>
          <div class="counter">
            <button class="dec">-</button>
            <input type="number" value="${z.repeat||1}" min="1" />
            <button class="inc">+</button>
          </div>
          <button class="fav">⭐</button>
          ${suggested}
        </div>`;
      list.appendChild(div);
      const input=div.querySelector('input');
      $('.inc',div).onclick=()=> input.value=Number(input.value)+1;
      $('.dec',div).onclick=()=> input.value=Math.max(1, Number(input.value)-1);
      $('.copy',div).onclick=()=> navigator.clipboard.writeText(z.text);
      $('.share',div).onclick=async()=>{ if(navigator.share){try{await navigator.share({text:z.text});}catch{}} else alert('المشاركة غير مدعومة'); };
      $('.fav',div).onclick=()=>{ const fav=JSON.parse(localStorage.getItem('favorites')||'{"zekr":[]}'); fav.zekr=fav.zekr||[]; if(!fav.zekr.includes(z.text)) fav.zekr.push(z.text); localStorage.setItem('favorites',JSON.stringify(fav)); alert('تمت إضافة الذكر للمفضلة'); };
    });
  }
  tabs.forEach(b=> b.onclick=()=>{ tabs.forEach(x=>x.classList.remove('active')); b.classList.add('active'); render(b.dataset.tab); });
  render('morning');
})();

/* ============ مواقيت الصلاة + عدّاد الأذان ============ */
(function prayers(){
  const grid=$('#prayer-grid'); if(!grid) return;
  const countdownEl=$('#countdown'); const locateBtn=$('#locate-btn');
  const cityInput=$('#city-input'); const countryInput=$('#country-input'); const fetchByCity=$('#fetch-by-city');

  async function renderTimings(data){
    grid.innerHTML=''; const names=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    names.forEach(n=>{ const div=document.createElement('div'); div.className='prayer-card card'; div.innerHTML=`<div style="font-weight:700">${n}</div><div style="font-size:24px;margin-top:6px">${data.timings[n]}</div>`; grid.appendChild(div); });
    function parseHHMM(s){ const [h,m]=s.split(':').map(x=>parseInt(x,10)); const now=new Date(); const d=new Date(now); d.setHours(h,m,0,0); if(d<now) d.setDate(d.getDate()+1); return d; }
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

/* ============ البث المباشر + التلاوات (تشغيل داخلي) ============ */
(function mediaPlayers(){
  // إذاعة القرآن المصرية (مع بدائل)
  const egyptAudio=$('#egypt-radio');
  if(egyptAudio){
    const streams=['https://stream.zeno.fm/tv0x28xvyc9uv','https://stream.zeno.fm/rwq8bkh4n18uv'];
    let i=0; async function tryPlay(){ egyptAudio.src=streams[i]; try{ await egyptAudio.play(); }catch{ i=(i+1)%streams.length; if(i!==0) tryPlay(); } }
    egyptAudio.addEventListener('error',()=>{ i=(i+1)%streams.length; });
    if(!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){ tryPlay(); } // ديسكتوب فقط
  }

  // بث الحرم HLS
  const makkahVideo=$('#makkah-hls');
  if(makkahVideo){
    const hlsSrc='https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/saudi_quran/hls1/saudi_quran.m3u8';
    if (makkahVideo.canPlayType('application/vnd.apple.mpegurl')) { // Safari
      makkahVideo.src = hlsSrc;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls=new Hls({maxBufferLength:20, enableWorker:true, liveDurationInfinity:true});
      hls.loadSource(hlsSrc); hls.attachMedia(makkahVideo);
    }
  }

  // التلاوات
  const audioSelect=$('#surah-audio-select'), reciterSelect=$('#reciter-select'), bitrateSelect=$('#bitrate-select'), player=$('#surah-player');
  async function loadSurahs(){ if(!audioSelect) return; try{ const j=await (await fetch('https://api.alquran.cloud/v1/surah')).json(); audioSelect.innerHTML=''; (j.data||[]).forEach(s=>{ const o=document.createElement('option'); o.value=s.number; o.textContent=`${s.number} - ${s.name} / ${s.englishName}`; audioSelect.appendChild(o); }); }catch{ audioSelect.innerHTML=Array.from({length:114},(_,k)=>`<option value="${k+1}">${k+1}</option>`).join(''); } }
  function setAudio(){ if(!player||!audioSelect||!reciterSelect||!bitrateSelect) return; const surah=audioSelect.value||'1'; const edition=reciterSelect.value||'ar.mahermuaiqly'; const br=bitrateSelect.value||'128'; const url=`https://cdn.islamic.network/quran/audio-surah/${br}/${edition}/${surah}.mp3`; player.src=url; if(!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){ player.play().catch(()=>{}); } localStorage.setItem('last_reciter',edition); localStorage.setItem('last_bitrate',br); }
  if(audioSelect){ loadSurahs().then(()=>{ const r=localStorage.getItem('last_reciter'); const b=localStorage.getItem('last_bitrate'); if(r) reciterSelect.value=r; if(b) bitrateSelect.value=b; setAudio(); }); [audioSelect,reciterSelect,bitrateSelect].forEach(el=> el&&el.addEventListener('change', setAudio)); }
})();

/* ============ التسبيح الذكي ============ */
(function smartTasbeeh(){
  const sec=$('#tasbeeh'); if(!sec) return;
  let count=Number(localStorage.getItem('tasbeeh_count')||0);
  let goal=Number(localStorage.getItem('tasbeeh_goal')||33);
  function render(){
    sec.innerHTML=`
      <div class="card">
        <h3>📿 التسبيح الذكي</h3>
        <p>العدد الحالي: <strong>${count}</strong></p>
        <p>الهدف: <input id="goal" type="number" value="${goal}" style="width:80px"></p>
        <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap">
          <button id="btn-subhan">سبحان الله</button>
          <button id="btn-hamd">الحمد لله</button>
          <button id="btn-akbar">الله أكبر</button>
          <button id="btn-reset">🔄 تصفير</button>
        </div>
      </div>`;
    $('#goal',sec).onchange=e=>{ goal=Number(e.target.value)||0; localStorage.setItem('tasbeeh_goal',goal); };
    $('#btn-subhan',sec).onclick=inc; $('#btn-hamd',sec).onclick=inc; $('#btn-akbar',sec).onclick=inc;
    $('#btn-reset',sec).onclick=()=>{ count=0; save(); render(); };
  }
  function inc(){ count++; save(); render(); if(count>=goal){ if('Notification'in window && Notification.permission==='granted'){ new Notification('🎉 وصلت لهدفك من التسبيح'); } alert('ما شاء الله ✨ وصلت للهدف!'); } }
  function save(){ localStorage.setItem('tasbeeh_count',count); localStorage.setItem('tasbeeh_goal',goal); }
  if('Notification'in window && Notification.permission==='default'){ Notification.requestPermission(); }
  render();
})();

/* ============ ختمة القرآن (خطة + نسبة تقدّم) ============ */
(function khatma(){
  const section=$('.quran'); if(!section) return;
  let box=$('#khatma-box');
  if(!box){
    box=document.createElement('div'); box.id='khatma-box'; box.className='card';
    box.innerHTML=`<h3>🧭 خطة ختمة</h3>
      <div>الخطة:
        <select id="plan"><option value="30">شهر</option><option value="90">3 شهور</option><option value="29">رمضان</option></select>
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
  const verseEl=ensureEl('#verse-day', null);
  const tafsirEl=ensureEl('#tafsir-day', null);
  const zekrEl=ensureEl('#zekr-day', null);
  if (!verseEl && !zekrEl) return;
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
  const cacheKey='mosque_daily'; const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');
  function fill(d){ if(verseEl) verseEl.textContent=d.verse||'—'; if(tafsirEl) tafsirEl.textContent=d.tafsir?(d.tafsir.length>500?d.tafsir.slice(0,500)+'…':d.tafsir):'—'; if(zekrEl) zekrEl.textContent=d.zekr||'—'; }
  if(cached && cached.date===today){ fill(cached); return; }
  (async ()=>{
    let verseText='', tafsirTxt='';
    try{
      const j=await (await fetch('https://api.alquran.cloud/v1/ayah/random')).json();
      verseText=j?.data?.text||''; const sid=j?.data?.surah?.number, aid=j?.data?.numberInSurah;
      if(sid && aid){ try{ const tj=await (await fetch(`https://quranapi.pages.dev/api/tafsir/${sid}_${aid}.json`)).json(); tafsirTxt=tj?.tafsir?.['Ibn Kathir']||''; }catch{} }
    }catch{ verseText='﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً...﴾'; tafsirTxt='دعاء جامع.'; }
    const zekr=ZEKR_LIST[new Date().getDay()%ZEKR_LIST.length];
    const data={date:today, verse:verseText, tafsir:tafsirTxt, zekr}; localStorage.setItem(cacheKey, JSON.stringify(data)); fill(data);
  })();
})();

/* ============ بوابة تشغيل للموبايل (حل قيود التشغيل) ============ */
(function mobilePlayback(){
  const gates=$$('.playgate .start-play'); const pending=new Set();
  function unlockAudioContext(){
    const ctx=window._audCtx||new (window.AudioContext||window.webkitAudioContext)(); window._audCtx=ctx;
    if(ctx.state==='suspended') ctx.resume().catch(()=>{});
    try{ const o=ctx.createOscillator(); const g=ctx.createGain(); g.gain.value=0; o.connect(g); g.connect(ctx.destination); o.start(0); o.stop(ctx.currentTime+0.05); }catch{}
  }
  async function startTarget(id){
    const el=document.getElementById(id); if(!el) return;
    unlockAudioContext();
    try{
      if(el.tagName==='VIDEO'){ el.muted=true; await el.play(); setTimeout(()=>{ el.muted=false; }, 400); }
      else if(el.tagName==='AUDIO'){ await el.play(); }
    }catch{ pending.add(el); }
  }
  gates.forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const wrap=btn.closest('.playgate'); const target=wrap?.getAttribute('data-target');
      if(target) await startTarget(target); wrap.style.display='none';
    }, {passive:true});
  });
  const once=()=>{ unlockAudioContext(); pending.forEach(async el=>{ try{ await el.play(); pending.delete(el);}catch{} }); window.removeEventListener('touchstart',once,{passive:true}); window.removeEventListener('click',once,{passive:true}); };
  window.addEventListener('touchstart',once,{passive:true}); window.addEventListener('click',once,{passive:true});
})();
