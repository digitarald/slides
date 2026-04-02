/* ===========================================
   SLIDE PRESENTATION CONTROLLER
   Navigation, animations, progress, keyboard/touch/wheel
   =========================================== */

class SlidePresentation {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentIndex = 0;
        this.isAnimating = false;
        this.touchStartY = 0;

        this.init();
    }

    init() {
        this.createNavDots();
        this.setupIntersectionObserver();
        this.bindEvents();
        this.updateProgress();
        this.updateSlideCounter();

        // Mark first slide visible immediately
        if (this.slides[0]) {
            this.slides[0].classList.add('visible');
        }
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
       INTERSECTION OBSERVER — trigger .visible
       ------------------------------------------- */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.currentIndex = Array.from(this.slides).indexOf(entry.target);
                    this.updateNavDots();
                    this.updateProgress();
                    this.updateSlideCounter();
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
}

/* -------------------------------------------
   INITIALIZATION — called after slides load
   ------------------------------------------- */
function initPresentation() {
    new SlidePresentation();
}
