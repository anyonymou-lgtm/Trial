document.addEventListener("DOMContentLoaded", () => {

    // --- 1. MOBILE MENU (unchanged) ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }

    // --- 2. DYNAMIC YEAR (unchanged) ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- 3. GALLERY & LIGHTBOX (unchanged) ---
    const galleryGrid = document.getElementById('gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxCaption = document.getElementById('lightbox-caption');
    if (galleryGrid) {
        for (let i = 1; i <= 6; i++) {
            const item = document.createElement('div');
            item.classList.add('gallery-item', 'stagger-item');
            item.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>IEEE-RGIT Moment #${i}</span>
            `;
            item.addEventListener('click', () => {
                lightboxCaption.textContent = `IEEE-RGIT Moment #${i} - (Replace with actual image path)`;
                lightbox.classList.add('active');
            });
            galleryGrid.appendChild(item);
        }
    }
    if (lightboxClose && lightbox) {
        lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });
    }

    // --- 4. HERO SEQUENCE (NEW) ---
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        // Wait for preloader to finish (already hidden), then trigger hero
        // We'll add a small delay to ensure preloader fade-out is complete
        setTimeout(() => {
            heroContent.classList.add('hero-ready');
        }, 200); // slightly after preloader disappears (preloader hides at ~3200ms + 800ms fade)
    }

    // --- 5. NAVBAR SCROLL EFFECT (NEW) ---
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // --- 6. MOUSE TRACKING FOR CARD HOVER HIGHLIGHT (NEW) ---
    const cards = document.querySelectorAll('.hover-lift, .hover-glow');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
        // Remove custom properties on mouse leave to avoid stale values
        card.addEventListener('mouseleave', () => {
            card.style.removeProperty('--mouse-x');
            card.style.removeProperty('--mouse-y');
        });
    });

    // --- 7. SCROLL REVEAL – UPGRADED INTERSECTION OBSERVER (IMPROVED) ---
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .stagger-item');

    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    // Optionally unobserve after reveal to save resources
                    // observer.unobserve(entry.target); // uncomment if you want one-time reveals
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -30px 0px' // slightly earlier trigger
        });

        revealElements.forEach(el => observer.observe(el));
    }

    // --- 8. REDUCED MOTION PREFERENCE – disable animations if needed (NEW) ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        // Remove all animation classes that cause movement
        document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .stagger-item')
            .forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.transition = 'none';
            });
        // Also disable hero sequence
        const hero = document.querySelector('.hero-content');
        if (hero) hero.classList.add('hero-ready');
        // Remove preloader animation? We'll keep it but reduce effect
        document.querySelectorAll('.circuit-dot').forEach(d => d.style.animation = 'none');
    }
});
