// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// Editor mode tabs
const modeTabs = document.querySelectorAll('.mode-tab');
const modeContents = document.querySelectorAll('.mode-content');

modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const mode = tab.dataset.mode;

    modeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    modeContents.forEach(c => c.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');
  });
});

// Scroll animations with IntersectionObserver
const animateElements = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      const siblings = Array.from(entry.target.parentElement.children).filter(
        el => el.hasAttribute('data-animate')
      );
      const idx = siblings.indexOf(entry.target);

      setTimeout(() => {
        entry.target.classList.add('animate-in');
      }, idx * 80);

      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -40px 0px'
});

animateElements.forEach(el => observer.observe(el));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      const offset = navbar.offsetHeight + 20;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Mobile menu toggle
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.querySelector('.nav-links');

if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    // Simple mobile menu behavior could be added here
  });
}