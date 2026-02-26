/* ============================================================
   CYBERPUNK INTRO BOOT SEQUENCE
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const introContainer = document.getElementById('cyber-intro');
  const introName = document.querySelector('.intro-name');

  // Wait a short moment, then animate the text fill
  setTimeout(() => {
    if (introName) introName.classList.add('fill-text');
  }, 500);

  // After the text fills, slide the intro away
  setTimeout(() => {
    if (introContainer) introContainer.classList.add('intro-complete');
    document.body.classList.remove('no-scroll');
  }, 2500);
});

/* ============================================================
   PARTICLE BACKGROUND — Animated starfield + glowing orbs
============================================================ */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [], floaters = [], mouseX = 0, mouseY = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

/* ---- Star Particle ---- */
class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.size = Math.random() * 1.5 + 0.3;
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

/* ---- Floating Energy Orb ---- */
class Floater {
  constructor() { this.reset(); }

  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 80 + 40;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
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

/* ---- Spawn ---- */
for (let i = 0; i < 200; i++) particles.push(new Particle());
for (let i = 0; i < 6; i++) floaters.push(new Floater());

/* ---- Mouse interaction ---- */
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

/* ---- Connection lines near cursor ---- */
function drawConnections() {
  const nearby = particles.filter(p => {
    const dx = p.x - mouseX, dy = p.y - mouseY;
    return Math.sqrt(dx * dx + dy * dy) < 120;
  });

  for (let i = 0; i < nearby.length; i++) {
    for (let j = i + 1; j < nearby.length; j++) {
      const dx = nearby[i].x - nearby[j].x;
      const dy = nearby[i].y - nearby[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
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

/* ---- Main animation loop ---- */
function animate() {
  ctx.clearRect(0, 0, W, H);
  floaters.forEach(f => { f.update(); f.draw(); });
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animate);
}
animate();


/* ============================================================
   TYPEWRITER EFFECT
============================================================ */
const roles = [
  'BSc Electronics Graduate',
  'Front-End Developer',
  'Photography Enthusiast',
  'UI / UX Enthusiast',
];
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

const typedEl = document.getElementById('typed-text');

function typeWriter() {
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
   SCROLL REVEAL + SKILL BAR ANIMATION
============================================================ */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      /* Animate skill ring fills when their HUD panel scrolls into view */
      entry.target.querySelectorAll('.skill-card[data-percent]').forEach(item => {
        const pct = parseInt(item.dataset.percent, 10);
        const circumference = 2 * Math.PI * 42; // r=42
        const offset = circumference - (pct / 100) * circumference;
        const ring = item.querySelector('.ring-fill');
        if (ring) ring.style.strokeDashoffset = offset;
      });
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));


/* ============================================================
   CONTACT FORM HANDLER
============================================================ */
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const btn = this.querySelector('.btn-submit');
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
});

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

