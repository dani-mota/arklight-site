/**
 * OKD media: pick video source by matchMedia (alternate rows mirror <picture> art direction).
 * Browsers ignore `media` on <source> inside <video>; this runs before/after HLS init.
 */
(() => {
    function buildSourcesHtml(c) {
        let html = "";
        if (c.mov) {
            html += `<source src="${c.mov}" type="${c.movMime || "video/quicktime"}" />`;
        }
        if (c.webm) {
            html += `<source src="${c.webm}" type="${c.webmMime || "video/webm"}" />`;
        }
        if (c.mp4) {
            html += `<source src="${c.mp4}" type="${c.mp4Mime || "video/mp4"}" />`;
        }
        return html;
    }

    function pickCandidate(bundle) {
        const alts = bundle.alts || [];
        for (let i = 0; i < alts.length; i++) {
            const a = alts[i];
            if (a.mq) {
                try {
                    if (window.matchMedia(a.mq).matches) {
                        return a;
                    }
                } catch (_e) {
                    /* invalid mq */
                }
            }
        }
        return bundle.default;
    }

    function applyCandidate(video, bundle, isReeval) {
        const c = pickCandidate(bundle);
        const nextHls = c.hls || "";

        if (typeof window.okdMediaHlsDestroy === "function") {
            window.okdMediaHlsDestroy(video);
        }

        while (video.firstChild) {
            video.removeChild(video.firstChild);
        }
        video.removeAttribute("src");

        if (nextHls) {
            video.setAttribute("data-okd-hls", nextHls);
        } else {
            video.removeAttribute("data-okd-hls");
        }

        const html = buildSourcesHtml(c);
        if (html) {
            video.insertAdjacentHTML("beforeend", html);
        }

        try {
            video.load();
        } catch (_e) {
            /* ignore */
        }

        if (nextHls && isReeval) {
            if (typeof window.okdMediaHlsInitVideo === "function") {
                window.okdMediaHlsInitVideo(video, { reinit: true, skipDefer: true });
            }
        } else if (!nextHls && typeof window.okdMediaHlsTryAutoplay === "function") {
            window.okdMediaHlsTryAutoplay(video);
        }
    }

    function wireVideo(video) {
        const raw = video.getAttribute("data-okd-video-candidates");
        if (!raw) {
            return;
        }
        let bundle;
        try {
            bundle = JSON.parse(raw);
        } catch (_e) {
            return;
        }
        const mqs = new Set();
        (bundle.alts || []).forEach((a) => {
            if (a.mq) {
                mqs.add(a.mq);
            }
        });

        const run = (isReeval) => {
            applyCandidate(video, bundle, !!isReeval);
        };

        run(false);

        mqs.forEach((mq) => {
            try {
                const mm = window.matchMedia(mq);
                if (mm.addEventListener) {
                    mm.addEventListener("change", () => run(true));
                } else if (mm.addListener) {
                    mm.addListener(() => run(true));
                }
            } catch (_e) {
                /* ignore */
            }
        });
        window.addEventListener("orientationchange", () => run(true));
    }

    function boot() {
        document.querySelectorAll("video[data-okd-video-candidates]").forEach(wireVideo);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
