/* ================== الوضع الليلي / النهاري ================== */
const themeBtn = document.getElementById("toggle-theme");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

/* ================== التاريخ والوقت ================== */
function updateDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const time = now.toLocaleTimeString("ar-EG");
  const el = document.getElementById("datetime");
  if (el) el.textContent = date + " - " + time;
}
setInterval(updateDateTime, 1000);
updateDateTime();

/* ================== إدارة المفضلة ================== */
function addToFavorites(type, value) {
  let fav = JSON.parse(localStorage.getItem("favorites") || "{}");
  if (!fav[type]) fav[type] = [];
  if (!fav[type].includes(value)) fav[type].push(value);
  localStorage.setItem("favorites", JSON.stringify(fav));
}
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "{}");
}

/* ================== إشعارات الأذكار / الصلاة ================== */
function requestNotificationPermission() {
  if ("Notification" in window) Notification.requestPermission();
}
function sendNotification(msg) {
  if ("Notification" in window && Notification.permission === "granted") new Notification(msg);
}
setTimeout(() => { sendNotification("🌅 لا تنس أذكار الصباح"); }, 30000);

/* ================== التسبيح الذكي ================== */
(function tasbeeh(){
  const sec = document.getElementById("tasbeeh");
  if (!sec) return;
  let count = Number(localStorage.getItem("tasbeeh_count")||0);
  let goal = Number(localStorage.getItem("tasbeeh_goal")||33);
  function render(){
    sec.innerHTML = `
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
    sec.querySelector("#goal").onchange = e=>{
      goal = Number(e.target.value)||0;
      localStorage.setItem("tasbeeh_goal", goal);
    };
    sec.querySelector("#btn-subhan").onclick = ()=>inc();
    sec.querySelector("#btn-hamd").onclick = ()=>inc();
    sec.querySelector("#btn-akbar").onclick = ()=>inc();
    sec.querySelector("#btn-reset").onclick = ()=>{count=0;save();render();};
  }
  function inc(){
    count++; save(); render();
    if(count>=goal) sendNotification("🎉 وصلت لهدفك اليومي من التسبيح!");
  }
  function save(){
    localStorage.setItem("tasbeeh_count", count);
    localStorage.setItem("tasbeeh_goal", goal);
  }
  render();
})();

/* ================== ختمة القرآن ================== */
(function khatma(){
  const sec = document.getElementById("khatma");
  if (!sec) return;
  let prog = JSON.parse(localStorage.getItem("khatma")||'{"done":0,"plan":30}');
  function render(){
    sec.innerHTML = `
      <div class="card">
        <h3>📊 ختمة القرآن</h3>
        <p>تم قراءة <strong>${prog.done}</strong> من <strong>30</strong> جزء.</p>
        <label>الخطة:
          <select id="plan">
            <option value="30" ${prog.plan==30?'selected':''}>شهر (جزء يوميًا)</option>
            <option value="90" ${prog.plan==90?'selected':''}>3 شهور</option>
            <option value="29" ${prog.plan==29?'selected':''}>رمضان</option>
          </select>
        </label>
        <div style="margin-top:8px">
          <button id="inc-part">✅ أنهيت جزء</button>
          <button id="reset-khatma">🔄 تصفير</button>
        </div>
        <progress max="30" value="${prog.done}" style="width:100%;margin-top:8px"></progress>
      </div>`;
    sec.querySelector("#plan").onchange = e=>{
      prog.plan = Number(e.target.value); save();
    };
    sec.querySelector("#inc-part").onclick = ()=>{prog.done++;save();render();};
    sec.querySelector("#reset-khatma").onclick = ()=>{prog.done=0;save();render();};
  }
  function save(){ localStorage.setItem("khatma", JSON.stringify(prog)); }
  render();
})();

/* ================== وضع المسجد: آية اليوم + ذكر اليوم ================== */
(function mosqueDaily(){
  const verseEl  = document.getElementById('verse-day');
  const tafsirEl = document.getElementById('tafsir-day');
  const zekrEl   = document.getElementById('zekr-day');
  if (!verseEl || !zekrEl) return;
  const today = new Date().toISOString().slice(0,10);
  const cacheKey = 'mosque_daily';
  const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
  function fill(data){
    verseEl.textContent = data.verse || '—';
    if (tafsirEl) tafsirEl.textContent = data.tafsir ? (data.tafsir.slice(0,200)+'…') : '—';
    zekrEl.textContent = data.zekr || '—';
  }
  if (cached && cached.date === today) { fill(cached); return; }
  const ZEKR_LIST = [
    'سبحان الله وبحمده',
    'لا إله إلا الله وحده لا شريك له',
    'أستغفر الله العظيم وأتوب إليه',
    'اللهم صلِّ وسلم على نبينا محمد',
    'حسبي الله لا إله إلا هو عليه توكلت',
  ];
  (async ()=>{
    let verseText=''; let tafsirTxt='';
    try{
      const r = await fetch('https://api.alquran.cloud/v1/ayah/random');
      const j = await r.json();
      verseText = j?.data?.text||'';
      const sid=j?.data?.surah?.number, aid=j?.data?.numberInSurah;
      if(sid&&aid){
        try{
          const tr=await fetch(`https://quranapi.pages.dev/api/tafsir/${sid}_${aid}.json`);
          const tj=await tr.json(); tafsirTxt = tj?.tafsir?.['Ibn Kathir']||'';
        }catch{}
      }
    }catch{
      verseText='﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً…﴾'; tafsirTxt='دعاء جامع لخيري الدنيا والآخرة';
    }
    const zekr = ZEKR_LIST[new Date().getDay()%ZEKR_LIST.length];
    const data={date:today,verse:verseText,tafsir:tafsirTxt,zekr};
    localStorage.setItem(cacheKey, JSON.stringify(data));
    fill(data);
  })();
})();

