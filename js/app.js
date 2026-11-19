// Runs on the public site — loads blog, news + videos into the compact "Media" section

// YouTube videos are added from the admin panel (admin.html → YouTube Videos).
// The "Videos" tab stays hidden until at least one video exists.

document.addEventListener('DOMContentLoaded', () => {
  setupMediaTabs();
  loadPublicBlogs();
  loadPublicNews();
  loadVideos();
});

// ===== TABS + ARROWS =====
function setupMediaTabs() {
  const tabs   = document.querySelectorAll('.media-tab');
  const prev   = document.querySelector('.rail-arrow.prev');
  const next   = document.querySelector('.rail-arrow.next');
  if (!tabs.length) return;

  const head  = document.querySelector('.media-head');
  const label = document.getElementById('mediaLabel');
  const title = document.getElementById('mediaTitle');
  const desc  = document.getElementById('mediaDesc');

  tabs.forEach(tab => tab.addEventListener('click', () => {
    if (tab.classList.contains('active')) return;
    tabs.forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab);
    });
    document.querySelectorAll('.media-panel').forEach(p =>
      p.classList.toggle('active', p.id === 'panel-' + tab.dataset.panel));

    // swap the heading with a quick fade
    head.classList.add('switching');
    setTimeout(() => {
      label.textContent = tab.dataset.label;
      title.textContent = tab.dataset.title;
      desc.textContent  = tab.dataset.desc;
      head.classList.remove('switching');
    }, 150);

    const rail = activeRail();
    if (rail) rail.scrollLeft = 0;
    updateArrows();
  }));

  const scrollBy = dir => {
    const rail = activeRail();
    if (rail) rail.scrollBy({ left: dir * rail.clientWidth, behavior: 'smooth' });   // one screen = one card on phones
  };
  prev.addEventListener('click', () => scrollBy(-1));
  next.addEventListener('click', () => scrollBy(1));

  document.querySelectorAll('.media-rail').forEach(r => r.addEventListener('scroll', updateArrows, { passive: true }));
  window.addEventListener('resize', updateArrows);
}

function activeRail() {
  return document.querySelector('.media-panel.active .media-rail');
}

function updateArrows() {
  const rail = activeRail();
  const prev = document.querySelector('.rail-arrow.prev');
  const next = document.querySelector('.rail-arrow.next');
  if (!rail || !prev) return;
  const overflow = rail.scrollWidth > rail.clientWidth + 4;
  prev.hidden = next.hidden = !overflow;
  prev.disabled = rail.scrollLeft <= 4;
  next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
}

function railMessage(rail, html) {
  rail.innerHTML = `<div class="rail-message">${html}</div>`;
  updateArrows();
}

function setCount(kind, n) {
  const el = document.getElementById('count-' + kind);
  if (el) el.textContent = n ? n : '';
}

// ===== BLOG POSTS =====
async function loadPublicBlogs() {
  const rail = document.querySelector('.blog-grid');
  if (!rail) return;
  railMessage(rail, '<i class="fas fa-spinner fa-spin"></i> Loading posts...');

  try {
    let snap;
    try { snap = await db.collection('blogs').orderBy('createdAt', 'desc').get(); }
    catch (e) { snap = await db.collection('blogs').get(); }
    if (snap.empty) return railMessage(rail, '<i class="fas fa-pen-nib"></i> Blog posts coming soon.');

    setCount('blog', snap.size);
    window._blogData = {};
    rail.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      window._blogData[doc.id] = d;
      rail.insertAdjacentHTML('beforeend', `
        <article class="m-card blog-card" onclick="openBlogModal('${doc.id}')">
          <div class="m-card-img">
            ${d.imageUrl
              ? `<img src="${d.imageUrl}" alt="" loading="lazy" />`
              : `<div class="m-card-noimg"><i class="fas fa-pen-nib"></i></div>`}
          </div>
          <div class="m-card-body">
            <h3 class="m-card-title">${d.title}</h3>
            <div class="m-card-foot">
              <span><i class="far fa-calendar"></i> ${d.date || ''}</span>
              <span class="m-card-link">Read <i class="fas fa-arrow-right"></i></span>
            </div>
          </div>
        </article>
      `);
    });
    updateArrows();
  } catch (err) {
    railMessage(rail, 'Could not load blog posts.');
  }
}

