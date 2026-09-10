/* ==================================================
   PRELOADER — Circle stays; three particles emerge
   inward from behind/around the circle and draw the
   IEEE-RGIT atom trails.

   ONE source of truth: orbitPoint(i, theta, scale)
   supplies BOTH the dot position AND the trail point.

   Direction is INWARD:
     • Dots start OUTSIDE the circle at ~1.5x scale.
     • They travel inward along a curved path.
     • They END at their respective final positions
       (which is where the previous version started them).
     • Trails are the exact history of the dots' path.

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
    if (!baseCircle || !trailEls.every(Boolean) || !dotEls.every(Boolean)) {
        revealSite();
        return;
    }

    /* -------------------------------------------------
       GEOMETRY — matches the official IEEE-RGIT atom
       Three ellipses ~3:1 aspect, rotated 0° / 60° / 120°.
       viewBox -110..110 keeps everything inside.
    ------------------------------------------------- */
    const RX = 78;
    const RY = 26;
    const ROTATIONS = [0, Math.PI / 3, 2 * Math.PI / 3];

    /* FINAL positions — where each dot ENDS.
       These are exactly where the previous version
       STARTED the dots. Do not change. */
    const FINAL_THETAS = [
        Math.PI / 2,          // Dot 0: ellipse rot 0°    → (0, 26)
        3 * Math.PI / 2,      // Dot 1: ellipse rot 60°   → (22.5, -13)
        Math.PI / 2           // Dot 2: ellipse rot 120°  → (-22.5, -13)
    ];

    /* Emergence start: dots begin at a larger scale and
       slightly ahead in theta so their path curves. */
    const EMERGENCE_THETA_OFFSET = Math.PI / 6;   // 30° ahead
    const EMERGENCE_SCALE = 1.55;                 // ~1.55x the final ellipse

    /* -------------------------------------------------
       THE orbit function — used by dots AND trails
    ------------------------------------------------- */
    function orbitPoint(orbitIndex, theta, scale) {
        const rot = ROTATIONS[orbitIndex];
        const lx = RX * scale * Math.cos(theta);
        const ly = RY * scale * Math.sin(theta);
        const c = Math.cos(rot);
        const s = Math.sin(rot);
        return {
            x: lx * c - ly * s,
            y: lx * s + ly * c
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
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

    /* -------------------------------------------------
       Reduced motion: skip animation, show finished atom
    ------------------------------------------------- */
    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // Draw full ellipses
        const STEPS = 90;
        for (let i = 0; i < 3; i++) {
            const pts = [];
            for (let k = 0; k <= STEPS; k++) {
                const theta = FINAL_THETAS[i] + (k / STEPS) * Math.PI * 2;
                pts.push(orbitPoint(i, theta, 1));
            }
            trailEls[i].setAttribute('d', buildTrailPath(pts));
        }
        baseCircle.style.opacity = '1';
        baseCircle.setAttribute('transform', 'scale(1)');
        dotEls.forEach(function (d) { d.style.opacity = '0'; });
        if (brandEl) brandEl.classList.add('visible');
        if (taglineEl) taglineEl.classList.add('visible');
        setTimeout(revealSite, 900);
        return;
    }

    /* -------------------------------------------------
       Timeline (ms). Total ~3.75s
       ------------------------------------------------
        0   – 250  : blank
        250 – 650  : circle fades in (stays visible)
        600 – 850  : dots fade in (at outer start positions)
        850 – 1250 : emergence — dots curve inward
        1250– 2550 : orbit — dots draw their trails
        2550– 2750 : dots settle / fade slightly
        2550       : IEEE RGIT fades in
        2750       : LEARN. EVOLVE. fades in
        3200       : preloader fade-out begins
        3750       : done
    ------------------------------------------------- */
    const T = {
        circleIn:  [250, 650],
        dotIn:     [600, 850],
        emerge:    [850, 1250],
        orbit:     [1250, 2550],
        dotSettle: [2550, 2750],
        brandIn:   2550,
        taglineIn: 2750,
        fadeStart: 3200
    };

    /* -------------------------------------------------
       Animation state
    ------------------------------------------------- */
    const trailPoints = [[], [], []];
    const TRAIL_MAX = 400;    // safety cap

    /* Pre-position dots at their outer start positions so
       there's no flash at (0,0) before the first frame. */
    for (let i = 0; i < 3; i++) {
        const start = orbitPoint(
            i,
            FINAL_THETAS[i] + EMERGENCE_THETA_OFFSET,
            EMERGENCE_SCALE
        );
        dotEls[i].setAttribute('cx', start.x.toFixed(2));
        dotEls[i].setAttribute('cy', start.y.toFixed(2));
    }

    /* -------------------------------------------------
       Frame loop
    ------------------------------------------------- */
    let startTime = null;
    let orbitClosed = [false, false, false];

    function frame(now) {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;

        /* ---------- Base circle: fade in, stay in ---------- */
        const cIn = clamp((elapsed - T.circleIn[0]) /
                          (T.circleIn[1] - T.circleIn[0]), 0, 1);
        const circleOpacity = easeOutCubic(cIn);
        const circleScale = 0.85 + 0.15 * easeOutCubic(cIn);
        baseCircle.style.opacity = circleOpacity.toFixed(3);
        baseCircle.setAttribute('transform',
            'scale(' + circleScale.toFixed(3) + ')');

        /* ---------- Dots: fade-in / settle ---------- */
        const dIn = clamp((elapsed - T.dotIn[0]) /
                          (T.dotIn[1] - T.dotIn[0]), 0, 1);
        const settle = clamp((elapsed - T.dotSettle[0]) /
                             (T.dotSettle[1] - T.dotSettle[0]), 0, 1);
        const dotOpacity = easeOutCubic(dIn) * (1 - 0.55 * settle);

        /* ---------- Motion: emergence → orbit ---------- */
        for (let i = 0; i < 3; i++) {
            let pt;

            if (elapsed < T.emerge[0]) {
                /* Before emergence: hold at outer start position */
                pt = orbitPoint(
                    i,
                    FINAL_THETAS[i] + EMERGENCE_THETA_OFFSET,
                    EMERGENCE_SCALE
                );
            } else if (elapsed < T.emerge[1]) {
                /* Emergence: curve inward from outer to final */
                const et = (elapsed - T.emerge[0]) /
                           (T.emerge[1] - T.emerge[0]);
                const e = easeInOutCubic(et);

                const theta = FINAL_THETAS[i] +
                              EMERGENCE_THETA_OFFSET * (1 - e);
                const scale = EMERGENCE_SCALE +
                              (1 - EMERGENCE_SCALE) * e;
                pt = orbitPoint(i, theta, scale);
            } else if (elapsed < T.orbit[1]) {
                /* Orbit: travel around the ellipse, drawing trail */
                const ot = (elapsed - T.orbit[0]) /
                           (T.orbit[1] - T.orbit[0]);
                const e = easeInOutCubic(ot);
                const theta = FINAL_THETAS[i] + e * Math.PI * 2;
                pt = orbitPoint(i, theta, 1);

                if (trailPoints[i].length >= TRAIL_MAX) {
                    trailPoints[i].shift();
                }
                trailPoints[i].push({ x: pt.x, y: pt.y });
                trailEls[i].setAttribute(
                    'd',
                    buildTrailPath(trailPoints[i])
                );
            } else {
                /* Orbit done: hold at final position */
                pt = orbitPoint(i, FINAL_THETAS[i], 1);

                /* Close the trail exactly once */
                if (!orbitClosed[i]) {
                    trailPoints[i].push({
                        x: pt.x,
                        y: pt.y
                    });
                    trailEls[i].setAttribute(
                        'd',
                        buildTrailPath(trailPoints[i])
                    );
                    orbitClosed[i] = true;
                }
            }

            dotEls[i].setAttribute('cx', pt.x.toFixed(2));
            dotEls[i].setAttribute('cy', pt.y.toFixed(2));
            dotEls[i].style.opacity = dotOpacity.toFixed(3);
        }

        /* ---------- Text reveals ---------- */
        if (elapsed >= T.brandIn && brandEl &&
            !brandEl.classList.contains('visible')) {
            brandEl.classList.add('visible');
        }
        if (elapsed >= T.taglineIn && taglineEl &&
            !taglineEl.classList.contains('visible')) {
            taglineEl.classList.add('visible');
        }

        /* ---------- Fade-out and stop ---------- */
        if (elapsed >= T.fadeStart) {
            revealSite();
            return;   // stop the rAF loop
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
