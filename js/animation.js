/* ==================================================
   PRELOADER CONTROL LOGIC
================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');

    if (preloader) {
        const preloaderDuration = 3200;

        const hidePreloader = () => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 800);
        };

        setTimeout(hidePreloader, preloaderDuration);
    }
});