// ===== NEWSPAPER CUTTINGS =====
async function loadPublicNews() {
  const rail = document.querySelector('.news-grid');
  if (!rail) return;
  railMessage(rail, '<i class="fas fa-spinner fa-spin"></i> Loading...');

  try {
    let snap;
    try { snap = await db.collection('news').orderBy('createdAt', 'desc').get(); }
    catch (e) { snap = await db.collection('news').get(); }
    if (snap.empty) return railMessage(rail, '<i class="fas fa-newspaper"></i> News coverage coming soon.');

    setCount('news', snap.size);
    rail.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      rail.insertAdjacentHTML('beforeend', `
        <article class="m-card news-card">
          <div class="m-card-img news-img-wrap">
            <img src="${d.imageUrl}" alt="${d.source || 'News cutting'}" loading="lazy" />
            <div class="news-overlay"><i class="fas fa-search-plus"></i></div>
          </div>
          <div class="m-card-body">
            <span class="m-card-meta">${d.source || ''}</span>
            <h3 class="m-card-title">${d.caption || ''}</h3>
            <div class="m-card-foot">
              <span><i class="far fa-calendar"></i> ${d.date || ''}</span>
              <span class="m-card-link">View <i class="fas fa-expand"></i></span>
            </div>
          </div>
        </article>
      `);
    });
    attachLightbox();
    updateArrows();
  } catch (err) {
    railMessage(rail, 'Could not load news cuttings.');
  }
}

function attachLightbox() {
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  document.querySelectorAll('.news-img-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      lightboxImg.src = wrap.querySelector('img').src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
}

// ===== YOUTUBE VIDEOS =====
async function loadVideos() {
  const rail = document.querySelector('.video-grid');
  if (!rail) return;
  railMessage(rail, '<i class="fas fa-spinner fa-spin"></i> Loading videos...');

  let videos = [];
  try {
    let snap;
    try { snap = await db.collection('videos').orderBy('createdAt', 'desc').get(); }
    catch (e) { snap = await db.collection('videos').get(); }
    snap.forEach(doc => videos.push(doc.data()));
  } catch (err) {
    return railMessage(rail, 'Could not load videos.');
  }
  if (!videos.length) return railMessage(rail, '<i class="fab fa-youtube"></i> Videos coming soon.');
  setCount('videos', videos.length);

  rail.innerHTML = videos.map(v => `
    <article class="m-card video-card" data-id="${v.videoId}">
      <div class="m-card-img video-thumb">
        <img src="https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg" alt="" loading="lazy" />
        <span class="video-play"><i class="fas fa-play"></i></span>
      </div>
      <div class="m-card-body">
        <h3 class="m-card-title">${v.title || ''}</h3>
        <div class="m-card-foot">
          <span><i class="fab fa-youtube"></i> YouTube</span>
          <span class="m-card-link">Play <i class="fas fa-play"></i></span>
        </div>
      </div>
    </article>
  `).join('');

  // Load the real player only when clicked (keeps the page fast)
  rail.querySelectorAll('.video-card').forEach(card => {
    card.querySelector('.video-thumb').addEventListener('click', () => {
      card.querySelector('.video-thumb').innerHTML =
        `<iframe src="https://www.youtube-nocookie.com/embed/${card.dataset.id}?autoplay=1&rel=0"
                 title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
  });
}

// ===== BLOG MODAL =====
function openBlogModal(id) {
  const d = window._blogData && window._blogData[id];
  if (!d) return;
  const modal = document.getElementById('blogModal');
  document.getElementById('blogModalTitle').textContent   = d.title;
  document.getElementById('blogModalDate').textContent    = d.date;
  document.getElementById('blogModalContent').innerHTML   = d.content;
  const img = document.getElementById('blogModalImg');
  if (d.imageUrl) {
    img.src = d.imageUrl;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('blogModalClose');
  const modal    = document.getElementById('blogModal');
  if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
  if (modal)    modal.addEventListener('click', e => { if (e.target === modal) closeBlogModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBlogModal(); });
});

function closeBlogModal() {
  document.getElementById('blogModal').classList.remove('open');
  document.body.style.overflow = '';
}
