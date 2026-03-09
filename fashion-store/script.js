// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor (Only on Desktop)
if (window.innerWidth > 768) {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    let mouseX = 0;
    let mouseY = 0;
    let ballX = 0;
    let ballY = 0;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorFollower, { xPercent: -50, yPercent: -50 });

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.1, ease: 'power2.out' });
    });

    // Smooth follower using requestAnimationFrame
    function render() {
        // smooth interpolation
        ballX += (mouseX - ballX) * 0.15;
        ballY += (mouseY - ballY) * 0.15;

        gsap.set(cursorFollower, { x: ballX, y: ballY });
        requestAnimationFrame(render);
    }
    render();

    // Hover effect on links
    const hoverElements = document.querySelectorAll('a, button, input, [data-hover]');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
            cursorFollower.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
            cursorFollower.classList.remove('hovered');
        });
    });

    // Magnetic Effect on Links and Buttons
    const magnets = document.querySelectorAll('[data-magnetic]');
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', (e) => {
            const boundingRect = magnet.getBoundingClientRect();
            const mousePosX = e.clientX - boundingRect.left;
            const mousePosY = e.clientY - boundingRect.top;

            // Move the element slightly towards the mouse
            gsap.to(magnet, {
                x: (mousePosX - boundingRect.width / 2) * 0.4,
                y: (mousePosY - boundingRect.height / 2) * 0.4,
                duration: 0.5,
                ease: 'power3.out'
            });
        });

        magnet.addEventListener('mouseleave', () => {
            // Snap back into place
            gsap.to(magnet, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}

// Lenis Smooth Scroll Setup
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

// Preloader & Hero Animation
const tl = gsap.timeline();

// Counter animation
let loadProgress = { value: 0 };
gsap.to(loadProgress, {
    value: 100,
    duration: 1.5,
    ease: "power2.inOut",
    delay: 0.2,
    onUpdate: () => {
        const percText = document.getElementById("loader-perc");
        const percBar = document.querySelector(".loader-progress-loader");
        if (percText) percText.innerHTML = Math.round(loadProgress.value) + "%";
        if (percBar) percBar.style.width = loadProgress.value + "%";
    },
    onComplete: () => {
        tl.to(".preloader", {
            yPercent: -100,
            duration: 1.5,
            ease: "expo.inOut"
        })
            .from(".hero-image", {
                scale: 1.2,
                duration: 2,
                ease: "power3.out"
            }, "-=1")
            .from(".hero-title .line span", {
                y: "120%",
                duration: 1,
                stagger: 0.2,
                ease: "power4.out"
            }, "-=1.5")
            .from(".hero-subtitle .line span", {
                y: "120%",
                duration: 0.8,
                ease: "power3.out"
            }, "-=1.1")
            .from(".nav", {
                y: -50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            }, "-=1");
    }
});

// Scroll Progress Bar
gsap.to(".scroll-progress-bar", {
    width: "100%",
    ease: "none",
    scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5
    }
});

// Marquee Animation
const marqueeTracks = document.querySelectorAll('.marquee-track');
if (marqueeTracks.length > 0) {
    marqueeTracks.forEach(track => {
        const marquee = track.querySelector('.marquee');
        if (marquee) {
            // Clone for seamless loop
            const clone = marquee.cloneNode(true);
            track.appendChild(clone);

            const isReverse = marquee.classList.contains('marquee-reverse');

            gsap.to(track.querySelectorAll('.marquee'), {
                xPercent: isReverse ? 100 : -100,
                ease: "none",
                duration: 25,
                repeat: -1
            });
        }
    });

    // Add skew to marquee on Scroll
    let proxy = { skew: 0 },
        skewSetter = gsap.quickSetter(".marquee-wrapper", "skewY", "deg"),
        clamp = gsap.utils.clamp(-10, 10);

    ScrollTrigger.create({
        onUpdate: (self) => {
            let skew = clamp(self.getVelocity() / -200);
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
                proxy.skew = skew;
                gsap.to(proxy, { skew: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => skewSetter(proxy.skew) });
            }
        }
    });
}


// About Section Text Split & Reveal
// Wrap in timeout to ensure font loaded before splitting
setTimeout(() => {
    const splitTypes = document.querySelectorAll('.split-text');

    splitTypes.forEach((char) => {
        const text = new SplitType(char, { types: 'chars,words' })

        gsap.from(text.chars, {
            scrollTrigger: {
                trigger: char,
                start: 'top 85%',
                end: 'top 25%',
                scrub: true,
            },
            opacity: 0.1,
            stagger: 0.1,
        })
    });
}, 100);

// Image Clip Path Reveal
const imgWraps = document.querySelectorAll('.img-wrap');
imgWraps.forEach(wrap => {
    gsap.to(wrap, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "power3.inOut",
        scrollTrigger: {
            trigger: wrap,
            start: "top 85%",
            end: "top 40%",
            scrub: 1
        }
    });
});

// Collection Images Parallax
const parallaxImages = document.querySelectorAll('.parallax-img');
parallaxImages.forEach(img => {
    gsap.to(img, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// Massive Footer Text Animation
gsap.to(".massive-footer-text", {
    scrollTrigger: {
        trigger: ".footer",
        start: "top bottom",
        end: "bottom bottom",
        scrub: 1
    },
    scale: 1.05,
    y: -30,
    opacity: 1
});
