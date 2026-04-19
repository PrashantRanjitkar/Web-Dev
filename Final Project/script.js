// ============================================
// Theme System (Time-based + Manual Toggle)
// ============================================
const ThemeManager = {
  userOverride: null,

  init() {
    // Check localStorage for user override
    this.userOverride = localStorage.getItem('themeOverride');
    this.apply();
    // Re-check time every minute for auto-switching
    setInterval(() => this.apply(), 60000);
  },

  getTimeBasedTheme() {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'light' : 'dark';
  },

  apply() {
    const theme = this.userOverride || this.getTimeBasedTheme();
    document.documentElement.setAttribute('data-theme', theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.userOverride = next;
    localStorage.setItem('themeOverride', next);
    document.documentElement.setAttribute('data-theme', next);
  }
};
// HI SANZAY SIR!!!
// ============================================
// Digital Clocks
// ============================================
const ClockManager = {
  init() {
    this.updateClocks();
    setInterval(() => this.updateClocks(), 1000);
    // Detect user timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userTzEl = document.getElementById('userTimezone');
    if (userTzEl) userTzEl.textContent = tz;
  },

  formatTime(date) {
    let h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return { hours: String(h).padStart(2, '0'), minutes: m, seconds: s, ampm };
  },

  formatDate(date, locale) {
    return date.toLocaleDateString(locale || 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  },

  getNepalTime() {
    // Nepal is UTC+5:45
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 5.75 * 3600000);
  },

  updateClockElement(clockEl, timeData) {
    if (!clockEl) return;
    const parts = clockEl.querySelectorAll('span');
    // hours, sep, minutes, sep, seconds, ampm
    if (parts[0]) parts[0].textContent = timeData.hours;
    if (parts[2]) parts[2].textContent = timeData.minutes;
    if (parts[4]) parts[4].textContent = timeData.seconds;
    if (parts[5]) parts[5].textContent = timeData.ampm;
  },

  updateClocks() {
    // Nepal Clock
    const nepalTime = this.getNepalTime();
    const nepalData = this.formatTime(nepalTime);
    this.updateClockElement(document.getElementById('nepalClock'), nepalData);
    const nepalDateEl = document.getElementById('nepalDate');
    if (nepalDateEl) nepalDateEl.textContent = this.formatDate(nepalTime);

    // User Clock
    const userTime = new Date();
    const userData = this.formatTime(userTime);
    this.updateClockElement(document.getElementById('userClock'), userData);
    const userDateEl = document.getElementById('userDate');
    if (userDateEl) userDateEl.textContent = this.formatDate(userTime);

    // Nav mini clocks
    const navNepal = document.getElementById('navNepalClock');
    const navUser = document.getElementById('navUserClock');
    if (navNepal) navNepal.textContent = `${nepalData.hours}:${nepalData.minutes} ${nepalData.ampm}`;
    if (navUser) navUser.textContent = `${userData.hours}:${userData.minutes} ${userData.ampm}`;
  }
};

// ============================================
// Animated Background (Floating Particles + Connections)
// ============================================
const BgAnimation = {
  canvas: null,
  ctx: null,
  particles: [],
  mouse: { x: -1000, y: -1000 },
  animFrame: null,

  init() {
    this.canvas = document.getElementById('bgCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createParticles();
    this.animate();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  createParticles() {
    const count = Math.min(80, Math.floor(window.innerWidth * window.innerHeight / 15000));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  },

  getAccentColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? { r: 200, g: 255, b: 0 } : { r: 108, g: 43, b: 217 };
  },

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const accent = this.getAccentColor();
    const connectionDist = 140;

    this.particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse attraction
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        p.x += dx * 0.005;
        p.y += dy * 0.005;
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${p.opacity})`;
      this.ctx.fill();

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
        if (d < connectionDist) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.15 * (1 - d / connectionDist)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });

    this.animFrame = requestAnimationFrame(() => this.animate());
  }
};

// ============================================
// Custom Cursor
// ============================================
const CursorManager = {
  dot: null,
  ring: null,
  mouseX: 0,
  mouseY: 0,
  ringX: 0,
  ringY: 0,

  init() {
    this.dot = document.getElementById('cursorDot');
    this.ring = document.getElementById('cursorRing');
    if (!this.dot || !this.ring) return;

    // Check for touch device
    if ('ontouchstart' in window) return;

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.dot.style.left = e.clientX + 'px';
      this.dot.style.top = e.clientY + 'px';
    });

    this.animateRing();

    // Hover states
    const hoverables = document.querySelectorAll('a, button, .btn, .work-card, .skill-card, .service-card, input, textarea');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.dot.classList.add('hover');
        this.ring.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        this.dot.classList.remove('hover');
        this.ring.classList.remove('hover');
      });
    });

    // Click animation
    document.addEventListener('mousedown', () => {
      this.dot.classList.add('click');
      this.ring.classList.add('click');
    });
    document.addEventListener('mouseup', () => {
      this.dot.classList.remove('click');
      this.ring.classList.remove('click');
    });
  },

  animateRing() {
    this.ringX += (this.mouseX - this.ringX) * 0.15;
    this.ringY += (this.mouseY - this.ringY) * 0.15;
    if (this.ring) {
      this.ring.style.left = this.ringX + 'px';
      this.ring.style.top = this.ringY + 'px';
    }
    requestAnimationFrame(() => this.animateRing());
  }
};

// ============================================
// Click Ripple & Particle Burst
// ============================================
const ClickEffects = {
  container: null,

  init() {
    this.container = document.getElementById('clickRipples');
    if (!this.container) return;

    document.addEventListener('click', (e) => {
      this.createRipple(e.clientX, e.clientY);
      this.createParticles(e.clientX, e.clientY);
    });
  },

  createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = (x - 50) + 'px';
    ripple.style.top = (y - 50) + 'px';
    this.container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  },

  createParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'click-particle';
      const angle = (Math.PI * 2 / 8) * i;
      const dist = 30 + Math.random() * 30;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      // Inline animation end position
      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
      ], { duration: 500 + Math.random() * 300, easing: 'ease-out' });
      this.container.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }
  }
};

// ============================================
// Scroll Animations
// ============================================
const ScrollAnimations = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

    // Skill bars
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.skill-fill');
          if (fill) {
            const width = fill.getAttribute('data-width');
            fill.style.width = width + '%';
          }
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-card').forEach(el => skillObserver.observe(el));

    // Stat counter animation
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounters();
          statObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });

    const statsEl = document.querySelector('.hero-stats');
    if (statsEl) statObserver.observe(statsEl);
  },

  animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.getAttribute('data-count'));
      const duration = 2000;
      const start = performance.now();

      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      };

      requestAnimationFrame(update);
    });
  }
};

// ============================================
// Navbar
// ============================================
const NavManager = {
  init() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    // Scroll effect
    window.addEventListener('scroll', () => {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      }
    });

    // Hamburger toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('active');
        });
      });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
};

// ============================================
// Contact Form
// ============================================
const FormManager = {
  init() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('.submit-btn');
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending...';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          status.textContent = 'Message sent successfully! I\'ll get back to you soon.';
          status.className = 'form-status success';
          form.reset();
        } else {
          throw new Error('Failed');
        }
      } catch {
        status.textContent = 'Oops! Something went wrong. Please try again or email directly.';
        status.className = 'form-status error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send Message';
        setTimeout(() => { status.textContent = ''; }, 5000);
      }
    });
  }
};

// ============================================
// Tilt Effect on Skill Cards
// ============================================
const TiltEffect = {
  init() {
    if ('ontouchstart' in window) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;
        el.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }
};

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  ClockManager.init();
  BgAnimation.init();
  CursorManager.init();
  ClickEffects.init();
  ScrollAnimations.init();
  NavManager.init();
  FormManager.init();
  TiltEffect.init();

  // Theme toggle button
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => ThemeManager.toggle());
  }
});


//HI SANZAY SIR!!!