/* ================== الأذكار ================== */
(function azkar(){
  let azSec = document.querySelector('.azkar');
  if (!azSec) return;
  const base = (window.APP_DATA && window.APP_DATA.azkar) || { morning: [], evening: [], sleep: [], prayer: [], wudu: [] };
  const tabs = azSec.querySelectorAll('.tab');
  const list = document.getElementById('azkar-list');
  function render(cat){
    const data = base[cat] || [];
    list.innerHTML = '';
    if (!data.length) { list.innerHTML = `<div class="muted">لا توجد بيانات بعد لهذا القسم.</div>`; return; }
    data.forEach(z=>{
      const div = document.createElement('div');
      div.className='zekr';
      const suggested = z.repeat ? `<small class="muted">تكرار مقترح: ${z.repeat}×</small>` : '';
      const note = z.note ? `<div class="muted" style="margin-top:6px">${z.note}</div>` : '';
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
      div.querySelector('.inc').onclick=()=> input.value=Number(input.value)+1;
      div.querySelector('.dec').onclick=()=> input.value=Math.max(1, Number(input.value)-1);
      div.querySelector('.copy').onclick=()=> navigator.clipboard.writeText(z.text);
      div.querySelector('.share').onclick=async()=>{ if(navigator.share){try{await navigator.share({text:z.text});}catch{}} else alert('المشاركة غير مدعومة'); };
      div.querySelector('.fav').onclick=()=>{ const fav=JSON.parse(localStorage.getItem('favorites')||'{"zekr":[]}'); fav.zekr=fav.zekr||[]; if(!fav.zekr.includes(z.text)) fav.zekr.push(z.text); localStorage.setItem('favorites', JSON.stringify(fav)); alert('تمت إضافة الذكر للمفضلة'); };
    });
  }
  tabs.forEach(b=> b.onclick=()=>{ tabs.forEach(x=>x.classList.remove('active')); b.classList.add('active'); render(b.dataset.tab); });
  render('morning');
})();

