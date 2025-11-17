/* ================= CONFIG ================= */
const OMDB_KEY = 'dea27012';
const API_ROOT = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&`;
/* ============= SLIDESHOW IMAGES ============= */
const slideshowImages = [
  'https://i.vimeocdn.com/video/696682957-a405a56e2669d5d32e313b1b3244d6e3f465d19c1a66d24719fd005387330e52-d?f=webp',
  'https://images.wallpapersden.com/image/download/oppenheimer-2023-movie-poster_bmVpamqUmZqaraWkpJRmbmdlrWZlbWU.jpg',
  'https://staticg.sportskeeda.com/editor/2025/09/aac73-17588134439967-1920.jpg?w=640',
  'https://i.pinimg.com/736x/0f/fa/10/0ffa1054b284e74579406e357cc610c9.jpg',
  'https://bsmedia.business-standard.com/_media/bs/img/article/2024-05/02/full/1714640016-6552.jpg',
  'https://img.etimg.com/thumb/width-1600,height-900,imgsize-82852,resizemode-75,msid-122804611/magazines/panache/saiyaara-shatters-records-with-rs-83-crore-in-its-opening-weekend-ahaan-panday-and-aneet-padda-make-history.jpg'
];
function createSlidesFromArray(){
  const container = document.getElementById('heroSlidesContainer');
  if(!container) return;
  if(container.querySelectorAll('.hero-slide').length > 0) return;
  slideshowImages.forEach((url,i) => {
    const d = document.createElement('div');
    d.className = 'hero-slide';
    d.style.backgroundImage = `url('${url}')`;
    d.style.opacity = i===0 ? '1' : '0';
    d.setAttribute('aria-hidden', i===0 ? 'false' : 'true');
    container.appendChild(d);
  });
}
let slideTimer = null;
let currentSlideIndex = 0;
function startSlideshow(){
  const slides = document.querySelectorAll('.hero-slide');
  if(slides.length === 0) return;
  if(slideTimer) clearInterval(slideTimer);
  slideTimer = setInterval(() => {
    slides[currentSlideIndex].style.opacity = '0';
    slides[currentSlideIndex].setAttribute('aria-hidden', 'true');
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    slides[currentSlideIndex].style.opacity = '1';
    slides[currentSlideIndex].setAttribute('aria-hidden', 'false');
  }, 6500);
}
/* ============= OMDb rows & search ============= */
const rows = {
  bollywood: ['Panchayat','Dangal','Jawan','Pathaan','Special 26','Aavesham','Kick','Saiyaara'],
  regional:['Pather Panchali','The World of Apu','Dasham Avatar','Chotushkone','Vinci Da','Rahasya','Feluda Pherot'],
  hollywood: ['Oppenheimer','Inception','Interstellar','Hereditary','The Conjuring: Last Rites','Joker','Avengers','Dune','Matrix','Zodiac'],
  action: ['War','Baby','Extraction','Mad Max','John Wick: Chapter 4',],
  scifi: ['Avatar','The Martian','Gravity','Tenet','Edge of Tomorrow','Oblivion'],
  drama: ['Squid Game','Alice in Borderland','All of Us Are Dead','When the Stars Gossip','Queen of Tears','Business Proposal','Chimera']
};
async function safeFetchJson(url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  }catch(e){
    console.warn('fetch failed', url, e);
    return null;
  }
}
async function loadRowMovies(){
  for(const key of Object.keys(rows)){
    const wrap = document.getElementById('row-' + key);
    if(!wrap) continue;
    wrap.innerHTML = '';
    for(const title of rows[key]){
      try{
        const data = await safeFetchJson(API_ROOT + 't=' + encodeURIComponent(title));
        const poster = (data && data.Poster && data.Poster !== 'N/A') ? data.Poster : 'https://placehold.co/300x450?text=No+Image';
        const name = (data && data.Title) ? data.Title : title;
        const imdbUrl = (data && data.imdbID) ? `https://www.imdb.com/title/${data.imdbID}/` : '#';
        const card = document.createElement('div');
        card.className = 'flex-shrink-0';
        card.style.width = '160px';
        card.innerHTML = `
          <a href="${imdbUrl}" target="_blank" rel="noopener noreferrer" title="${name} on IMDb">
            <img src="${poster}" alt="${name}" class="poster" onerror="this.src='https://placehold.co/300x450?text=No+Image'"/>
          </a>
          <p style="margin-top:8px;font-size:0.9rem;text-align:center">${name}</p>
        `;
        wrap.appendChild(card);
      }catch(e){
        console.warn('row fetch failed', e);
      }
    }
  }
}
/* ---------- Search ---------- */
function getSearchBox(){ return document.getElementById('searchBox'); }
function getResultsSection(){ return document.getElementById('resultsSection'); }
function getHomeSection(){ return document.getElementById('homeSection'); }
async function searchMovies(){
  const sb = getSearchBox();
  const q = sb && sb.value ? sb.value.trim() : '';
  if(!q){ location.reload(); return; }
  if(getHomeSection()) getHomeSection().classList.add('hidden');
  if(getResultsSection()) getResultsSection().classList.remove('hidden');
  const data = await safeFetchJson(API_ROOT + 's=' + encodeURIComponent(q));
  const grid = document.getElementById('resultsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!data || data.Response === 'False' || !data.Search){
    grid.innerHTML = `<p style="color:#bbb">No results found.</p>`;
    return;
  }
  for(const movie of data.Search){
    const poster = (movie && movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : 'https://placehold.co/300x450?text=No+Image';
    const imdbUrl = movie && movie.imdbID ? `https://www.imdb.com/title/${movie.imdbID}/` : '#';
    const col = document.createElement('div');
    col.innerHTML = `
      <a href="${imdbUrl}" target="_blank" rel="noopener noreferrer" title="${movie.Title} on IMDb">
        <img src="${poster}" alt="${movie.Title}" style="width:100%;border-radius:8px" onerror="this.src='https://placehold.co/300x450?text=No+Image'"/>
      </a>
      <p style="margin-top:8px;text-align:center">${movie.Title}</p>
    `;
    grid.appendChild(col);
  }
}
/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
  try{
    // Create + run slideshow
    createSlidesFromArray();
    startSlideshow();
    // Load rows
    loadRowMovies().catch(e => console.warn('loadRowMovies error', e));
    // Search handlers
    const sb = getSearchBox();
    const btn = document.getElementById('searchBtn');
    if(sb) sb.addEventListener('keydown', e => { if(e.key === 'Enter') searchMovies(); });
    if(btn) btn.addEventListener('click', searchMovies);
    //hero intro letters
    try{
      const title = document.getElementById('heroTitle');
      if(title && typeof gsap !== 'undefined'){
        const txt = title.textContent.trim();
        title.innerHTML = '';
        Array.from(txt).forEach(ch => {
          const sp = document.createElement('span');
          sp.className = 'hero-char';
          sp.textContent = ch === ' ' ? '\u00A0' : ch;
          title.appendChild(sp);
        });
        const chars = document.querySelectorAll('.hero-char');
        const tl = gsap.timeline();
        tl.from(chars, {opacity:0, y:40, rotateX:-90, stagger:0.03, duration:0.9, ease:'back.out(1.7)'})
          .from('#heroSubtitle', {opacity:0, y:20, duration:0.8, ease:'power3.out'}, '-=0.3')
          .from('#heroButtons', {opacity:0, scale:0.9, duration:0.6, ease:'back.out(1.5)'}, '-=0.4');
      } else {
        const h = document.getElementById('heroTitle'); if(h) h.style.opacity = '1';
      }
    }catch(e){ console.warn('hero animation error', e); }
    //footer fade-in triggers
    const footerFade = document.querySelector('.fade-in');
    if(footerFade) footerFade.classList.add('fade-in');
    // Mobile hero sizing helper
    (function mobileHeroHelper(){
      function setHeroHeight(){
        const hero = document.getElementById('heroArea');
        if(!hero) return;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const minH = window.innerWidth <= 640 ? Math.round(vh * 0.60) : Math.round(vh * 0.70);
        hero.style.minHeight = minH + 'px';
        const slides = document.querySelectorAll('.hero-slide');
        slides.forEach(s => { s.style.height = hero.clientHeight + 'px'; });
      }
      setTimeout(setHeroHeight, 120);
      window.addEventListener('resize', setHeroHeight, { passive: true });
    })();

    console.log('CineNext initialized');
  }catch(err){
    console.error('Initialization error', err);
  }
});
/* ============ PRELOADER ============ */
window.addEventListener('load', () => {
  const MINIMUM_DELAY = 5000; 
  setTimeout(() => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
      preloader.classList.add('hidden');
    }
  }, MINIMUM_DELAY);
});
