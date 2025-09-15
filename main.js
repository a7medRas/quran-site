/* ===========================
   Theme (Light/Dark)
=========================== */
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

/* ===========================
   Date & Time (Home)
=========================== */
function updateDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const time = now.toLocaleTimeString("ar-EG");
  const el = document.getElementById("datetime");
  if (el) el.textContent = date + " - " + time;
}
setInterval(updateDateTime, 1000);
updateDateTime();

/* ===========================
   Favorites (LocalStorage)
=========================== */
function addToFavorites(type, value) {
  let fav = JSON.parse(localStorage.getItem("favorites") || "{}");
  if (!fav[type]) fav[type] = [];
  if (!fav[type].includes(value)) fav[type].push(value);
  localStorage.setItem("favorites", JSON.stringify(fav));
}
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "{}");
}

/* ===========================
   Notifications helpers
=========================== */
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, body ? { body } : undefined);
  }
}
requestNotificationPermission();

/* ===========================
   Live: Egypt Radio + Makkah HLS
   - Requires hls.js in live.html
=========================== */
(function(){
  // Egypt Quran Radio (Zeno)
  const egyptAudio = document.getElementById('egypt-radio');
  if (egyptAudio){
    const streams = [
      'https://stream.zeno.fm/tv0x28xvyc9uv', // Egypt Quran Radio
      'https://stream.zeno.fm/rwq8bkh4n18uv'  // fallback
    ];
    let i = 0;
    function tryPlay(){
      egyptAudio.src = streams[i];
      egyptAudio.play().catch(()=>{
        i = (i+1) % streams.length;
        if(i!==0) tryPlay();
      });
    }
    tryPlay();
  }

  // Makkah Quran TV (HLS)
  const makkahVideo = document.getElementById('makkah-hls');
  if (makkahVideo){
    const hlsSrc = 'https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/saudi_quran/hls1/saudi_quran.m3u8';
    if (window.Hls && Hls.isSupported()){
      const hls = new Hls({ maxBufferLength: 30 });
      hls.loadSource(hlsSrc);
      hls.attachMedia(makkahVideo);
    } else if (makkahVideo.canPlayType('application/vnd.apple.mpegurl')) {
      makkahVideo.src = hlsSrc;
    } else {
      const alt = document.createElement('div');
      alt.className='muted';
      alt.textContent='متصفحك لا يدعم HLS مباشرة. جرّب Safari أو Chrome محدث.';
      makkahVideo.after(alt);
    }
  }
})();

/* ===========================
   Recitations (internal player)
   - Select reciter/surah/bitrate
   - Uses Islamic Network CDN
=========================== */
(function(){
  const audioSelect = document.getElementById('surah-audio-select');
  const reciterSelect = document.getElementById('reciter-select');
  const bitrateSelect = document.getElementById('bitrate-select');
  const player = document.getElementById('surah-player');

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
    player.play().catch(()=>{}); // قد يتطلب تفاعل المستخدم
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

/* ===========================
   Smart Tasbeeh (التسبيح الذكي)
   - Per-dhikr counter + daily goal
   - Notification on goal reached
   Elements needed in tasbeeh.html:
   #dhikr-select, #count, #daily-goal, #inc, #reset, (optional) #vibrate
=========================== */
(function(){
  const select = document.getElementById('dhikr-select');
  const countEl = document.getElementById('count');
  const goalEl = document.getElementById('daily-goal');
  const inc = document.getElementById('inc');
  const reset = document.getElementById('reset');
  const vibr = document.getElementById('vibrate');

  if(!select || !countEl) return;

  function key(d){ return 'tsb_'+d; }

  function load(){
    const d = select.value;
    const obj = JSON.parse(localStorage.getItem(key(d))||'{"count":0,"goal":100,"date":""}');
    const today = new Date().toISOString().slice(0,10);
    if(obj.date !== today) obj.count = 0, obj.date = today;
    countEl.textContent = obj.count;
    if (goalEl) goalEl.value = obj.goal || 100;
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
      sendNotification('ما شاء الله ✨', 'تم الوصول للهدف اليومي من التسبيح: ' + d);
      try { navigator.vibrate && navigator.vibrate([100, 50, 100]); } catch {}
      alert('ما شاء الله ✨ وصلت للهدف!');
    }
  }

  select.addEventListener('change', load);
  if (inc) inc.addEventListener('click', ()=>{ countEl.textContent = Number(countEl.textContent) + 1; save(); });
  if (reset) reset.addEventListener('click', ()=>{ countEl.textContent = 0; save(); });
  if (vibr) vibr.addEventListener('click', ()=>{ try{ navigator.vibrate && navigator.vibrate(80); }catch{} });
  if (goalEl) goalEl.addEventListener('change', save);

  // ask permission once here too
  requestNotificationPermission();
  load();
})();

/* ===========================
   Khatma Tracker (ختمة القرآن)
   - Plan select (30/90/رمضان)
   - Parts read input (0..30)
   - Progress bar
   Elements to add in quran.html (مثال):
   <div id="khatma-box" class="card"> ... (or create programmatically below)
=========================== */
(function(){
  // لو الصفحة هي quran.html هنضيف صندوق الختمة تلقائيًا تحت المصحف إن لم يوجد
  const mushafSection = document.querySelector('.quran');
  if (!mushafSection) return;

  let box = document.getElementById('khatma-box');
  if (!box) {
    box = document.createElement('div');
    box.className = 'card';
    box.id = 'khatma-box';
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
    mushafSection.appendChild(box);
  }

  const plan = box.querySelector('#plan');
  const parts = box.querySelector('#parts');
  const bar = box.querySelector('#pg');
  const txt = box.querySelector('#pg-text');

  function load(){
    try{
      const s = JSON.parse(localStorage.getItem('khatma')||'{}');
      if (s.plan) plan.value = s.plan;
      if (s.parts != null) parts.value = s.parts;
    }catch{}
    update();
  }
  function save(){
    localStorage.setItem('khatma', JSON.stringify({
      plan: plan.value,
      parts: Number(parts.value)
    }));
  }
  function update(){
    const pct = Math.min(100, (Number(parts.value) / 30) * 100);
    bar.style.width = pct + '%';
    txt.textContent = pct.toFixed(1) + '%';
    save();
  }

  plan.addEventListener('change', save);
  parts.addEventListener('input', update);
  load();
})();
