// Runs on the public site — loads news + blogs from Firebase

document.addEventListener('DOMContentLoaded', () => {
  loadPublicNews();
  loadPublicBlogs();
});

// ===== NEWSPAPER CUTTINGS =====
async function loadPublicNews() {
  const grid = document.querySelector('.news-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="news-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  try {
    let snap;
    try { snap = await db.collection('news').orderBy('createdAt', 'desc').get(); }
    catch (e) { snap = await db.collection('news').get(); }
    if (snap.empty) {
      grid.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1;padding:40px 0;">No newspaper cuttings yet. Check back soon!</p>';
      return;
    }
    grid.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      grid.insertAdjacentHTML('beforeend', `
        <div class="news-card">
          <div class="news-img-wrap">
            <img src="${d.imageUrl}" alt="${d.source}" loading="lazy" />
            <div class="news-overlay"><i class="fas fa-search-plus"></i></div>
          </div>
          <div class="news-caption">
            <span class="news-source">${d.source}</span>
            <p>${d.caption} — ${d.date}</p>
          </div>
        </div>
      `);
    });
    // Re-attach lightbox listeners
    attachLightbox();
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1;padding:40px 0;">Could not load news cuttings.</p>';
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

// ===== BLOG POSTS =====
async function loadPublicBlogs() {
  const grid = document.querySelector('.blog-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="blog-loading" style="grid-column:1/-1;text-align:center;padding:40px;color:#888;"><i class="fas fa-spinner fa-spin"></i> Loading posts...</div>';

  try {
    let snap;
    try { snap = await db.collection('blogs').orderBy('createdAt', 'desc').get(); }
    catch (e) { snap = await db.collection('blogs').get(); }
    if (snap.empty) {
      grid.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1;padding:40px 0;">No blog posts yet. Check back soon!</p>';
      return;
    }
    grid.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      grid.insertAdjacentHTML('beforeend', `
        <div class="blog-card" onclick="openBlogModal('${doc.id}')">
          <div class="blog-card-img">
            ${d.imageUrl
              ? `<img src="${d.imageUrl}" alt="${d.title}" loading="lazy" />`
              : `<div class="blog-no-img"><i class="fas fa-pen-nib"></i></div>`
            }
          </div>
          <div class="blog-card-body">
            <span class="blog-date">${d.date}</span>
            <h3 class="blog-title">${d.title}</h3>
            <p class="blog-excerpt">${d.excerpt}</p>
            <span class="blog-readmore">Read More <i class="fas fa-arrow-right"></i></span>
          </div>
        </div>
      `);
    });
    // Store data for modal use
    window._blogData = {};
    snap.forEach(doc => { window._blogData[doc.id] = doc.data(); });
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1;padding:40px 0;">Could not load blog posts.</p>';
  }
}

// ===== BLOG MODAL =====
function openBlogModal(id) {
  const d = window._blogData && window._blogData[id];
  if (!d) return;
  const modal = document.getElementById('blogModal');
  document.getElementById('blogModalTitle').textContent   = d.title;
  document.getElementById('blogModalDate').textContent    = d.date;
  document.getElementById('blogModalContent').innerHTML   = d.content;
  if (d.imageUrl) {
    const img = document.getElementById('blogModalImg');
    img.src = d.imageUrl;
    img.style.display = 'block';
  } else {
    document.getElementById('blogModalImg').style.display = 'none';
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