/* ================== البث المباشر ================== */
(function fixEgyptStream(){
  const el = document.getElementById('egypt-radio');
  if(!el) return;
  const streams=['https://stream.zeno.fm/tv0x28xvyc9uv','https://stream.zeno.fm/rwq8bkh4n18uv'];
  let i=0;
  async function tryPlay(){ el.src=streams[i]; try{await el.play();}catch(_){ i=(i+1)%streams.length; if(i!==0) tryPlay(); } }
  el.addEventListener('error',()=>{i=(i+1)%streams.length;});
  if(!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){ tryPlay(); }
})();
(function fixHLS(){
  const video=document.getElementById('makkah-hls');
  if(!video) return;
  const hlsSrc='https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/saudi_quran/hls1/saudi_quran.m3u8';
  if(video.canPlayType('application/vnd.apple.mpegurl')){ video.src=hlsSrc; }
  else if(window.Hls && window.Hls.isSupported()){ const hls=new Hls({maxBufferLength:20,enableWorker:true,liveDurationInfinity:true}); hls.loadSource(hlsSrc); hls.attachMedia(video); }
})();

/* ================== التلاوات ================== */
(function recitationsUX(){
  const player=document.getElementById('surah-player');
  const audioSelect=document.getElementById('surah-audio-select');
  const reciterSelect=document.getElementById('reciter-select');
  const bitrateSelect=document.getElementById('bitrate-select');
  if(!player||!audioSelect||!reciterSelect||!bitrateSelect) return;
  function setSrc(){
    const surah=audioSelect.value||'1';
    const edition=reciterSelect.value||'ar.mahermuaiqly';
    const br=bitrateSelect.value||'128';
    player.src=`https://cdn.islamic.network/quran/audio-surah/${br}/${edition}/${surah}.mp3`;
  }
  [audioSelect,reciterSelect,bitrateSelect].forEach(el=> el.addEventListener('change',()=>{setSrc(); if(!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){player.play().catch(()=>{});} }));
  setSrc();
  if('mediaSession' in navigator){ navigator.mediaSession.metadata=new MediaMetadata({title:'تلاوة القرآن',artist:'Quran Recitation'}); }
})();

/* ================== Mobile Playback Helper ================== */
(function mobilePlayback(){
  const gates=document.querySelectorAll('.playgate .start-play');
  const pending=new Set();
  function unlockAudioContext(){
    const ctx=window._audCtx||new (window.AudioContext||window.webkitAudioContext)();
    window._audCtx=ctx;
    if(ctx.state==='suspended') ctx.resume().catch(()=>{});
    try{ const o=ctx.createOscillator();const g=ctx.createGain();g.gain.value=0;o.connect(g);g.connect(ctx.destination);o.start(0);o.stop(ctx.currentTime+0.05);}catch{}
  }
  async function startTarget(id){
    const el=document.getElementById(id); if(!el) return;
    unlockAudioContext();
    try{ if(el.tagName==='VIDEO'){ el.muted=true; await el.play(); setTimeout(()=>{el.muted=false;},400);} else if(el.tagName==='AUDIO'){ await el.play(); } }catch(e){ pending.add(el); }
  }
  gates.forEach(btn=>{ btn.addEventListener('click',async()=>{ const wrap=btn.closest('.playgate'); const target=wrap?.getAttribute('data-target'); if(target) await startTarget(target); wrap.style.display='none'; },{passive:true}); });
  const once=()=>{ unlockAudioContext(); pending.forEach(async el=>{try{await el.play();pending.delete(el);}catch{}}); window.removeEventListener('touchstart',once,{passive:true}); window.removeEventListener('click',once,{passive:true}); };
  window.addEventListener('touchstart',once,{passive:true}); window.addEventListener('click',once,{passive:true});
})();
