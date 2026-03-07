/* SCROLL REVEAL */

function reveal() {
    document.querySelectorAll(".reveal").forEach(el => {
        let windowHeight = window.innerHeight
        let elementTop = el.getBoundingClientRect().top
        if (elementTop < windowHeight - 100) {
            el.classList.add("active")
        }
    })
}

window.addEventListener("scroll", reveal)
// Trigger on load too
reveal();


/* MOBILE HAMBURGER MENU */
function toggleMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Close mobile menu when a nav link is tapped
document.querySelectorAll('#navMenu a').forEach(link => {
    link.addEventListener('click', () => {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        if (navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});


/* CART SYSTEM */
let cartItems = [];

function toggleCart() {
    document.getElementById("cart").classList.toggle("active");
    document.getElementById("cartOverlay").classList.toggle("active");
}

function addToCart(name, price) {
    cartItems.push({ name, price });
    renderCart();

    // Update counter badge
    document.getElementById('cartCount').textContent = cartItems.length;
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    renderCart();
    document.getElementById('cartCount').textContent = cartItems.length;
}

function renderCart() {
    const list = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    list.innerHTML = '';
    let total = 0;

    cartItems.forEach((item, i) => {
        total += item.price;
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.name} — ₹${item.price}</span> <button onclick="removeFromCart(${i})">✕</button>`;
        list.appendChild(li);
    });

    totalEl.textContent = total;
}


/* DARK MODE */

function toggleDark() {
    document.body.classList.toggle("dark");
}


/* CONTACT FORM */
function handleContact(e) {
    e.preventDefault();
    alert("Thank you for your message! We'll get back to you soon.");
    e.target.reset();
}


/* THREE JS 3D BOTTLE */

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)

renderer.setSize(400, 400)

document.getElementById("scene3d").appendChild(renderer.domElement)

// Realistic lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
dirLight.position.set(5, 10, 5)
scene.add(dirLight)

const backLight = new THREE.PointLight(0x00aaff, 1, 10)
backLight.position.set(-2, 2, -2)
scene.add(backLight)

const loader = new THREE.GLTFLoader()

let bottle

loader.load("assets/bottle.glb", (gltf) => {
    bottle = gltf.scene
    scene.add(bottle)
    bottle.scale.set(2, 2, 2)
})

camera.position.z = 5


/* SCROLL ROTATION */

window.addEventListener("scroll", () => {
    if (bottle) {
        let scroll = window.scrollY * 0.001
        bottle.rotation.y = scroll
    }
})


/* BUBBLE PARTICLES */

const bubbles = []
const geo = new THREE.SphereGeometry(0.05, 16, 16)
const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 1.0,
    transparent: true,
    ior: 1.33,
    thickness: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
})

for (let i = 0; i < 100; i++) {
    let bubble = new THREE.Mesh(geo, mat)
    bubble.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() * 2 - 1) * 3,
        (Math.random() - 0.5) * 3
    )
    let scale = Math.random() * 0.5 + 0.5;
    bubble.scale.set(scale, scale, scale);
    scene.add(bubble)
    bubbles.push({
        mesh: bubble,
        speedY: Math.random() * 0.015 + 0.005,
        offsetX: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.02
    })
}


let time = 0;
function animate() {
    requestAnimationFrame(animate)
    time += 0.02;

    if (bottle) {
        bottle.position.y = Math.sin(time) * 0.1;
    }

    bubbles.forEach(b => {
        b.mesh.position.y += b.speedY;
        b.mesh.position.x += Math.sin(time * b.wobbleSpeed + b.offsetX) * 0.005;
        if (b.mesh.position.y > 3) {
            b.mesh.position.y = -3;
            b.mesh.position.x = (Math.random() - 0.5) * 3;
        }
    })

    renderer.render(scene, camera)
}

animate()


/* ============================
   WATER FLOW BACKGROUND (No Ocean)
   ============================ */

const canvas = document.getElementById("waterBg")
const ctx = canvas.getContext("2d")

function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Water ripple particles
const ripples = [];
for (let i = 0; i < 25; i++) {
    ripples.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 60 + 20,
        maxRadius: Math.random() * 120 + 60,
        speed: Math.random() * 0.4 + 0.2,
        opacity: Math.random() * 0.15 + 0.05
    });
}

// Flowing streaks
const streaks = [];
for (let i = 0; i < 15; i++) {
    streaks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 300 + 100,
        width: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        angle: Math.random() * 0.4 - 0.2, // slight angle
        opacity: Math.random() * 0.08 + 0.02
    });
}

let timeCanvas = 0;
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    timeCanvas += 0.012;

    let isDark = !document.body.classList.contains('dark');

    // Clean dark gradient background (NO ocean)
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (isDark) {
        gradient.addColorStop(0, '#0b0f1a');
        gradient.addColorStop(0.5, '#0d1225');
        gradient.addColorStop(1, '#060a14');
    } else {
        gradient.addColorStop(0, '#e8faff');
        gradient.addColorStop(0.5, '#d0efff');
        gradient.addColorStop(1, '#b8e4ff');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // WATER FLOW STREAKS (flowing downward like rain on glass)
    streaks.forEach(s => {
        ctx.save();
        ctx.globalAlpha = s.opacity;
        ctx.strokeStyle = isDark ? 'rgba(0, 198, 255, 0.6)' : 'rgba(0, 114, 255, 0.4)';
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.angle * s.length, s.y + s.length);
        ctx.stroke();
        ctx.restore();

        s.y += s.speed;
        if (s.y > canvas.height) {
            s.y = -s.length;
            s.x = Math.random() * canvas.width;
        }
    });

    // EXPANDING WATER RIPPLES
    ripples.forEach(r => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
            ? `rgba(0, 198, 255, ${r.opacity * (1 - r.radius / r.maxRadius)})`
            : `rgba(0, 114, 255, ${r.opacity * (1 - r.radius / r.maxRadius)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        r.radius += r.speed;
        if (r.radius > r.maxRadius) {
            r.radius = 0;
            r.x = Math.random() * canvas.width;
            r.y = Math.random() * canvas.height;
            r.opacity = Math.random() * 0.15 + 0.05;
        }
    });

    // GENTLE FLOWING WAVES (subtle, not ocean-like)
    const layers = isDark ? [
        { color: 'rgba(0, 198, 255, 0.03)', amplitude: 20, speed: 0.8, offset: 0, yOffset: 0.75 },
        { color: 'rgba(0, 120, 255, 0.04)', amplitude: 15, speed: 1.2, offset: 100, yOffset: 0.85 },
        { color: 'rgba(0, 80, 200, 0.05)', amplitude: 25, speed: 0.5, offset: 200, yOffset: 0.92 }
    ] : [
        { color: 'rgba(0, 170, 255, 0.08)', amplitude: 20, speed: 0.8, offset: 0, yOffset: 0.75 },
        { color: 'rgba(0, 120, 255, 0.1)', amplitude: 15, speed: 1.2, offset: 100, yOffset: 0.85 },
        { color: 'rgba(0, 80, 200, 0.15)', amplitude: 25, speed: 0.5, offset: 200, yOffset: 0.92 }
    ];

    layers.forEach(layer => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width + 50; x += 20) {
            let y = Math.sin((x * 0.004) + (timeCanvas * layer.speed) + layer.offset) * layer.amplitude
                + Math.sin((x * 0.002) + (timeCanvas * layer.speed * 0.7)) * (layer.amplitude * 0.5);
            ctx.lineTo(x, (canvas.height * layer.yOffset) + y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fillStyle = layer.color;
        ctx.fill();
    });

    // FLOATING WATER DROPLET PARTICLES
    ctx.save();
    for (let i = 0; i < 30; i++) {
        let px = (Math.sin(timeCanvas * 0.3 + i * 37) * 0.5 + 0.5) * canvas.width;
        let py = (Math.sin(timeCanvas * 0.2 + i * 53) * 0.5 + 0.5) * canvas.height;
        let size = Math.sin(timeCanvas + i) * 2 + 3;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
            ? `rgba(0, 198, 255, ${0.05 + Math.sin(timeCanvas + i) * 0.03})`
            : `rgba(0, 114, 255, ${0.08 + Math.sin(timeCanvas + i) * 0.04})`;
        ctx.fill();
    }
    ctx.restore();

    requestAnimationFrame(draw)
}

draw()


/* ============================
   COUNTER ANIMATION
   ============================ */
function animateCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const current = +counter.textContent;
        const increment = target / 60;

        if (current < target) {
            counter.textContent = Math.ceil(current + increment);
            setTimeout(() => animateCounters(), 30);
        } else {
            counter.textContent = target;
        }
    });
}

// Observe counters
const statsSection = document.querySelector('.stats-bar');
if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    observer.observe(statsSection);
}


/* ============================
   CUSTOM CURSOR & HOVER EFFECTS
   ============================ */
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursor) {
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    }
});

function animateCursor() {
    if (follower) {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, li, .card, .feature-card, .testimonial-card, h1, h2').forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('expand'));
});


/* ============================
   SCROLL PROGRESS & DYNAMIC NAVBAR & BACK TO TOP
   ============================ */
const scrollProgress = document.getElementById('scrollProgress');
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    let scrollTop = window.scrollY;
    let docHeight = document.documentElement.scrollHeight - window.innerHeight;
    let scrolled = (scrollTop / docHeight) * 100;

    if (scrollProgress) {
        scrollProgress.style.width = scrolled + '%';
    }

    if (navbar) {
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    if (backToTop) {
        if (scrollTop > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
});


/* ============================
   INTERACTIVE 3D CARD TILT
   ============================ */
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateY(-12px)`;
        card.style.boxShadow = `${-rotateY}px ${rotateX + 20}px 30px rgba(0, 150, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.08)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)`;
        card.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)`;
    });
});