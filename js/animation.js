/* ==================================================
   PRELOADER — Frame-by-Frame Orbital Atom
   ------------------------------------------------
   Single source of truth: `orbitPoint(i, theta, scale)`
   is used for BOTH the dot position and the trail points.
   The trail is literally the array of points the dot
   has visited — so it can never desync.
================================================== */
(function () {
    'use strict';

    /* -------------------------------------------------
       Guard: only run if the preloader exists
    ------------------------------------------------- */
    const overlay = document.getElementById('preloader');
    if (!overlay) return;

    const svg      = document.getElementById('preloader-svg');
    const trailEls = [
        document.getElementById('preloader-trail-0'),
        document.getElementById('preloader-trail-1'),
        document.getElementById('preloader-trail-2')
    ];
    const dotEls = [
        document.getElementById('preloader-dot-0'),
        document.getElementById('preloader-dot-1'),
        document.getElementById('preloader-dot-2')
    ];
    const textEl      = overlay.querySelector('.preloader-text');
    const heroContent = document.querySelector('.hero-content');

    /* -------------------------------------------------
       Idempotent reveal (called once, from anywhere)
    ------------------------------------------------- */
    let revealed = false;
    const FADE_DURATION = 500;

    function revealSite() {
        if (revealed) return;
        revealed = true;
        overlay.classList.add('fade-out');
        if (heroContent) heroContent.classList.add('hero-ready');
        setTimeout(function () {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
        }, FADE_DURATION);
    }

    /* -------------------------------------------------
       If required elements are missing, just reveal
    ------------------------------------------------- */
    if (!svg || trailEls.some(function (el) { return !el; }) ||
        dotEls.some(function (el) { return !el; })) {
        revealSite();
        return;
    }

    /* -------------------------------------------------
       Geometry — single source of truth
    ------------------------------------------------- */
    const RX = 88;
    const RY = 30;
    const ROTATIONS = [0, Math.PI / 3, 2 * Math.PI / 3]; // 0°, 60°, 120°

    const ENTRY_POSITIONS = [
        { x: -260, y: -190 },
        { x:  260, y: -160 },
        { x:    0, y:  260 }
    ];

    /* -------------------------------------------------
       Timing (ms)
    ------------------------------------------------- */
    const ENTRY_DURATION = 550;
    const ORBIT_DURATION = 1700;
    const HOLD_DURATION  = 700;

    /* -------------------------------------------------
       Easing
    ------------------------------------------------- */
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /* -------------------------------------------------
       THE orbit function — used by dots AND trails
    ------------------------------------------------- */
    function orbitPoint(orbitIndex, theta, scale) {
        const rotation = ROTATIONS[orbitIndex];
        const lx = RX * scale * Math.cos(theta);
        const ly = RY * scale * Math.sin(theta);
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        return {
            x: lx * cosR - ly * sinR,
            y: lx * sinR + ly * cosR
        };
    }

    /* -------------------------------------------------
       Path builder — line segments only (no arcs)
    ------------------------------------------------- */
    function pointsToPath(points) {
        if (!points.length) return '';
        let d = 'M ' + points[0].x.toFixed(2) + ' ' + points[0].y.toFixed(2);
        for (let i = 1; i < points.length; i++) {
            d += ' L ' + points[i].x.toFixed(2) + ' ' + points[i].y.toFixed(2);
        }
        return d;
    }

    /* -------------------------------------------------
       Reduced motion: skip animation, show final logo
    ------------------------------------------------- */
    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        const STEPS = 90;
        for (let i = 0; i < 3; i++) {
            const pts = [];
            for (let k = 0; k <= STEPS; k++) {
                const theta = (k / STEPS) * Math.PI * 2;
                pts.push(orbitPoint(i, theta, 1));
            }
            trailEls[i].setAttribute('d', pointsToPath(pts));
            trailEls[i].style.opacity = '0.75';
            dotEls[i].style.opacity = '0';
        }
        if (textEl) textEl.classList.add('visible');
        setTimeout(revealSite, 700);
        return;
    }

    /* -------------------------------------------------
       Set initial dot positions (before first paint of rAF)
    ------------------------------------------------- */
    for (let i = 0; i < 3; i++) {
        dotEls[i].setAttribute('cx', ENTRY_POSITIONS[i].x);
        dotEls[i].setAttribute('cy', ENTRY_POSITIONS[i].y);
    }

    /* -------------------------------------------------
       Animation state
    ------------------------------------------------- */
    const trailPoints = [[], [], []];
    let phase = 'entrance';
    let startTime = null;
    let orbitStartTime = null;

    /* -------------------------------------------------
       Frame loop
    ------------------------------------------------- */
    function animate(now) {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;

        /* ---------- PHASE 1: ENTRANCE ---------- */
        if (phase === 'entrance') {
            const t = Math.min(elapsed / ENTRY_DURATION, 1);
            const e = easeOutCubic(t);

            for (let i = 0; i < 3; i++) {
                const from = ENTRY_POSITIONS[i];
                const x = from.x * (1 - e);
                const y = from.y * (1 - e);
                dotEls[i].setAttribute('cx', x.toFixed(2));
                dotEls[i].setAttribute('cy', y.toFixed(2));
            }

            if (t >= 1) {
                phase = 'orbit';
                orbitStartTime = now;
            }
            requestAnimationFrame(animate);
            return;
        }

        /* ---------- PHASE 2: ORBIT ---------- */
        if (phase === 'orbit') {
            const t = Math.min((now - orbitStartTime) / ORBIT_DURATION, 1);
            const e = easeInOutCubic(t);
            const theta = e * Math.PI * 2;
            // Scale ramps 0 → 1 during first 25% of the orbit
            const scale = Math.min(t * 4, 1);

            for (let i = 0; i < 3; i++) {
                // ← SAME function used for dot AND trail
                const p = orbitPoint(i, theta, scale);

                // 1. Update dot position
                dotEls[i].setAttribute('cx', p.x.toFixed(2));
                dotEls[i].setAttribute('cy', p.y.toFixed(2));

                // 2. Push the exact same point into the trail array
                trailPoints[i].push({ x: p.x, y: p.y });

                // 3. Rebuild the trail path from those points
                trailEls[i].setAttribute('d', pointsToPath(trailPoints[i]));
                trailEls[i].style.opacity =
                    Math.min(0.75, scale * 0.75).toFixed(2);
            }

            if (t >= 1) {
                phase = 'done';

                // Fade the dots out (CSS transition handles the fade)
                for (let i = 0; i < 3; i++) {
                    dotEls[i].style.opacity = '0';
                }

                // Reveal the brand text after a short beat
                setTimeout(function () {
                    if (textEl) textEl.classList.add('visible');
                }, 120);

                // After the hold, fade the preloader away
                setTimeout(revealSite, HOLD_DURATION);
            }
            requestAnimationFrame(animate);
            return;
        }

        /* phase === 'done' — no further frames */
    }

    /* -------------------------------------------------
       Safety fallback: never leave the site hidden
    ------------------------------------------------- */
    setTimeout(revealSite, 6000);

    /* -------------------------------------------------
       Kick off
    ------------------------------------------------- */
    requestAnimationFrame(animate);

})();
