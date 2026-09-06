document.addEventListener("DOMContentLoaded", () => {
    
    // 1. MOBILE MENU TOGGLE
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }

    // 2. DYNAMIC YEAR IN FOOTER
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 3. GENERATE GALLERY PLACEHOLDERS & LIGHTBOX
    const galleryGrid = document.getElementById('gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxCaption = document.getElementById('lightbox-caption');

    if (galleryGrid) {
        // Generate 6 placeholder items
        for (let i = 1; i <= 6; i++) {
            const item = document.createElement('div');
            item.classList.add('gallery-item', 'stagger-item'); // Add stagger class for scroll reveal
            item.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>IEEE-RGIT Moment #${i}</span>
            `;
            
            // Lightbox interaction
            item.addEventListener('click', () => {
                lightboxCaption.textContent = `IEEE-RGIT Moment #${i} - (Replace with actual image path)`;
                lightbox.classList.add('active');
            });

            galleryGrid.appendChild(item);
        }
    }

    // Close Lightbox
    if (lightboxClose && lightbox) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
        
        // Close on outside click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    // 4. SCROLL REVEAL ANIMATIONS (Intersection Observer) - NEW ADDITION
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .stagger-item');

    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px' // Triggers slightly before the element hits the viewport
        });

        revealElements.forEach(el => observer.observe(el));
    }

});
