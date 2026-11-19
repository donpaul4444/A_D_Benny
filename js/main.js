// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.getAttribute('id');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

// ===== LIGHTBOX FOR NEWS CUTTINGS =====
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.news-img-wrap').forEach(wrap => {
  wrap.addEventListener('click', () => {
    const img = wrap.querySelector('img');
    lightboxImg.src = img.src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== CONTACT FORM =====
async function handleForm(e) {
  e.preventDefault();
  const form    = document.getElementById('contactForm');
  const btn     = document.getElementById('contactSubmitBtn');
  const success = document.getElementById('formSuccess');

  btn.disabled  = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  try {
    const data = new FormData(form);
    const res  = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data
    });
    const json = await res.json();

    if (json.success) {
      form.reset();
      btn.disabled  = false;
      btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
      showContactToast();
    } else {
      throw new Error(json.message || 'Submission failed');
    }
  } catch (err) {
    btn.disabled  = false;
    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
    showContactToast('error');
  }
}

// ===== CONTACT TOAST =====
function showContactToast(type = 'success') {
  const existing = document.getElementById('contactToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'contactToast';
  toast.className = `contact-toast contact-toast--${type}`;
  toast.innerHTML = type === 'success'
    ? `<i class="fas fa-check-circle"></i>
       <div>
         <strong>Message Sent!</strong>
         <span>We'll get back to you shortly.</span>
       </div>
       <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`
    : `<i class="fas fa-exclamation-circle"></i>
       <div>
         <strong>Failed to send</strong>
         <span>Please call us directly.</span>
       </div>
       <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 5000);
}

// ===== SCROLL REVEAL (simple fade-in) =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.practice-card, .team-card, .news-card, .about-text, .about-image, .contact-info, .contact-form-wrap'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .visible { opacity: 1 !important; transform: translateY(0) !important; }
    </style>
  `);
});
