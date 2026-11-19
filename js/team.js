// =====================================================
//  OUR ADVOCATES — edit the details here
//  Fields match the "Advocate Profile Details" Word form.
//  Leave any field as '' (or remove it) and it is simply hidden on the site.
//  Photos go in the images/ folder.
// =====================================================
// ⚠️ DUMMY DATA (from the Word form sample) — replace with real details before going live
const ADVOCATES = [
  {
    name:         'Adv. A D Benny',
    role:         'Senior Advocate & Founder',
    photo:        'images/advocate1.jpg',
    experience:   '12 years',
    enrolledYear: '2012',
    enrolmentNo:  'K/1234/2012',
    bio:          'Experienced in criminal defence and family law matters. Known for thorough case preparation and courtroom advocacy.',
    education:    'BA LLB (Hons), Government Law College, Ernakulam; LLM (Constitutional Law)',
    practiceAreas: ['Criminal Law', 'Family Law', 'Matrimonial Disputes'],
    courts:       ['Kerala High Court', 'District Court Ernakulam', 'Family Court'],
    email:        'rahul.menon@example.com',
    phone:        '+91 98XXX XXXXX',
    linkedin:     'https://www.linkedin.com/in/rahul-menon',
  },
  {
    name:         'Adv. Edbeel Benny',
    role:         'Senior Associate',
    photo:        'images/advocate2.jpg',
    experience:   '12 years',
    enrolledYear: '2012',
    enrolmentNo:  'K/1234/2012',
    bio:          'Experienced in criminal defence and family law matters. Known for thorough case preparation and courtroom advocacy.',
    education:    'BA LLB (Hons), Government Law College, Ernakulam; LLM (Constitutional Law)',
    practiceAreas: ['Criminal Law', 'Family Law', 'Matrimonial Disputes'],
    courts:       ['Kerala High Court', 'District Court Ernakulam', 'Family Court'],
    email:        'rahul.menon@example.com',
    phone:        '+91 98XXX XXXXX',
    linkedin:     'https://www.linkedin.com/in/rahul-menon',
  },
  {
    name:         'Adv. Anna Edbeel',
    role:         'Associate Advocate',
    photo:        'images/advocate3.jpg',
    experience:   '12 years',
    enrolledYear: '2012',
    enrolmentNo:  'K/1234/2012',
    bio:          'Experienced in criminal defence and family law matters. Known for thorough case preparation and courtroom advocacy.',
    education:    'BA LLB (Hons), Government Law College, Ernakulam; LLM (Constitutional Law)',
    practiceAreas: ['Criminal Law', 'Family Law', 'Matrimonial Disputes'],
    courts:       ['Kerala High Court', 'District Court Ernakulam', 'Family Court'],
    email:        'rahul.menon@example.com',
    phone:        '+91 98XXX XXXXX',
    linkedin:     'https://www.linkedin.com/in/rahul-menon',
  },
  {
    name:         'Adv. Edweena Benny',
    role:         'Junior Associate',
    photo:        'images/advocate4.jpg',
    experience:   '12 years',
    enrolledYear: '2012',
    enrolmentNo:  'K/1234/2012',
    bio:          'Experienced in criminal defence and family law matters. Known for thorough case preparation and courtroom advocacy.',
    education:    'BA LLB (Hons), Government Law College, Ernakulam; LLM (Constitutional Law)',
    practiceAreas: ['Criminal Law', 'Family Law', 'Matrimonial Disputes'],
    courts:       ['Kerala High Court', 'District Court Ernakulam', 'Family Court'],
    email:        'rahul.menon@example.com',
    phone:        '+91 98XXX XXXXX',
    linkedin:     'https://www.linkedin.com/in/rahul-menon',
  },
];

