class SlidePresentation {
  constructor(slides) {
    this.data = slides;
    this.container = document.getElementById('slides-container');
    this.progress = document.getElementById('progress');
    this.currentLabel = document.getElementById('currentSlide');
    this.totalLabel = document.getElementById('totalSlides');
    this.jumpOverlay = document.getElementById('jumpOverlay');
    this.chapterNav = document.getElementById('chapterNav');
    this.currentIndex = 0;
    this.locked = false;
    this.scrollFrame = null;

    this.render();
    this.slides = [...document.querySelectorAll('.slide')];
    this.totalLabel.textContent = String(this.slides.length).padStart(2, '0');
    this.createChapterNavigation();
    this.bindEvents();
    this.observeSlides();
    this.update(0);
  }

  render() {
    this.container.innerHTML = this.data.map((slide, index) => `
      <section class="slide layout-${slide.layout || 'claim'}" data-index="${index}" data-chapter="${slide.chapter}">
        <div class="slide-content">
          ${slide.kicker ? `<p class="context reveal">${slide.kicker}</p>` : ''}
          ${slide.html}
        </div>
      </section>
    `).join('\n');
  }

  createChapterNavigation() {
    const chapters = [];
    this.data.forEach((slide, index) => {
      if (!chapters.some(chapter => chapter.name === slide.chapter)) {
        chapters.push({
          name: slide.chapter,
          index,
          title: slide.chapterDescription || slide.title
        });
      }
    });

    this.chapterNav.innerHTML = chapters.map((chapter, index) => `
      <button data-index="${chapter.index}">
        <strong>${String(index + 1).padStart(2, '0')} · ${chapter.name}</strong>
        <span>${chapter.title || ''}</span>
      </button>
    `).join('');

    this.chapterNav.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        this.closeOverlay();
        this.goTo(Number(button.dataset.index));
      });
    });
  }

  bindEvents() {
    document.addEventListener('keydown', event => {
      const key = event.key;

      if (this.jumpOverlay.open) {
        if (key === 'Escape') this.closeOverlay();
        return;
      }

      if (key === 'g' || key === 'G') {
        event.preventDefault();
        this.openOverlay();
        return;
      }

      if (key === 'r' || key === 'R') {
        event.preventDefault();
        this.replay();
        return;
      }

      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(key)) {
        event.preventDefault();
        this.next();
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(key)) {
        event.preventDefault();
        this.previous();
      } else if (key === 'Home') {
        event.preventDefault();
        this.goTo(0);
      } else if (key === 'End') {
        event.preventDefault();
        this.goTo(this.slides.length - 1);
      }
    });

    document.getElementById('closeOverlay').addEventListener('click', () => this.closeOverlay());
    this.jumpOverlay.addEventListener('click', event => {
      if (event.target === this.jumpOverlay) this.closeOverlay();
    });

    window.addEventListener('scroll', () => {
      if (this.scrollFrame !== null) return;
      this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = null;
        this.syncCurrentSlide();
      });
    }, { passive: true });

    let touchStartY = 0;
    document.addEventListener('touchstart', event => {
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', event => {
      const delta = touchStartY - event.changedTouches[0].clientY;
      if (Math.abs(delta) > 60) delta > 0 ? this.next() : this.previous();
    }, { passive: true });
  }

  observeSlides() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.58 });

    this.slides.forEach(slide => observer.observe(slide));
  }

  syncCurrentSlide() {
    if (this.locked) return;
    let closestIndex = this.currentIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    this.slides.forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().top);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== this.currentIndex) this.update(closestIndex);
  }

  update(index) {
    if (index !== this.currentIndex) this.slides[this.currentIndex].classList.remove('active');
    this.currentIndex = index;
    this.slides[index].classList.add('active', 'visible');
    this.currentLabel.textContent = String(index + 1).padStart(2, '0');
    this.progress.style.width = `${((index + 1) / this.slides.length) * 100}%`;
  }

  replay() {
    const slide = this.slides[this.currentIndex];
    slide.classList.remove('active');
    // Commit the inactive style so finite animations restart on the same slide.
    void slide.offsetWidth;
    slide.classList.add('active');
  }

  goTo(index) {
    if (index < 0 || index >= this.slides.length || this.locked) return;
    const animateScroll = Math.abs(index - this.currentIndex) === 1 &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.locked = true;
    this.update(index);
    this.slides[index].scrollIntoView({ behavior: animateScroll ? 'smooth' : 'auto', block: 'start' });
    setTimeout(() => {
      this.locked = false;
      this.syncCurrentSlide();
    }, animateScroll ? 650 : 100);
  }

  next() {
    this.goTo(Math.min(this.currentIndex + 1, this.slides.length - 1));
  }

  previous() {
    this.goTo(Math.max(this.currentIndex - 1, 0));
  }

  openOverlay() {
    this.jumpOverlay.showModal();
  }

  closeOverlay() {
    if (this.jumpOverlay.open) this.jumpOverlay.close();
  }

}

document.addEventListener('DOMContentLoaded', () => {
  if (!Array.isArray(window.SLIDES)) {
    document.getElementById('slides-container').innerHTML = `
      <section class="slide">
        <div class="slide-content">
          <h1>Slides failed to load.</h1>
          <p>Check <code>slides.js</code> and reload.</p>
        </div>
      </section>
    `;
    return;
  }

  new SlidePresentation(window.SLIDES);
});
