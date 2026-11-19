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

// ===== CONTACT FORM VALIDATION =====
const PHONE_RE = /^(?:\+91|91|0)?[6-9]\d{9}$/;          // Indian mobile: 10 digits starting 6–9
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;        // name@domain.tld

const validators = {
  'cf-name': v => {
    if (!v) return 'Please enter your name.';
    if (v.length < 2) return 'Name is too short.';
    if (!/^[a-zA-Z .'-]+$/.test(v)) return 'Name can only contain letters.';
    return '';
  },
  'cf-phone': v => {
    if (!v) return 'Please enter your mobile number.';
    const num = v.replace(/[\s-]/g, '');
    if (PHONE_RE.test(num)) return '';
    const digits = num.replace(/^(\+91|91(?=\d{10}$)|0(?=\d{10}$))/, '').replace(/\D/g, '');
    if (digits.length < 10) return `Mobile number must be 10 digits (${digits.length} entered).`;
    if (digits.length > 10) return 'Mobile number has too many digits.';
    if (!/^[6-9]/.test(digits)) return 'Mobile number should start with 6, 7, 8 or 9.';
    return 'Enter a valid 10-digit mobile number.';
  },
  'cf-email': v => {
    if (!v) return 'Please enter your email address.';
    if (!EMAIL_RE.test(v)) return 'Enter a valid email address (e.g. name@gmail.com).';
    return '';
  },
  'cf-message': v => {
    if (!v) return 'Please enter your message.';
    if (v.length < 10) return 'Message is too short — please add a few more details.';
    return '';
  },
};

function validateField(input) {
  const msg = validators[input.id](input.value.trim());
  const errorEl = input.parentElement.querySelector('.field-error');
  input.classList.toggle('is-invalid', !!msg);
  input.classList.toggle('is-valid', !msg);
  if (errorEl) errorEl.textContent = msg;
  return !msg;
}

function clearField(input) {
  input.classList.remove('is-invalid', 'is-valid');
  const errorEl = input.parentElement.querySelector('.field-error');
  if (errorEl) errorEl.textContent = '';
}

function validateForm() {
  let firstInvalid = null;
  Object.keys(validators).forEach(id => {
    const input = document.getElementById(id);
    if (!validateField(input) && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

Object.keys(validators).forEach(id => {
  const input = document.getElementById(id);
  if (!input) return;
  // check when the user leaves the field; re-check live once an error is shown
  input.addEventListener('blur', () => { if (input.value.trim()) validateField(input); });
  input.addEventListener('input', () => {
    if (!input.value.trim()) return clearField(input);            // emptied: reset quietly
    if (input.classList.contains('is-invalid')) validateField(input);
  });
});

// phone: allow only digits, +, space and hyphen while typing
const phoneInput = document.getElementById('cf-phone');
if (phoneInput) {
  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/[^\d+\s-]/g, '');
  });
}

// ===== CONTACT FORM =====
async function handleForm(e) {
  e.preventDefault();
  const form    = document.getElementById('contactForm');
  const btn     = document.getElementById('contactSubmitBtn');

  if (!validateForm()) return;

  btn.disabled  = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  try {
    const data = new FormData(form);
    // Subject shown in the inbox, e.g. "New Enquiry from Rahul"
    data.set('subject', `New Enquiry from ${data.get('Name')}`);
    const res  = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data
    });
    const json = await res.json();

    if (json.success) {
      form.reset();
      form.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
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
