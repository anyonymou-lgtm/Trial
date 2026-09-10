/* ==================================================
   PRELOADER — Base circle → three particles → IEEE-RGIT atom
   --------------------------------------------------
   Single source of truth: orbitPoint(i, theta, scale)
   is used for BOTH the dot AND the trail points.
   No animateMotion. No nested <g rotate>. No dash tricks.
   ================================================== */
(function () {
    'use strict';

    /* -------------------------------------------------
       Guard: only run where a preloader exists
    ------------------------------------------------- */
    const overlay = document.getElementById('preloader');
    if (!overlay) return;

    const baseCircle = document.getElementById('preloader-base-circle');
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
       Idempotent reveal
    ------------------------------------------------- */
    let revealed = false;
    function revealSite() {
        if (revealed) return;
        revealed = true;
        overlay.classList.add('fade-out');
        if (heroContent) heroContent.classList.add('hero-ready');
        setTimeout(function () {
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden', 'true');
        }, 550);
    }

    /* -------------------------------------------------
       If critical elements are missing, reveal and bail
    ------------------------------------------------- */
    if (!baseCircle ||
        !trailEls.every(Boolean) ||
        !dotEls.every(Boolean)) {
        revealSite();
        return;
    }

    /* -------------------------------------------------
       GEOMETRY — matches the official IEEE-RGIT atom
       Three ellipses: aspect ratio ≈ 3:1, rotated by
       0°, 60°, 120° around a shared center.
       viewBox is -110 -110 220 220 → the atom fits.
    ------------------------------------------------- */
    const RX = 80;
    const RY = 28;
    const ROTATIONS = [0, Math.PI / 3, 2 * Math.PI / 3];

    /* Each particle starts at a specific angle on its
       ellipse. These starting thetas keep the three dots
       visually separated throughout the animation. */
    const START_THETAS = [
        Math.PI / 2,           // Dot 0 (rot 0)   → (0, 28)
        3 * Math.PI / 2,       // Dot 1 (rot 60)  → (24.25, -14)
        Math.PI / 2            // Dot 2 (rot 120) → (-24.25, -14)
    ];

    /* -------------------------------------------------
       THE orbit function — used by dots AND trails
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
       Easing
    ------------------------------------------------- */
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function clamp(v, lo, hi) {
        return v < lo ? lo : v > hi ? hi : v;
    }

    /* -------------------------------------------------
       Reduced motion: static final atom
    ------------------------------------------------- */
    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // Draw the three complete ellipses immediately
        const STEPS = 90;
        for (let i = 0; i < 3; i++) {
            const pts = [];
            for (let k = 0; k <= STEPS; k++) {
                const theta = START_THETAS[i] + (k / STEPS) * Math.PI * 2;
                pts.push(orbitPoint(i, theta, 1));
            }
            trailEls[i].setAttribute('d', buildTrailPath(pts));
        }
        // Base circle and dots hidden
        baseCircle.style.opacity = '0';
        dotEls.forEach(function (d) { d.style.opacity = '0'; });
        // Text visible
        if (brandEl) brandEl.classList.add('visible');
        if (taglineEl) taglineEl.classList.add('visible');
        // Fade out shortly
        setTimeout(revealSite, 900);
        return;
    }

    /* -------------------------------------------------
       Timeline (ms). Total ≈ 3.65 s.
    ------------------------------------------------- */
    const T = {
        circleIn:    [350, 850],    // base circle fade / scale in
        dotsIn:      [750, 1050],   // particles fade in
        orbit:       [1050, 2400],  // particles orbit and draw trails
        circleOut:   [1650, 2100],  // base circle fades out
        dotsOut:     [2400, 2650],  // particles fade out
        brandIn:     2550,          // "IEEE RGIT" visible
        taglineIn:   2750,          // "LEARN. EVOLVE." visible
        fadeStart:   3200           // preloader begins fade-out
    };

    /* -------------------------------------------------
       Animation state
    ------------------------------------------------- */
    const trailPoints = [[], [], []];
    const TRAIL_MAX = 400;    // safety cap

    /* Pre-position dots at their starting points so they
       don't "flash" at (0,0) before the first frame. */
    for (let i = 0; i < 3; i++) {
        const start = orbitPoint(i, START_THETAS[i], 1);
        dotEls[i].setAttribute('cx', start.x.toFixed(2));
        dotEls[i].setAttribute('cy', start.y.toFixed(2));
    }

    /* -------------------------------------------------
       Frame loop
    ------------------------------------------------- */
    let startTime = null;

    function frame(now) {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;

        /* ---------- Base circle ---------- */
        const cInT  = clamp((elapsed - T.circleIn[0]) /
                            (T.circleIn[1] - T.circleIn[0]), 0, 1);
        const cOutT = clamp((elapsed - T.circleOut[0]) /
                            (T.circleOut[1] - T.circleOut[0]), 0, 1);
        const circleOpacity = easeOutCubic(cInT) * (1 - cOutT);
        const circleScale   = 0.85 + 0.15 * easeOutCubic(cInT);
        baseCircle.style.opacity = circleOpacity.toFixed(3);
        baseCircle.setAttribute('transform', 'scale(' + circleScale.toFixed(3) + ')');

        /* ---------- Dots fade in / out ---------- */
        const dInT  = clamp((elapsed - T.dotsIn[0]) /
                            (T.dotsIn[1] - T.dotsIn[0]), 0, 1);
        const dOutT = clamp((elapsed - T.dotsOut[0]) /
                            (T.dotsOut[1] - T.dotsOut[0]), 0, 1);
        const dotOpacity = easeOutCubic(dInT) * (1 - dOutT);

        /* ---------- Orbit phase ---------- */
        if (elapsed >= T.orbit[0]) {
            const orbitT = clamp((elapsed - T.orbit[0]) /
                                 (T.orbit[1] - T.orbit[0]), 0, 1);

            // Angular progress: ease in-out over one full revolution
            const eased = easeInOutCubic(orbitT);

            // Radial scale: subtle "settle" — from 1.05 → 1.0 during first 40%
            const scaleT = clamp(orbitT / 0.4, 0, 1);
            const scale = 1.05 - 0.05 * easeOutCubic(scaleT);

            for (let i = 0; i < 3; i++) {
                // SAME function for dot AND trail
                const theta = START_THETAS[i] + eased * Math.PI * 2;
                const pt = orbitPoint(i, theta, scale);

                // Move the dot
                dotEls[i].setAttribute('cx', pt.x.toFixed(2));
                dotEls[i].setAttribute('cy', pt.y.toFixed(2));
                dotEls[i].style.opacity = dotOpacity.toFixed(3);

                // Append the same point to the trail (only while drawing)
                if (orbitT < 1) {
                    if (trailPoints[i].length >= TRAIL_MAX) {
                        trailPoints[i].shift();
                    }
                    trailPoints[i].push({ x: pt.x, y: pt.y });
                    trailEls[i].setAttribute('d', buildTrailPath(trailPoints[i]));
                }
            }
        } else {
            // Not yet orbiting — keep dots at their starting positions,
            // apply fade-in opacity.
            for (let i = 0; i < 3; i++) {
                dotEls[i].style.opacity = dotOpacity.toFixed(3);
            }
        }

        /* ---------- Text ---------- */
        if (elapsed >= T.brandIn && brandEl) {
            brandEl.classList.add('visible');
        }
        if (elapsed >= T.taglineIn && taglineEl) {
            taglineEl.classList.add('visible');
        }

        /* ---------- Fade out and stop ---------- */
        if (elapsed >= T.fadeStart) {
            revealSite();
            return;   // do not request another frame
        }

        requestAnimationFrame(frame);
    }

    /* -------------------------------------------------
       Kick off
    ------------------------------------------------- */
    requestAnimationFrame(frame);

    /* -------------------------------------------------
       Safety net — never leave the page hidden
    ------------------------------------------------- */
    setTimeout(revealSite, 6500);

})();
