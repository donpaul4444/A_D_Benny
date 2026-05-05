// ===== CLOUDINARY CONFIG =====
const CLOUDINARY_CLOUD  = 'dauhwsvxp';
const CLOUDINARY_PRESET = 'AD BEnny Photos';

// ===== AUTH =====
const provider = new firebase.auth.GoogleAuthProvider();

auth.onAuthStateChanged(user => {
  if (user && user.email === ADMIN_EMAIL) {
    showDashboard(user);
  } else if (user) {
    auth.signOut();
    showToast('Access denied. Not an authorised admin.', 'error');
  } else {
    showLogin();
  }
});

document.getElementById('googleLoginBtn').addEventListener('click', () => {
  auth.signInWithPopup(provider).catch(err => showToast(err.message, 'error'));
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  auth.signOut().then(() => showToast('Logged out successfully.', 'success'));
});

function showLogin() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('adminDashboard').classList.add('hidden');
}

function showDashboard(user) {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminDashboard').classList.remove('hidden');
  document.getElementById('adminName').textContent = user.displayName || user.email;
  document.getElementById('adminAvatar').src = user.photoURL || '';
  loadNews();
  loadBlogs();
}

// ===== TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => {
      t.classList.remove('active');
      t.classList.remove('hidden');
    });
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ===== IMAGE UPLOAD HELPERS =====
function setupUploadArea(areaId, inputId, placeholderId, previewId) {
  const area     = document.getElementById(areaId);
  const input    = document.getElementById(inputId);
  const holder   = document.getElementById(placeholderId);
  const preview  = document.getElementById(previewId);

  area.addEventListener('click', () => input.click());
  area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = 'var(--gold)'; });
  area.addEventListener('dragleave', ()  => { area.style.borderColor = ''; });
  area.addEventListener('drop', e => {
    e.preventDefault(); area.style.borderColor = '';
    if (e.dataTransfer.files[0]) showPreview(e.dataTransfer.files[0], holder, preview);
  });
  input.addEventListener('change', () => {
    if (input.files[0]) showPreview(input.files[0], holder, preview);
  });
}

