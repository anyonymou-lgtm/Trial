/* ==================================================
   PRELOADER CONTROL LOGIC (Improved)
================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const heroContent = document.querySelector('.hero-content');
    const chipBody = document.querySelector('.chip-body');

    // --- Add background particles (if not already present) ---
    if (preloader && !preloader.querySelector('.preloader-bg')) {
        const bg = document.createElement('div');
        bg.className = 'preloader-bg';
        // Add a few dots and lines
        for (let i = 0; i < 8; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = Math.random() * 100 + '%';
            dot.style.top = Math.random() * 100 + '%';
            dot.style.animationDelay = (Math.random() * 6) + 's';
            dot.style.animationDuration = (6 + Math.random() * 6) + 's';
            bg.appendChild(dot);
        }
        for (let i = 0; i < 4; i++) {
            const line = document.createElement('div');
            line.className = 'line-bg';
            line.style.left = Math.random() * 100 + '%';
            line.style.top = Math.random() * 100 + '%';
            line.style.width = (20 + Math.random() * 40) + 'px';
            line.style.height = '1px';
            line.style.animationDelay = (Math.random() * 4) + 's';
            line.style.animationDuration = (10 + Math.random() * 8) + 's';
            bg.appendChild(line);
        }
        preloader.prepend(bg);
    }

    // --- Add the 'complete' class to chip-body after assembly ---
    if (chipBody) {
        setTimeout(() => {
            chipBody.classList.add('complete');
        }, 1400); // after assembleChip finishes (0.85s + 0.7s)
    }

    // --- Preloader fade and Hero reveal ---
    if (preloader) {
        // Total duration: chip assembly + glow + text + pause
        const preloaderDuration = 3500; // ms

        const hidePreloader = () => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
                // Reveal Hero with scale
                if (heroContent) {
                    heroContent.classList.add('hero-ready');
                }
            }, 800); // match transition duration
        };

        setTimeout(hidePreloader, preloaderDuration);
    } else {
        // Fallback: if preloader is missing, reveal hero immediately
        if (heroContent) {
            heroContent.classList.add('hero-ready');
        }
    }
});