// ===== RENDER (no need to edit below) =====
(function renderTeam() {
  const list = document.getElementById('teamList');
  if (!list) return;

  const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const has = v => Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());
  const initials = name => name.replace(/^Adv\.?\s*/i, '').split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase();

  list.innerHTML = ADVOCATES.map((a, i) => {
    const facts = [
      has(a.experience)   && ['fa-briefcase',   'Experience', a.experience],
      has(a.enrolledYear) && ['fa-calendar-check', 'Enrolled', a.enrolledYear],
      has(a.enrolmentNo)  && ['fa-id-card',     'Enrolment No.', a.enrolmentNo],
    ].filter(Boolean);

    const details = [
      has(a.education) && ['fa-graduation-cap', 'Education', esc(a.education)],
      has(a.courts)    && ['fa-landmark',       'Courts', a.courts.map(esc).join(' · ')],
    ].filter(Boolean);

    const contacts = [
      has(a.email)    && `<a href="mailto:${esc(a.email)}" aria-label="Email ${esc(a.name)}"><i class="fas fa-envelope"></i> Email</a>`,
      has(a.phone)    && `<a href="tel:${esc(a.phone.replace(/\s/g, ''))}" aria-label="Call ${esc(a.name)}"><i class="fas fa-phone-alt"></i> Call</a>`,
      has(a.linkedin) && `<a href="${esc(a.linkedin)}" target="_blank" rel="noopener" aria-label="${esc(a.name)} on LinkedIn"><i class="fab fa-linkedin-in"></i> LinkedIn</a>`,
    ].filter(Boolean);

    return `
      <article class="profile ${i % 2 ? 'profile--reverse' : ''}">
        <div class="profile-photo">
          <div class="profile-photo-frame">
            <img src="${esc(a.photo)}" alt="${esc(a.name)}" loading="lazy"
                 onerror="this.parentElement.classList.add('no-photo'); this.remove();" />
            <span class="profile-monogram">${initials(a.name)}</span>
          </div>
        </div>

        <div class="profile-body">
          <span class="profile-role">${esc(a.role)}</span>
          <h3 class="profile-name">${esc(a.name)}</h3>

          ${facts.length ? `
          <div class="profile-facts">
            ${facts.map(([icon, label, val]) => `
              <div class="profile-fact">
                <i class="fas ${icon}"></i>
                <div><small>${label}</small><strong>${esc(val)}</strong></div>
              </div>`).join('')}
          </div>` : ''}

          ${has(a.bio) ? `<p class="profile-bio">${esc(a.bio)}</p>` : ''}

          ${has(a.practiceAreas) ? `
          <div class="profile-tags">
            ${a.practiceAreas.map(p => `<span>${esc(p)}</span>`).join('')}
          </div>` : ''}

          ${details.length ? `
          <dl class="profile-details">
            ${details.map(([icon, label, val]) => `
              <div><dt><i class="fas ${icon}"></i> ${label}</dt><dd>${val}</dd></div>`).join('')}
          </dl>` : ''}


          ${contacts.length ? `<div class="profile-contact">${contacts.join('')}</div>` : ''}

          <button type="button" class="profile-open">View Profile <i class="fas fa-arrow-up"></i></button>
        </div>
      </article>`;
  }).join('');
})();

// ===== PROFILE SHEET (phones) =====
(function profileSheet() {
  const sheet   = document.getElementById('profileSheet');
  const content = document.getElementById('profileSheetContent');
  const list    = document.getElementById('teamList');
  if (!sheet || !content || !list) return;

  function open(article) {
    const img  = article.querySelector('.profile-photo-frame img');
    const body = article.querySelector('.profile-body').cloneNode(true);
    const btn  = body.querySelector('.profile-open');
    if (btn) btn.remove();
    content.innerHTML = '';
    if (img) {
      const photo = document.createElement('img');
      photo.className = 'profile-sheet__photo';
      photo.src = img.src;
      photo.alt = img.alt;
      content.appendChild(photo);
    }
    content.appendChild(body);
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    content.parentElement.scrollTop = 0;
  }

  function close() {
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  list.addEventListener('click', e => {
    const btn = e.target.closest('.profile-open');
    if (btn) open(btn.closest('.profile'));
  });
  sheet.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sheet.classList.contains('open')) close();
  });
})();