  // Close menu when a link is clicked
  const navItems = navLinks.querySelectorAll('li a');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

/* ============================================================
   AI FACE RECOGNITION TEXT UPGRADE
============================================================ */
const aiLabel = document.querySelector('.ai-label');

if (aiLabel) {
  setTimeout(() => {
    aiLabel.textContent = 'IDENTITY DETECTED: M P SREEKAANTH';
  }, 4000);

  setTimeout(() => {
    aiLabel.textContent = 'STATUS: FRONT-END DEVELOPER';
  }, 8000);
}
/* ============================================================
   AI FACE SCAN CIRCLE LOADER (0% → 100%)
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
    progress += 1;

    const offset = circumference - (progress / 100) * circumference;
    scanCircle.style.strokeDashoffset = offset;
    scanPercentText.textContent = progress + '%';

    // Update AI text during scan
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

      // Final AI message
      if (aiLabelText) {
        aiLabelText.textContent = 'IDENTITY CONFIRMED: M P SREEKAANTH';
      }

      // Fade out loader ring smoothly
      setTimeout(() => {
        if (scanLoader) {
          scanLoader.classList.add('completed');
        }
      }, 800);
    }
  }, 30); // Speed of scan (lower = faster)
}
/* ============================================================
   3D PARALLAX ANIMATION FOR PROFILE IMAGE
============================================================ */
const profileImg = document.querySelector('.animated-profile-img');

document.addEventListener('mousemove', (e) => {
  if (!profileImg) return;

  const x = (window.innerWidth / 2 - e.clientX) / 50;
  const y = (window.innerHeight / 2 - e.clientY) / 50;

  profileImg.style.transform = `translateY(-10px) rotateY(${x}deg) rotateX(${y}deg) scale(1.03)`;
});

document.addEventListener('mouseleave', () => {
  if (!profileImg) return;
  profileImg.style.transform = 'translateY(0px) scale(1)';
});
/* ============================================================
   3D PARALLAX EFFECT FOR PROFILE IMAGE (WOW INTERACTION)
============================================================ */
const profile = document.querySelector('.profile-animated');

document.addEventListener('mousemove', (e) => {
  if (!profile) return;

  const x = (window.innerWidth / 2 - e.clientX) / 40;
  const y = (window.innerHeight / 2 - e.clientY) / 40;

  profile.style.transform = `
    translateY(-10px)
    rotateY(${x}deg)
    rotateX(${y}deg)
    scale(1.03)
  `;
});

document.addEventListener('mouseleave', () => {
  if (!profile) return;
  profile.style.transform = 'translateY(0px) scale(1)';
});
/* ============================================================
   CINEMATIC PROFILE REVEAL (SYNC WITH CYBER INTRO)
============================================================ */
window.addEventListener("load", () => {
  const profile = document.querySelector('.profile-blend');

  // Wait until intro animation finishes
  setTimeout(() => {
    if (profile) {
      profile.classList.add('revealed');
    }
  }, 2600); // matches your intro timing (2.5s)
});
/* ============================================================
   3D CINEMATIC DEPTH + AI SPOTLIGHT FOLLOW (HERO IMAGE)
============================================================ */

const avatarWrap = document.querySelector('.hero-avatar-wrap');
const profileImage = document.querySelector('.profile-blend');

if (avatarWrap && profileImage) {

  avatarWrap.addEventListener('mousemove', (e) => {
    const rect = avatarWrap.getBoundingClientRect();

    // Mouse position inside avatar area
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation for 3D depth
    const rotateX = ((y - centerY) / centerY) * 8;
    const rotateY = ((centerX - x) / centerX) * 10;

    // Apply cinematic 3D transform
    profileImage.style.transform = `
      translateY(-10px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.03)
    `;

    // Move spotlight glow with cursor
    avatarWrap.style.setProperty(
      '--spot-x',
      `${x - rect.width / 2}px`
    );
    avatarWrap.style.setProperty(
      '--spot-y',
      `${y - rect.height / 2}px`
    );

    avatarWrap.style.transform = 'translateZ(0)';
  });

  // Reset when mouse leaves (smooth return)
  avatarWrap.addEventListener('mouseleave', () => {
    profileImage.style.transform = `
      translateY(0px)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
  });
}
/* ============================================================
   SIMPLE PROFILE REVEAL (LIGHTWEIGHT & SMOOTH)
============================================================ */
window.addEventListener("load", () => {
  const profile = document.querySelector('.profile-simple');

  // Sync with your intro (2.5s)
  setTimeout(() => {
    if (profile) {
      profile.classList.add('show');
    }
  }, 2600);
});
/* ============================================================
   STYLISH PARALLAX EFFECT FOR PROFILE IMAGE (SMOOTH & MINIMAL)
============================================================ */
const parallaxImg = document.querySelector('.parallax-img');
const avatarContainer = document.querySelector('.hero-avatar-wrap');

if (parallaxImg && avatarContainer) {
  avatarContainer.addEventListener('mousemove', (e) => {
    const rect = avatarContainer.getBoundingClientRect();

    // Mouse position inside container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to -1 to 1 range
    const moveX = (x / rect.width - 0.5) * 20;  // horizontal depth
    const moveY = (y / rect.height - 0.5) * 15; // vertical depth

    // Apply smooth parallax transform
    parallaxImg.style.transform = `
      translateY(-10px)
      translateX(${moveX}px)
      translateY(${moveY - 10}px)
      scale(1.02)
    `;
  });

  // Reset when mouse leaves (smooth return)
  avatarContainer.addEventListener('mouseleave', () => {
    parallaxImg.style.transform = `
      translateY(0px)
      translateX(0px)
      scale(1)
    `;
  });
}


/* ============================================================
   ERROR-FREE PARALLAX SYSTEM (MOUSE + SCROLL) – CLEAN & STABLE
============================================================ */

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

  const profileImg = document.querySelector('.parallax-img');
  const avatarWrap = document.querySelector('.hero-avatar-wrap');

  // Safety check (prevents console errors)
  if (!profileImg || !avatarWrap) return;

  let mouseX = 0;
  let mouseY = 0;
  let scrollYValue = 0;
  let currentX = 0;
  let currentY = 0;

  /* ----------------------------------------
     Smooth reveal after your intro animation
  ---------------------------------------- */
  window.addEventListener("load", () => {
    setTimeout(() => {
      profileImg.classList.add("show");
    }, 2600); // matches your intro timing
  });

  /* ----------------------------------------
     Mouse Parallax (Desktop Only)
  ---------------------------------------- */
  avatarWrap.addEventListener('mousemove', (e) => {
    const rect = avatarWrap.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to range -0.5 to 0.5 (very smooth)
    mouseX = (x / rect.width - 0.5);
    mouseY = (y / rect.height - 0.5);
  });

  avatarWrap.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  /* ----------------------------------------
     Scroll Parallax (Light & Smooth)
  ---------------------------------------- */
  window.addEventListener('scroll', () => {
    scrollYValue = window.scrollY || window.pageYOffset;
  }, { passive: true });

  /* ----------------------------------------
     Smooth Animation Loop (No Jitter)
  ---------------------------------------- */
  function animateParallax() {

    // Target movement values (very subtle & premium)
    const targetX = mouseX * 15;      // horizontal depth
    const targetY = mouseY * 12;      // vertical depth
    const scrollOffset = scrollYValue * 0.03; // soft scroll effect

    // Lerp smoothing (prevents shaking)
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // Apply transform safely (no multiline template issues)
    profileImg.style.transform =
      `translate3d(${currentX}px, ${currentY - scrollOffset}px, 0) scale(1.02)`;

    requestAnimationFrame(animateParallax);
  }

  // Start animation loop
  animateParallax();
});
/* ============================================================
   SCROLL FADE BLEND EFFECT (SMOOTH & LIGHTWEIGHT)
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const profile = document.querySelector('.fade-on-scroll');

  if (!profile) return;

  function handleScrollFade() {
    const scrollY = window.scrollY || window.pageYOffset;

    // Adjust fade start & strength here
    const fadeStart = 80;
    const fadeEnd = 700;

    if (scrollY <= fadeStart) {
      profile.style.opacity = "1";
      profile.style.filter = "blur(0px) brightness(1)";
    } else {
      // Calculate smooth fade progress (0 to 1)
      const progress = Math.min((scrollY - fadeStart) / (fadeEnd - fadeStart), 1);

      // Apply cinematic fade + blend
      const opacityValue = 1 - progress * 0.6; // fades to 0.4
      const blurValue = progress * 1.5;        // slight blur
      const brightnessValue = 1 - progress * 0.15;

      profile.style.opacity = opacityValue;
      profile.style.filter = `blur(${blurValue}px) brightness(${brightnessValue})`;
    }
  }

  // Smooth scroll listener (performance optimized)
  window.addEventListener('scroll', handleScrollFade, { passive: true });
});