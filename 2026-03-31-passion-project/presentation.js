/* ===========================================
   SLIDE PRESENTATION CONTROLLER
   Navigation, animations, progress, keyboard/touch/wheel
   + Particles, sparkles, cursor trail, confetti, coin counter
   =========================================== */

class SlidePresentation {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentIndex = 0;
        this.isAnimating = false;
        this.touchStartY = 0;
        this.coinCount = 0;

        this.init();
    }

    init() {
        this.createNavDots();
        this.createCoinCounter();
        this.createFlashOverlay();
        this.setupIntersectionObserver();
        this.bindEvents();
        this.updateProgress();
        this.updateSlideCounter();
        this.initParticles();
        this.initCursorTrail();
        this.initSparkleWords();

        // Mark first slide visible immediately
        if (this.slides[0]) {
            this.slides[0].classList.add('visible');
        }
    }

    /* -------------------------------------------
       COIN COUNTER — top-left game HUD
       ------------------------------------------- */
    createCoinCounter() {
        const counter = document.createElement('div');
        counter.className = 'coin-counter';
        counter.innerHTML = '<span class="coin-icon"></span><span class="coin-value">0</span>';
        document.body.appendChild(counter);
        this.coinCounter = counter;
    }

    addCoin() {
        this.coinCount++;
        const val = this.coinCounter.querySelector('.coin-value');
        val.textContent = this.coinCount;
        this.coinCounter.classList.add('bump');
        setTimeout(() => this.coinCounter.classList.remove('bump'), 300);
    }

    /* -------------------------------------------
       FLASH OVERLAY — screen flash on key slides
       ------------------------------------------- */
    createFlashOverlay() {
        this.flash = document.createElement('div');
        this.flash.className = 'slide-flash';
        document.body.appendChild(this.flash);
    }

    triggerFlash(color) {
        this.flash.style.background = color || 'rgba(83, 215, 105, 0.15)';
        this.flash.classList.remove('active');
        void this.flash.offsetWidth; // Force reflow
        this.flash.classList.add('active');
    }

    /* -------------------------------------------
       NAVIGATION DOTS
       ------------------------------------------- */
    createNavDots() {
        const nav = document.getElementById('navDots');
        if (!nav) return;

        this.slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            nav.appendChild(dot);
        });
    }

    /* -------------------------------------------
       INTERSECTION OBSERVER — trigger .visible + effects
       ------------------------------------------- */
    setupIntersectionObserver() {
        const visitedSlides = new Set();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.currentIndex = Array.from(this.slides).indexOf(entry.target);
                    this.updateNavDots();
                    this.updateProgress();
                    this.updateSlideCounter();

                    // First-time visit effects
                    if (!visitedSlides.has(this.currentIndex)) {
                        visitedSlides.add(this.currentIndex);
                        this.addCoin();

                        // Flash on emotion/power slides
                        if (entry.target.classList.contains('slide-super')) {
                            this.triggerFlash('rgba(83, 215, 105, 0.12)');
                        } else if (entry.target.classList.contains('slide-ai')) {
                            this.triggerFlash('rgba(79, 195, 247, 0.1)');
                        }
                    }

                    // Confetti on the last slide
                    if (this.currentIndex === this.slides.length - 1 && !this._confettiFired) {
                        this._confettiFired = true;
                        setTimeout(() => this.fireConfetti(), 600);
                    }
                }
            });
        }, { threshold: 0.5 });

        this.slides.forEach(slide => observer.observe(slide));
    }

    /* -------------------------------------------
       EVENT BINDINGS
       ------------------------------------------- */
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Touch
        document.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const diff = this.touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(diff) > 50) {
                diff > 0 ? this.nextSlide() : this.prevSlide();
            }
        }, { passive: true });

        // Wheel (debounced)
        let wheelTimeout;
        document.addEventListener('wheel', (e) => {
            if (wheelTimeout) return;
            wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 800);
            e.deltaY > 0 ? this.nextSlide() : this.prevSlide();
        }, { passive: true });
    }

    /* -------------------------------------------
       KEYBOARD
       ------------------------------------------- */
    handleKeydown(e) {
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.slides.length - 1);
                break;
            default:
                const num = parseInt(e.key);
                if (num >= 1 && num <= 9 && num <= this.slides.length) {
                    e.preventDefault();
                    this.goToSlide(num - 1);
                }
        }
    }

    /* -------------------------------------------
       NAVIGATION
       ------------------------------------------- */
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length && !this.isAnimating) {
            this.isAnimating = true;
            this.slides[index].scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { this.isAnimating = false; }, 700);
        }
    }

    nextSlide() {
        if (this.currentIndex < this.slides.length - 1) {
            this.goToSlide(this.currentIndex + 1);
        }
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    /* -------------------------------------------
       UI UPDATES
       ------------------------------------------- */
    updateNavDots() {
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }

    updateProgress() {
        const progress = document.getElementById('progress');
        if (progress) {
            progress.style.width = `${((this.currentIndex + 1) / this.slides.length) * 100}%`;
        }
    }

    updateSlideCounter() {
        const current = document.getElementById('currentSlide');
        const total = document.getElementById('totalSlides');
        if (current) current.textContent = String(this.currentIndex + 1).padStart(2, '0');
        if (total) total.textContent = String(this.slides.length).padStart(2, '0');
    }

    /* -------------------------------------------
       PARTICLE SYSTEM — floating pixel squares
       ------------------------------------------- */
    initParticles() {
        const canvas = document.getElementById('particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        const colors = ['#53d769', '#4fc3f7', '#ff9f43', '#a29bfe', '#feca57', '#ff6b6b'];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Create particles — more of them, varying sizes
        for (let i = 0; i < 55; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 5 + 1.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.3 - 0.1,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.3 + 0.04,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.03,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulseOffset: Math.random() * Math.PI * 2,
                shape: Math.random() > 0.7 ? 'diamond' : 'square'
            });
        }

        let time = 0;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.016;

            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotation += p.rotSpeed;

                // Pulsing alpha
                const pulseAlpha = p.alpha + Math.sin(time * 2 + p.pulseOffset) * 0.03;

                // Wrap around
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = Math.max(0, pulseAlpha);
                ctx.fillStyle = p.color;

                if (p.shape === 'diamond') {
                    // Diamond shape
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size);
                    ctx.lineTo(p.size * 0.7, 0);
                    ctx.lineTo(0, p.size);
                    ctx.lineTo(-p.size * 0.7, 0);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Pixel square
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                }
                ctx.restore();
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    /* -------------------------------------------
       CURSOR TRAIL — pixel sparkles following mouse
       ------------------------------------------- */
    initCursorTrail() {
        const colors = ['#53d769', '#4fc3f7', '#ff9f43', '#a29bfe', '#feca57'];
        let lastTime = 0;

        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastTime < 40) return; // Throttle
            lastTime = now;

            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = (e.clientX - 4 + (Math.random() - 0.5) * 10) + 'px';
            trail.style.top = (e.clientY - 4 + (Math.random() - 0.5) * 10) + 'px';
            trail.style.background = colors[Math.floor(Math.random() * colors.length)];
            trail.style.width = (Math.random() * 5 + 4) + 'px';
            trail.style.height = trail.style.width;
            document.body.appendChild(trail);

            setTimeout(() => trail.remove(), 600);
        });
    }

    /* -------------------------------------------
       SPARKLE WORDS — particles around .sparkle elements
       ------------------------------------------- */
    initSparkleWords() {
        const sparkles = document.querySelectorAll('.sparkle');
        const colors = ['#53d769', '#4fc3f7', '#feca57', '#ff9f43', '#a29bfe'];
        const stars = ['✦', '✧', '⭐', '✨', '★'];

        sparkles.forEach(el => {
            // Continuous sparkle loop
            const spawn = () => {
                // Only spawn if element is in viewport
                const rect = el.getBoundingClientRect();
                if (rect.top > window.innerHeight || rect.bottom < 0) {
                    setTimeout(spawn, 500);
                    return;
                }

                // Spawn a sparkle particle
                const particle = document.createElement('span');
                const isStar = Math.random() > 0.5;

                if (isStar) {
                    particle.className = 'sparkle-star';
                    particle.textContent = stars[Math.floor(Math.random() * stars.length)];
                    particle.style.color = colors[Math.floor(Math.random() * colors.length)];
                } else {
                    particle.className = 'sparkle-particle';
                    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                    const sx = (Math.random() - 0.5) * 40;
                    const sy = (Math.random() - 0.5) * 30 - 10;
                    const ex = sx * 1.8;
                    const ey = sy - 15;
                    particle.style.setProperty('--sx', sx + 'px');
                    particle.style.setProperty('--sy', sy + 'px');
                    particle.style.setProperty('--ex', ex + 'px');
                    particle.style.setProperty('--ey', ey + 'px');
                }

                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                el.appendChild(particle);

                setTimeout(() => particle.remove(), 1000);
                setTimeout(spawn, 300 + Math.random() * 500);
            };

            // Start after a delay
            setTimeout(spawn, Math.random() * 2000);
        });
    }

    /* -------------------------------------------
       CONFETTI — celebration on final slide
       ------------------------------------------- */
    fireConfetti() {
        const colors = ['#53d769', '#4fc3f7', '#ff9f43', '#a29bfe', '#feca57', '#ff6b6b'];
        const shapes = ['■', '●', '▲', '★', '♦', '◆'];
        const count = 60;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                piece.style.color = colors[Math.floor(Math.random() * colors.length)];
                piece.style.left = Math.random() * 100 + 'vw';
                piece.style.top = '-20px';
                piece.style.fontSize = (Math.random() * 16 + 8) + 'px';
                piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
                piece.style.animationDelay = '0s';
                document.body.appendChild(piece);

                setTimeout(() => piece.remove(), 4500);
            }, i * 40);
        }
    }
}

/* -------------------------------------------
   INITIALIZATION — called after slides load
   ------------------------------------------- */
function initPresentation() {
    new SlidePresentation();
}
