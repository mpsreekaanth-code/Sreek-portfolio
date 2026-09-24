/* ============================================================
   CYBERPUNK INTRO BOOT SEQUENCE
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const introContainer = document.getElementById('cyber-intro');
  const introName = document.querySelector('.intro-name');

  setTimeout(() => {
    if (introName) introName.classList.add('fill-text');
  }, 500);

  setTimeout(() => {
    if (introContainer) introContainer.classList.add('intro-complete');
    document.body.classList.remove('no-scroll');
  }, 2500);
});

/* ============================================================
   PARTICLE BACKGROUND — Optimized Starfield & Energy Orbs
============================================================ */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [], floaters = [], mouseX = -1000, mouseY = -1000;
let animationFrameId = null;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  initParticles();
}

/* Star Particle */
class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.size = Math.random() * 1.4 + 0.3;
    this.speed = Math.random() * 0.25 + 0.05;
    this.opacity = Math.random() * 0.7 + 0.2;
    this.twinkle = Math.random() * Math.PI * 2;

    const roll = Math.random();
    if (roll > 0.7) this.baseColor = '0,245,255';
    else if (roll > 0.5) this.baseColor = '191,0,255';
    else this.baseColor = '255,255,255';
  }

  update() {
    this.y -= this.speed;
    this.twinkle += 0.025;
    if (this.y < -5) { this.y = H + 5; this.x = Math.random() * W; }
  }

  draw() {
    const alpha = this.opacity * (0.7 + 0.3 * Math.sin(this.twinkle));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.baseColor},${alpha})`;
    ctx.fill();
  }
}

/* Floating Energy Orb */
class Floater {
  constructor() { this.reset(); }

  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 60 + 30;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.hue = Math.random() > 0.5 ? 185 : 280;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -this.r || this.x > W + this.r) this.vx *= -1;
    if (this.y < -this.r || this.y > H + this.r) this.vy *= -1;
  }

  draw() {
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    g.addColorStop(0, `hsla(${this.hue},100%,55%,0.06)`);
    g.addColorStop(1, `hsla(${this.hue},100%,55%,0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  floaters = [];
  // Responsive particle density (lag-free calculation)
  const count = Math.min(80, Math.floor(W / 18));
  for (let i = 0; i < count; i++) particles.push(new Particle());
  for (let i = 0; i < 4; i++) floaters.push(new Floater());
}

window.addEventListener('resize', resize, { passive: true });
resize();

/* Throttled mouse position tracking */
window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}, { passive: true });

