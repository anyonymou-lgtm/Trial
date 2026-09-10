/* ==================================================
   PRELOADER CONTROL LOGIC
   Three-Dot Orbit → IEEE-RGIT Logo → Hero Reveal
================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const heroContent = document.querySelector('.hero-content');

    // If no preloader exists, reveal the hero immediately
    if (!preloader) {
        if (heroContent) heroContent.classList.add('hero-ready');
        return;
    }

    // Respect user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Total time before fade-out begins (matches CSS animation timeline)
    const waitDuration = prefersReducedMotion ? 800 : 3300;
    const fadeDuration = 500;

    const removePreloader = () => {
        // Trigger fade-out on the overlay
        preloader.classList.add('fade-out');

        // Reveal the hero at the same time — smooth overlapping transition
        if (heroContent) {
            heroContent.classList.add('hero-ready');
        }

        // Fully remove the preloader after fade completes
        setTimeout(() => {
            preloader.style.display = 'none';
            preloader.setAttribute('aria-hidden', 'true');
        }, fadeDuration);
    };

    setTimeout(removePreloader, waitDuration);
});
