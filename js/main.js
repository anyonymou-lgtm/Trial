document.addEventListener("DOMContentLoaded", () => {
    
    // 1. MOBILE MENU TOGGLE
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

    // 2. DYNAMIC YEAR IN FOOTER
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 3. GENERATE HOMEPAGE GALLERY WITH REAL IMAGES & LIGHTBOX
    const galleryGrid = document.getElementById('gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');

    // Only run on the homepage (where #gallery-grid exists)
    if (galleryGrid) {
        // Use the same 6 real images from assets/gallery/
        const imagePaths = [
            'assets/gallery/p1.jpg',
            'assets/gallery/p2.jpg',
            'assets/gallery/p3.jpg',
            'assets/gallery/p4.jpg',
            'assets/gallery/p5.jpg',
            'assets/gallery/p6.jpg'
        ];

        imagePaths.forEach((src, index) => {
            const item = document.createElement('div');
            item.classList.add('gallery-item', 'stagger-item');
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Gallery Image ' + (index + 1);
            img.loading = 'lazy';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            item.appendChild(img);

            // Open lightbox on click
            item.addEventListener('click', () => {
                if (lightboxImage && lightboxCaption && lightbox) {
                    lightboxImage.src = src;
                    lightboxCaption.textContent = 'Gallery Image ' + (index + 1);
                    lightbox.classList.add('active');
                }
            });

            galleryGrid.appendChild(item);
        });
    }

    // Close Lightbox (shared between homepage and gallery page)
    if (lightboxClose && lightbox) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    // Escape key closes lightbox (global)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
        }
    });

    // 4. SCROLL REVEAL ANIMATIONS
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
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

});
