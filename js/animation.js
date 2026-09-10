/* ==================================================
   PRELOADER CONTROL LOGIC
   Three-Dot Orbit → IEEE-RGIT Logo → Hero Reveal
================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const heroContent = document.querySelector('.hero-content');

    // Respect reduced-motion: shorten preloader, no long animation
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Total time before the fade-out begins
    // 2.9s for the full dot + logo animation (matches CSS)
    // Reduced motion: quick handoff
    const preloaderDuration = prefersReducedMotion ? 800 : 2900;
    const fadeDuration = 600;

    if (preloader) {
        const hidePreloader = () => {
            // Fade the preloader out
            preloader.classList.add('fade-out');

            // Reveal the hero at the same time (smooth overlap)
            if (heroContent) {
                heroContent.classList.add('hero-ready');
            }

            // Fully remove the preloader after the fade completes
            setTimeout(() => {
                preloader.style.display = 'none';
                preloader.setAttribute('aria-hidden', 'true');
            }, fadeDuration);
        };

        setTimeout(hidePreloader, preloaderDuration);
    } else {
        // Fallback: no preloader found — just reveal the hero immediately
        if (heroContent) {
            heroContent.classList.add('hero-ready');
        }
    }
});
