// ================================================================
// Main JS — Navigation, animations, utilities
// ================================================================

// Sticky nav
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('nav--scrolled');
    else navbar.classList.remove('nav--scrolled');
  });
  // Run once on load
  if (window.scrollY > 60) navbar.classList.add('nav--scrolled');
}

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach(link => {
  if (link.getAttribute('href') && link.getAttribute('href').startsWith(currentPage.split('#')[0])) {
    link.classList.add('active');
  }
});

// Scroll animations
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => observer.observe(el));
}

// Particle generator for hero
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'hero__particle';
    const size = Math.random() * 80 + 20;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      animation-delay:${Math.random()*6}s;
      animation-duration:${6 + Math.random()*6}s;
    `;
    particlesContainer.appendChild(p);
  }
}

// Toast notification
function showToast(message, type = 'success', icon = '✓') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast__icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
window.showToast = showToast;

// Number counter animation
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const duration = 1800;
    const start = performance.now();
    const suffix = el.textContent.includes('%') ? '%' : '';
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}
const heroObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); heroObs.disconnect(); } });
}, { threshold: 0.3 });
const heroStats = document.querySelector('.hero__stats');
if (heroStats) heroObs.observe(heroStats);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Booking system helpers (localStorage)
const BookingSystem = {
  getBookings() {
    try { return JSON.parse(localStorage.getItem('lac_bookings') || '[]'); } catch { return []; }
  },
  saveBooking(booking) {
    const bookings = this.getBookings();
    booking.id = Date.now().toString(36);
    booking.createdAt = new Date().toISOString();
    bookings.push(booking);
    localStorage.setItem('lac_bookings', JSON.stringify(bookings));
    return booking;
  },
  isDateBooked(posteId, date) {
    const bookings = this.getBookings();
    return bookings.some(b => b.posteId === posteId && b.dates && b.dates.includes(date));
  },
  getBookedDates(posteId) {
    return this.getBookings()
      .filter(b => b.posteId === posteId)
      .flatMap(b => b.dates || []);
  },
};
window.BookingSystem = BookingSystem;

// Format date FR
function formatDateFR(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}
window.formatDateFR = formatDateFR;

// Difficulty badge color
function getDiffColor(diff) {
  const map = { 'Facile': '#27ae60', 'Intermédiaire': '#f39c12', 'Expert': '#e74c3c' };
  return map[diff] || '#6c7a89';
}
window.getDiffColor = getDiffColor;