/* Fast connections near cursor (Zero-sqrt optimized) */
function drawConnections() {
  if (mouseX < 0 || mouseY < 0) return;

  const nearby = [];
  const maxMouseDistSq = 14400; // 120^2

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    if (dx * dx + dy * dy < maxMouseDistSq) {
      nearby.push(p);
    }
  }

  const maxConnDistSq = 6400; // 80^2
  for (let i = 0; i < nearby.length; i++) {
    for (let j = i + 1; j < nearby.length; j++) {
      const dx = nearby[i].x - nearby[j].x;
      const dy = nearby[i].y - nearby[j].y;
      const distSq = dx * dx + dy * dy;
      if (distSq < maxConnDistSq) {
        const dist = Math.sqrt(distSq);
        ctx.beginPath();
        ctx.moveTo(nearby[i].x, nearby[i].y);
        ctx.lineTo(nearby[j].x, nearby[j].y);
        ctx.strokeStyle = `rgba(0,245,255,${0.15 * (1 - dist / 80)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

/* Main animation loop */
function animate() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < floaters.length; i++) {
    floaters[i].update();
    floaters[i].draw();
  }
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }
  drawConnections();
  animationFrameId = requestAnimationFrame(animate);
}

// Pause animation loop when tab is hidden to save battery & CPU
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  } else {
    animate();
  }
});
animate();


/* ============================================================
   TYPEWRITER EFFECT
============================================================ */
const roles = [
  'BSc Electronics Graduate',
  'Software Application Developer',
  'Photography Enthusiast'
];
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

const typedEl = document.getElementById('typed-text');

function typeWriter() {
  if (!typedEl) return;
  const current = roles[roleIndex];

  if (!deleting) {
    typedEl.textContent = current.substring(0, ++charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeWriter, 1800);
      return;
    }
  } else {
    typedEl.textContent = current.substring(0, --charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeWriter, deleting ? 55 : 90);
}

setTimeout(typeWriter, 2000);


/* ============================================================
   SCROLL REVEAL OBSERVER
============================================================ */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));


/* ============================================================
   CONTACT FORM HANDLER
============================================================ */
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = this.querySelector('.btn-submit');
    if (btn) {
      btn.textContent = '✓ Message Sent!';
      btn.style.color = '#00ff88';
      btn.style.borderColor = '#00ff88';
      btn.style.boxShadow = '0 0 20px rgba(0,255,136,0.4)';

      setTimeout(() => {
        btn.textContent = 'Send Message →';
        btn.style.color = '';
        btn.style.borderColor = '';
        btn.style.boxShadow = '';
        this.reset();
      }, 3000);
    }
  });
}

/* ============================================================
   MOBILE MENU TOGGLE
============================================================ */
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
  mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  const navItems = navLinks.querySelectorAll('li a');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

/* ============================================================
   AI FACE SCAN & IDENTITY STATUS
============================================================ */
const scanCircle = document.querySelector('.scan-progress');
const scanPercentText = document.getElementById('scan-percent');
const scanLoader = document.querySelector('.scan-loader');
const aiLabelText = document.querySelector('.ai-label');

if (scanCircle && scanPercentText) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  let progress = 0;

  scanCircle.style.strokeDasharray = circumference;
  scanCircle.style.strokeDashoffset = circumference;

  const scanInterval = setInterval(() => {
    progress += 2; // Smoother & faster step

    const offset = circumference - (progress / 100) * circumference;
    scanCircle.style.strokeDashoffset = offset;
    scanPercentText.textContent = progress + '%';

    if (aiLabelText) {
      if (progress < 30) {
        aiLabelText.textContent = 'SCANNING FACE...';
      } else if (progress < 70) {
        aiLabelText.textContent = 'ANALYZING FEATURES...';
      } else if (progress < 100) {
        aiLabelText.textContent = 'MATCHING IDENTITY...';
      }
    }

    if (progress >= 100) {
      clearInterval(scanInterval);
      if (aiLabelText) {
        aiLabelText.textContent = 'IDENTITY CONFIRMED: M P SREEKAANTH';
      }
      setTimeout(() => {
        if (scanLoader) {
          scanLoader.classList.add('completed');
        }
      }, 500);
    }
  }, 25);
}

/* ============================================================
   UNIFIED HIGH-PERFORMANCE 3D HERO PARALLAX (LAG-FREE)
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const heroAvatar = document.querySelector('.hero-avatar-wrap');
  const heroImg = document.querySelector('.parallax-img') || document.querySelector('.profile-blend');

  if (!heroAvatar || !heroImg) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let ticking = false;

  heroAvatar.addEventListener('mousemove', (e) => {
    const rect = heroAvatar.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    targetX = x * 12;
    targetY = y * 10;

    if (!ticking) {
      requestAnimationFrame(updateHeroTransform);
      ticking = true;
    }
  }, { passive: true });

  heroAvatar.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    if (!ticking) {
      requestAnimationFrame(updateHeroTransform);
      ticking = true;
    }
  }, { passive: true });

  function updateHeroTransform() {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;

    heroImg.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(1.02)`;

    if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
      requestAnimationFrame(updateHeroTransform);
    } else {
      ticking = false;
    }
  }

  // Reveal profile image smoothly after intro
  setTimeout(() => {
    heroImg.classList.add('show', 'revealed');
  }, 2600);
});