function showPreview(file, holder, preview) {
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.classList.remove('hidden');
    holder.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

async function uploadImage(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return { url: data.secure_url, path: data.public_id };
}

setupUploadArea('newsUploadArea', 'newsImageInput', 'newsUploadPlaceholder', 'newsImagePreview');
setupUploadArea('blogUploadArea', 'blogImageInput', 'blogUploadPlaceholder', 'blogImagePreview');

// ===== NEWS CUTTINGS =====
document.getElementById('newsForm').addEventListener('submit', async e => {
  e.preventDefault();
  const file = document.getElementById('newsImageInput').files[0];
  if (!file) { showToast('Please select an image.', 'error'); return; }

  const btn = document.getElementById('newsSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

  try {
    const { url, path } = await uploadImage(file, 'news');
    await db.collection('news').add({
      imageUrl:  url,
      imagePath: path,
      source:    document.getElementById('newsSource').value.trim(),
      caption:   document.getElementById('newsCaption').value.trim(),
      date:      document.getElementById('newsDate').value.trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('Newspaper cutting published!', 'success');
    e.target.reset();
    document.getElementById('newsImagePreview').classList.add('hidden');
    document.getElementById('newsUploadPlaceholder').classList.remove('hidden');
    loadNews();
  } catch (err) {
    showToast('Upload failed: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-upload"></i> Upload & Publish';
  }
});

async function loadNews() {
  const list = document.getElementById('newsList');
  list.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  try {
    let snap;
    try {
      snap = await db.collection('news').orderBy('createdAt', 'desc').get();
    } catch (e) {
      snap = await db.collection('news').get();
    }
    if (snap.empty) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-newspaper"></i><p>No cuttings yet. Upload the first one!</p></div>';
      return;
    }
    list.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      list.insertAdjacentHTML('beforeend', `
        <div class="news-item">
          <img class="news-item-img" src="${d.imageUrl}" alt="${d.source}" />
          <div class="news-item-info">
            <div class="news-item-source">${d.source}</div>
            <div class="news-item-caption">${d.caption}</div>
            <div class="news-item-date">${d.date}</div>
          </div>
          <button class="btn-delete" onclick="deleteNews('${doc.id}', '${d.imagePath}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      `);
    });
  } catch (err) {
    list.innerHTML = '<div class="empty-state"><p>Error loading cuttings.</p></div>';
  }
}

async function deleteNews(id, imagePath) {
  if (!confirm('Delete this newspaper cutting?')) return;
  try {
    await db.collection('news').doc(id).delete();
    showToast('Cutting deleted.', 'success');
    loadNews();
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
}

// ===== BLOG POSTS =====
let editingBlogId   = null;
let editingImageUrl = '';
let editingImagePath = '';

document.getElementById('blogForm').addEventListener('submit', async e => {
  e.preventDefault();
  const title   = document.getElementById('blogTitle').value.trim();
  const content = document.getElementById('blogContent').innerHTML.trim();
  if (!title)   { showToast('Please enter a blog title.', 'error'); return; }
  if (!content) { showToast('Please write some content.', 'error'); return; }

  const btn = document.getElementById('blogSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${editingBlogId ? 'Updating...' : 'Publishing...'}`;

  try {
    let imageUrl  = editingImageUrl;
    let imagePath = editingImagePath;
    const imageFile = document.getElementById('blogImageInput').files[0];
    if (imageFile) {
      const uploaded = await uploadImage(imageFile, 'blog');
      imageUrl  = uploaded.url;
      imagePath = uploaded.path;
    }

    const plainText = document.getElementById('blogContent').innerText || '';
    const excerpt   = plainText.substring(0, 160).trim() + (plainText.length > 160 ? '...' : '');
    const now       = new Date();
    const dateStr   = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (editingBlogId) {
      await db.collection('blogs').doc(editingBlogId).update({
        title, content, excerpt, imageUrl, imagePath, date: dateStr
      });
      showToast('Blog post updated!', 'success');
    } else {
      await db.collection('blogs').add({
        title, content, excerpt, imageUrl, imagePath, date: dateStr,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast('Blog post published!', 'success');
    }

    resetBlogForm();
    loadBlogs();
  } catch (err) {
    showToast('Failed: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-${editingBlogId ? 'save' : 'paper-plane'}"></i> ${editingBlogId ? 'Update Post' : 'Publish Blog Post'}`;
  }
});

function resetBlogForm() {
  editingBlogId    = null;
  editingImageUrl  = '';
  editingImagePath = '';
  document.getElementById('blogForm').reset();
  document.getElementById('blogContent').innerHTML = '';
  document.getElementById('blogImagePreview').classList.add('hidden');
  document.getElementById('blogUploadPlaceholder').classList.remove('hidden');
  document.getElementById('blogSubmitBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Publish Blog Post';
  const cancelBtn = document.getElementById('blogCancelBtn');
  if (cancelBtn) cancelBtn.style.display = 'none';
  document.querySelector('#tab-blog .panel-card h2').innerHTML = '<i class="fas fa-plus-circle"></i> Write New Blog Post';
}

async function editBlog(id) {
  try {
    const doc  = await db.collection('blogs').doc(id).get();
    const d    = doc.data();
    editingBlogId    = id;
    editingImageUrl  = d.imageUrl  || '';
    editingImagePath = d.imagePath || '';

    document.getElementById('blogTitle').value       = d.title;
    document.getElementById('blogContent').innerHTML = d.content;

    if (d.imageUrl) {
      document.getElementById('blogImagePreview').src = d.imageUrl;
      document.getElementById('blogImagePreview').classList.remove('hidden');
      document.getElementById('blogUploadPlaceholder').classList.add('hidden');
    }

    document.getElementById('blogSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Update Post';
    document.querySelector('#tab-blog .panel-card h2').innerHTML = '<i class="fas fa-edit"></i> Edit Blog Post';

    let cancelBtn = document.getElementById('blogCancelBtn');
    if (!cancelBtn) {
      cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.id   = 'blogCancelBtn';
      cancelBtn.className = 'btn-cancel';
      cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Edit';
      cancelBtn.onclick   = resetBlogForm;
      document.getElementById('blogSubmitBtn').insertAdjacentElement('afterend', cancelBtn);
    }
    cancelBtn.style.display = 'flex';

    document.getElementById('tab-blog').scrollIntoView({ behavior: 'smooth' });
    showToast('Post loaded for editing.', 'success');
  } catch (err) {
    showToast('Could not load post: ' + err.message, 'error');
  }
}

async function loadBlogs() {
  const list = document.getElementById('blogList');
  list.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  try {
    let snap;
    try {
      snap = await db.collection('blogs').orderBy('createdAt', 'desc').get();
    } catch (e) {
      snap = await db.collection('blogs').get();
    }
    if (snap.empty) {
      list.innerHTML = '<div class="empty-state"><i class="fas fa-pen-nib"></i><p>No blog posts yet. Write the first one!</p></div>';
      return;
    }
    list.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      list.insertAdjacentHTML('beforeend', `
        <div class="blog-item">
          <div class="blog-item-header">
            <div>
              <div class="blog-item-title">${d.title}</div>
              <div class="blog-item-meta">${d.date}</div>
            </div>
            <div class="blog-item-actions">
              <button class="btn-edit" onclick="editBlog('${doc.id}')">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn-delete" onclick="deleteBlog('${doc.id}', '${d.imagePath}')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
          <div class="blog-item-excerpt">${d.excerpt}</div>
        </div>
      `);
    });
  } catch (err) {
    list.innerHTML = '<div class="empty-state"><p>Error loading blog posts.</p></div>';
  }
}

async function deleteBlog(id, imagePath) {
  if (!confirm('Delete this blog post?')) return;
  try {
    await db.collection('blogs').doc(id).delete();
    showToast('Blog post deleted.', 'success');
    loadBlogs();
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
}

// ===== BLOG EDITOR HELPERS =====
function formatText(cmd) {
  document.getElementById('blogContent').focus();
  document.execCommand(cmd, false, null);
}
function insertHeading() {
  document.getElementById('blogContent').focus();
  document.execCommand('formatBlock', false, 'h3');
}

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}
