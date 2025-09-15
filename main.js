// ================== الوضع الليلي / النهاري ==================
const themeBtn = document.getElementById("toggle-theme");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}

// استعادة الوضع عند التحميل
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// ================== التاريخ والوقت ==================
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

// ================== إدارة المفضلة ==================
function addToFavorites(type, value) {
  let fav = JSON.parse(localStorage.getItem("favorites") || "{}");
  if (!fav[type]) fav[type] = [];
  if (!fav[type].includes(value)) {
    fav[type].push(value);
  }
  localStorage.setItem("favorites", JSON.stringify(fav));
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "{}");
}

// ================== إشعارات الأذكار / الصلاة ==================
function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}

function sendNotification(msg) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(msg);
  }
}

// مثال تذكير بعد 30 ثانية
setTimeout(() => {
  sendNotification("🌅 لا تنس أذكار الصباح");
}, 30000);

// ================== البث المباشر والتلاوات ==================
(function(){
  // --- إذاعة القرآن المصرية (Zeno) ---
  const egyptAudio = document.getElementById('egypt-radio');
  if (egyptAudio){
    const streams = [
      'https://stream.zeno.fm/tv0x28xvyc9uv', // Egypt Quran Radio
      'https://stream.zeno.fm/rwq8bkh4n18uv'  // احتياطي
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

  // --- بث الحرم المكي (HLS) ---
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

  // --- التلاوات الداخلية (Islamic Network CDN) ---
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
