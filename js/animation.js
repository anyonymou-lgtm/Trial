/* ==================================================
   PRELOADER CONTROL LOGIC
================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const heroContent = document.querySelector('.hero-content');

    if (preloader) {
        const preloaderDuration = 3200;

        const hidePreloader = () => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
                // After preloader is hidden, reveal the hero content
                if (heroContent) {
                    heroContent.classList.add('hero-ready');
                }
            }, 800);
        };

        setTimeout(hidePreloader, preloaderDuration);
    } else {
        // Fallback: if preloader is missing, reveal hero immediately
        if (heroContent) {
            heroContent.classList.add('hero-ready');
        }
    }
});
