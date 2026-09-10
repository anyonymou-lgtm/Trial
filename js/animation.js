/* ==================================================
   PRELOADER — Particles draw the IEEE-RGIT atom
   --------------------------------------------------
   Single source of truth: `orbitPoint(i, theta, scale)`
   is used for BOTH the moving dot AND the trail points.
   The trail is literally the array of points the dot
   has visited — so they can never desync.

   No animateMotion.
   No nested rotating <g> groups.
   No dasharray/dashoffset trickery.
   No arc commands.
   One SVG coordinate system (viewBox: -110 -110 220 220).
   ================================================== */
(function () {
    'use strict';

    /* -------------------------------------------------
       Guard: only run on the page that has a preloader
    ------------------------------------------------- */
    const overlay = document.getElementById('preloader');
    if (!overlay) return;

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
    const brandEl   = overlay.querySelector('.preloader-brand');
    const taglineEl = overlay.querySelector('.preloader-tagline');
    const heroContent = document.querySelector('.hero-content');

    /* -------------------------------------------------
       Idempotent reveal — can be called only once
    ------------------------------------------------- */
    let revealed = false;
    function revealSite() {
        if (revealed) return;
        revealed = true;

        overlay.classList.add('fade-out');

        // Reveal the existing Hero via its existing ready state
        if (heroContent) heroContent.classList.add('hero-ready');

        // After the CSS transition finishes, remove the overlay entirely
        setTimeout(function () {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
        }, 500);
    }

    /* -------------------------------------------------
       If required elements are missing, just reveal
    ------------------------------------------------- */
    if (!trailEls.every(Boolean) || !dotEls.every(Boolean)) {
        revealSite();
        return;
    }

    /* -------------------------------------------------
       Geometry — ONE source of truth
       The IEEE-RGIT logo has three ellipses rotated
       at roughly 0°, 60°, 120°. Aspect ratio ~2.9:1.
    ------------------------------------------------- */
    const RX = 88;
    const RY = 30;
    const ROTATIONS = [0, Math.PI / 3, 2 * Math.PI / 3];

    /* Entry positions for the three particles (off-screen) */
    const ENTRY_POSITIONS = [
        { x: -260, y: -190 },
        { x:  260, y: -160 },
        { x:    0, y:  260 }
    ];

    /* -------------------------------------------------
       Timing (ms)
    ------------------------------------------------- */
    const ENTRY_END   = 500;
    const ORBIT_END   = 2000;   // orbit phase length = 1500ms
    const REVEAL_AT   = 3100;   // when the fade-out begins
    const FADE_HOLD   = 500;    // matches the CSS transition on .fade-out

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
       Returns the exact { x, y } for a given orbit
       index, angular position theta, and radial scale.
    ------------------------------------------------- */
    function orbitPoint(orbitIndex, theta, scale) {
        const rot = ROTATIONS[orbitIndex];
        const lx = RX * scale * Math.cos(theta);
        const ly = RY * scale * Math.sin(theta);
        const cosR = Math.cos(rot);
        const sinR = Math.sin(rot);
        return {
            x: lx * cosR - ly * sinR,
            y: lx * sinR + ly * cosR
        };
    }

    /* -------------------------------------------------
       Trail path builder — line segments only
    ------------------------------------------------- */
    function buildTrailPath(points) {
        if (!points.length) return '';
        let d = 'M' + points[0].x.toFixed(2) + ' ' + points[0].y.toFixed(2);
        for (let i = 1; i < points.length; i++) {
            d += ' L' + points[i].x.toFixed(2) + ' ' + points[i].y.toFixed(2);
        }
        return d;
    }

    /* -------------------------------------------------
       Reduced motion: show completed atom immediately
    ------------------------------------------------- */
    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // Draw the three complete ellipses
        const STEPS = 80;
        for (let i = 0; i < 3; i++) {
            const pts = [];
            for (let k = 0; k <= STEPS; k++) {
                pts.push(orbitPoint(i, (k / STEPS) * Math.PI * 2, 1));
            }
            trailEls[i].setAttribute('d', buildTrailPath(pts));
        }
        // Hide dots
        dotEls.forEach(function (d) { d.style.opacity = '0'; });
        // Show text
        if (brandEl) brandEl.classList.add('visible');
        if (taglineEl) taglineEl.classList.add('visible');
        // Reveal the site after a short pause
        setTimeout(revealSite, 900);
        return;
    }

    /* -------------------------------------------------
       Set initial dot positions off-screen
    ------------------------------------------------- */
    for (let i = 0; i < 3; i++) {
        dotEls[i].setAttribute('cx', ENTRY_POSITIONS[i].x);
        dotEls[i].setAttribute('cy', ENTRY_POSITIONS[i].y);
    }

    /* -------------------------------------------------
       Animation state
       trailPoints[i] holds every point the i-th dot has
       ever occupied. The trail is literally this array.
    ------------------------------------------------- */
    const trailPoints = [[], [], []];
    const TRAIL_MAX = 400;   // safety cap (60fps * 1.5s ≈ 90 points needed)

    /* -------------------------------------------------
       Frame loop
    ------------------------------------------------- */
    let startTime = null;
    let orbitStartTime = null;
    let phase = 'entrance';

    function frame(now) {
        if (startTime === null) startTime = now;

        /* ============ PHASE 1: ENTRANCE ============ */
        if (phase === 'entrance') {
            const t = Math.min(now - startTime, ENTRY_END);
            const p = easeOutCubic(t / ENTRY_END);

            for (let i = 0; i < 3; i++) {
                const from = ENTRY_POSITIONS[i];
                const x = from.x * (1 - p);
                const y = from.y * (1 - p);
                dotEls[i].setAttribute('cx', x.toFixed(2));
                dotEls[i].setAttribute('cy', y.toFixed(2));
            }

            if (t >= ENTRY_END) {
                phase = 'orbit';
                orbitStartTime = now;
            }
            requestAnimationFrame(frame);
            return;
        }

        /* ============ PHASE 2: ORBIT / DRAW ============ */
        if (phase === 'orbit') {
            const elapsed = now - orbitStartTime;
            const t = Math.min(elapsed / (ORBIT_END - ENTRY_END), 1);

            // Ease the angular progress a bit for a smooth start
            const eased = easeInOutCubic(t);
            const theta = eased * Math.PI * 2;

            // Scale ramps 0 → 1 quickly at the start of the orbit
            const scale = Math.min(t / 0.15, 1);

            for (let i = 0; i < 3; i++) {
                // THE single function that drives both dot AND trail
                const pt = orbitPoint(i, theta, scale);

                // Move the dot
                dotEls[i].setAttribute('cx', pt.x.toFixed(2));
                dotEls[i].setAttribute('cy', pt.y.toFixed(2));

                // Append the exact same point to the trail
                if (trailPoints[i].length < TRAIL_MAX) {
                    trailPoints[i].push({ x: pt.x, y: pt.y });
                } else {
                    // Replace oldest with newest to keep drawing
                    trailPoints[i].shift();
                    trailPoints[i].push({ x: pt.x, y: pt.y });
                }

                // Rebuild the trail path from the collected points
                trailEls[i].setAttribute('d', buildTrailPath(trailPoints[i]));
            }

            if (t >= 1) {
                phase = 'done';
                // Do not request another frame
                return;
            }
            requestAnimationFrame(frame);
            return;
        }
    }

    /* -------------------------------------------------
       Kick off the animation
    ------------------------------------------------- */
    requestAnimationFrame(frame);

    /* -------------------------------------------------
       Scheduled reveals (independent of the frame loop)
       Timeline:
         0     – 500   : dots enter
         500   – 2000  : dots orbit and draw trails
         2000  – 2400  : dots fade out (CSS transition)
         2000  – 2500  : "IEEE RGIT" fades in
         2200  – 2700  : "LEARN. EVOLVE." fades in
         3100  – 3600  : whole preloader fades away
    ------------------------------------------------- */
    setTimeout(function () {
        dotEls.forEach(function (d) { d.style.opacity = '0'; });
        if (brandEl) brandEl.classList.add('visible');
    }, 2000);

    setTimeout(function () {
        if (taglineEl) taglineEl.classList.add('visible');
    }, 2200);

    setTimeout(revealSite, 3100);

    /* -------------------------------------------------
       Safety net — never leave the page hidden
    ------------------------------------------------- */
    setTimeout(revealSite, 6500);

})();
