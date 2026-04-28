/**
 * MEDIQUICK — animations.js
 * Place <script src="assets/js/animations.js"></script>
 * (or ../assets/js/animations.js from /pages/) before </body>
 * AFTER main.js
 */

(function () {
  'use strict';

  /* ── HELPERS ──────────────────────────────────────────────── */

  /** Create an IntersectionObserver that adds a class once and disconnects */
  function onceVisible(selector, className, options = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, ...options });
    els.forEach(el => obs.observe(el));
  }

  /** Stagger a list of elements with a delay between each */
  function staggerVisible(selector, className, delayMs = 100, options = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = [...entry.target.parentElement.querySelectorAll(selector)];
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add(className), idx * delayMs);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, ...options });
    els.forEach(el => obs.observe(el));
  }

  /* ── 1. SCROLL-TRIGGERED ENTRANCE ────────────────────────── */

  // All elements with anim- classes are observed here
  const animClasses = [
    '.anim-fade-up',
    '.anim-fade-down',
    '.anim-fade-in',
    '.anim-scale-in',
    '.anim-slide-left',
    '.anim-slide-right',
    '.anim-flip-in',
  ];

  const entranceObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // honour any existing transition-delay already set in CSS/HTML
        entry.target.classList.add('is-visible');
        entranceObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animClasses.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => entranceObs.observe(el));
  });

  // Also support the existing .fade-up class from style.css (backward-compat)
  const legacyObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        legacyObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => legacyObs.observe(el));


  /* ── 2. STAGGER GROUPS ────────────────────────────────────── */

  // Cards in a grid stagger in sequence
  staggerVisible('.heuristic-card',   'is-visible', 90);
  staggerVisible('.rec-card',         'is-visible', 90);
  staggerVisible('.design-card',      'is-visible', 100);
  staggerVisible('.issue-item',       'is-visible', 80);
  staggerVisible('.timeline-item',    'is-visible', 110);
  staggerVisible('.profile-stat',     'is-visible', 80);
  staggerVisible('.doc-card',         'is-visible', 75);
  staggerVisible('.photo-placeholder','is-visible', 60);


  /* ── 3. SECTION EYEBROWS ──────────────────────────────────── */

  onceVisible('.section-eyebrow', 'is-visible');


  /* ── 4. CONSENT SECTIONS ──────────────────────────────────── */

  // Each .consent-section slides in with stagger
  const consentObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sections = [...document.querySelectorAll('.consent-section')];
        sections.forEach((sec, i) => {
          setTimeout(() => sec.classList.add('is-visible'), i * 100);
        });
        consentObs.disconnect();
      }
    });
  }, { threshold: 0.1 });
  const consentBox = document.querySelector('.consent-box');
  if (consentBox) consentObs.observe(consentBox);


  /* ── 5. SUS BAR CHART ─────────────────────────────────────── */

  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Small delay so the bar animates AFTER it's seen
        setTimeout(() => entry.target.classList.add('animated'), 150);
        barObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.sus-bar-fill').forEach(bar => barObs.observe(bar));


  /* ── 6. ANIMATED NUMBER COUNTER ───────────────────────────── */

  function animateCounter(el, target, duration = 1200) {
    const isDecimal = target % 1 !== 0;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.getAttribute('data-count');
        if (raw !== null) {
          const target = parseFloat(raw);
          animateCounter(el, target);
        }
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  // Auto-detect numeric elements to count up
  // Usage: add data-count="77.5" to any element with a number
  document.querySelectorAll('[data-count]').forEach(el => {
    el.setAttribute('data-original', el.textContent);
    el.textContent = '0';
    counterObs.observe(el);
  });

  // Also animate .score-num automatically
  document.querySelectorAll('.score-num').forEach(el => {
    const raw = parseFloat(el.textContent);
    if (!isNaN(raw)) {
      el.setAttribute('data-count', raw);
      el.textContent = '0';
      counterObs.observe(el);
    }
  });

  // And .profile-stat-num
  document.querySelectorAll('.profile-stat-num').forEach(el => {
    const raw = parseFloat(el.textContent);
    if (!isNaN(raw)) {
      el.setAttribute('data-count', raw);
      el.textContent = '0';
      counterObs.observe(el);
    }
  });


  /* ── 7. RIPPLE EFFECT ON BUTTONS / CARDS ──────────────────── */

  function addRipple(e) {
    const el = e.currentTarget;
    el.classList.add('ripple-container');
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-wave');
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  document.querySelectorAll('.card, .rec-card, .heuristic-card, .tab-btn').forEach(el => {
    el.addEventListener('click', addRipple);
  });


  /* ── 8. NAVBAR SCROLL SHRINK ──────────────────────────────── */

  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      // Shrink height slightly when scrolled
      if (y > 60) {
        navbar.style.height = '56px';
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
      } else {
        navbar.style.height = '68px';
        navbar.style.boxShadow = 'none';
      }
      // Hide on scroll down, show on scroll up
      if (y > lastY + 5 && y > 200) {
        navbar.style.transform = 'translateY(-100%)';
      } else if (y < lastY - 5) {
        navbar.style.transform = 'translateY(0)';
      }
      lastY = y;
    }, { passive: true });
    // Smooth show/hide transition for navbar
    navbar.style.transition = 'height 0.3s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease';
  }


  /* ── 9. ACTIVE SECTION HIGHLIGHTING IN NAV ────────────────── */

  const sections = document.querySelectorAll('section[id]');
  if (sections.length) {
    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle(
              'active',
              a.getAttribute('href') === `#${entry.target.id}`
            );
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => sectionObs.observe(s));
  }


  /* ── 10. SMOOTH TAB PANEL TRANSITION ─────────────────────── */

  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Extend existing tab logic with fade animation
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabPanels.forEach(p => {
        p.style.opacity = '0';
        p.style.transform = 'translateY(8px)';
      });
      const target = document.getElementById(btn.dataset.tab);
      if (target) {
        setTimeout(() => {
          target.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';

          // Re-observe any anim- elements inside the newly shown tab
          target.querySelectorAll(animClasses.join(',')).forEach(el => {
            if (!el.classList.contains('is-visible')) {
              entranceObs.observe(el);
            }
          });

          // Re-trigger bars if any in this tab
          target.querySelectorAll('.sus-bar-fill').forEach(bar => {
            if (!bar.classList.contains('animated')) {
              setTimeout(() => bar.classList.add('animated'), 200);
            }
          });

        }, 50);
      }
    });
  });

  // Set initial opacity so the active panel is visible on load
  document.querySelectorAll('.tab-panel.active').forEach(p => {
    p.style.opacity = '1';
    p.style.transform = 'translateY(0)';
  });


  /* ── 11. HOVER TILT ON HERO CARD ──────────────────────────── */

  const heroCard = document.querySelector('.hero-card');
  if (heroCard) {
    heroCard.addEventListener('mousemove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      heroCard.style.transform = `
        translateY(calc(-10px + ${y * 6}px))
        rotateY(${x * 8}deg)
        rotateX(${-y * 6}deg)
      `;
    });
    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
      heroCard.style.transform = 'translateY(-10px) rotateY(0deg) rotateX(0deg)';
      setTimeout(() => heroCard.style.transition = '', 600);
    });
    heroCard.style.transformStyle = 'preserve-3d';
    heroCard.style.willChange = 'transform';
  }


  /* ── 12. SCROLL PROGRESS BAR ──────────────────────────────── */

  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, var(--teal-dark), var(--teal-light));
    z-index: 9999;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${pct}%`;
  }, { passive: true });


  /* ── 13. FOOTER VISIBILITY TRIGGER ───────────────────────── */

  const footer = document.querySelector('footer');
  if (footer) {
    const footerObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          footer.classList.add('is-visible');
          footerObs.unobserve(footer);
        }
      });
    }, { threshold: 0.1 });
    footerObs.observe(footer);
  }


  /* ── 14. TYPING ANIMATION FOR PAGE HERO TITLES ────────────── */

  const pageHero = document.querySelector('.page-hero h1');
  if (pageHero) {
    // Already animated by CSS; add a blinking cursor briefly after
    pageHero.style.borderRight = '3px solid var(--teal-light)';
    pageHero.style.display = 'inline-block';
    setTimeout(() => {
      pageHero.style.transition = 'border-right-color 0.3s ease';
      pageHero.style.borderRightColor = 'transparent';
    }, 1800);
  }


  /* ── 15. MAGNETIC HOVER ON NAV LINKS ─────────────────────── */

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) * 0.25;
      const y = (e.clientY - rect.top  - rect.height / 2) * 0.25;
      link.style.transform = `translate(${x}px, ${y}px)`;
    });
    link.addEventListener('mouseleave', () => {
      link.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
      link.style.transform = 'translate(0, 0)';
      setTimeout(() => link.style.transition = '', 400);
    });
  });


  /* ── 16. HEURISTIC CARD NUMBER HOVER ANIMATION ────────────── */

  document.querySelectorAll('.heuristic-card').forEach(card => {
    const num = card.querySelector('.heuristic-num');
    if (!num) return;
    card.addEventListener('mouseenter', () => {
      num.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease';
      num.style.transform = 'scale(1.15) rotate(-5deg)';
    });
    card.addEventListener('mouseleave', () => {
      num.style.transform = 'scale(1) rotate(0deg)';
    });
  });


  /* ── 17. SMOOTH ANCHOR SCROLL ─────────────────────────────── */

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── 18. HAMBURGER MENU ANIMATION ─────────────────────────── */

  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const spans = hamburger.querySelectorAll('span');
      const isOpen = hamburger.classList.toggle('is-open');
      if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
      }
      spans.forEach(s => s.style.transition = 'transform 0.3s ease, opacity 0.3s ease');
    });
  }


  /* ── 19. DOC CARD ICON BOUNCE ─────────────────────────────── */

  document.querySelectorAll('.doc-card').forEach(card => {
    const icon = card.querySelector('.doc-icon');
    if (!icon) return;
    card.addEventListener('mouseenter', () => {
      icon.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
      icon.style.transform = 'scale(1.2) rotate(8deg)';
    });
    card.addEventListener('mouseleave', () => {
      icon.style.transform = 'scale(1) rotate(0deg)';
    });
  });


  /* ── 20. PAGE LOAD COMPLETE ───────────────────────────────── */

  window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });

  // Add class to body so CSS can target post-load state
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');
  });

})();
