/**
 * Global: smooth-scroll for `a[data-scroll-to]` (hash URLs stamped by `okd_create_button()`).
 *
 * Uses Lenis when available (`window.okdLenis`), with header-offset clearance and a native
 * smooth-scroll fallback. Clicks inside `.header_mobile` are skipped so the drawer can close
 * first and restart Lenis before scrolling (see header/script.js).
 *
 * `getHeaderOffsetPx` lives here (not in `utils.js`) so new modules are not blocked when a CDN
 * serves a long-cached copy of the older utils file without that export.
 */

import { prefersReducedMotion } from "/wp-content/themes/okd/blockstudio/assets/js/utils.js";

/**
 * Sticky header height in pixels (`--okd-header-inline-height` from the theme).
 * Used as a negative Lenis/native scroll offset so section headings clear the bar.
 *
 * Kept in this module (not `utils.js`) because theme source JS is served with multi-year CDN
 * cache. Mutating `utils.js` in place left production on a stale copy without new exports,
 * which broke every importer of this file (and thus `global-scripts` / Lenis / scroll reveal).
 *
 * @returns {number}
 */
export function getHeaderOffsetPx() {
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--okd-header-inline-height")
        .trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 80;
}

const LENIS_SCROLL_DURATION = 1;

/**
 * Scroll an element into view, clearing the sticky header.
 *
 * @param {HTMLElement} el
 * @param {{ duration?: number }} [options]
 * @returns {void}
 */
export function scrollToAnchorTarget(el, options = {}) {
    if (!(el instanceof HTMLElement)) {
        return;
    }

    const duration =
        Number.isFinite(options.duration) && options.duration > 0
            ? options.duration
            : LENIS_SCROLL_DURATION;
    const offset = -1 * getHeaderOffsetPx();

    if (prefersReducedMotion()) {
        const y = window.scrollY + el.getBoundingClientRect().top + offset;
        window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
        return;
    }

    const lenis = window.okdLenis;
    if (lenis && typeof lenis.scrollTo === "function") {
        try {
            lenis.scrollTo(el, { duration, offset });
            return;
        } catch (_e) {
            // Fall through to native smooth scroll.
        }
    }

    const y = window.scrollY + el.getBoundingClientRect().top + offset;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

/**
 * Resolve the in-document target for a hash href (`#id` or `/path#id`).
 *
 * @param {string} href
 * @returns {HTMLElement|null}
 */
function resolveHashTarget(href) {
    const raw = String(href || "").trim();
    if (!raw) {
        return null;
    }

    let hash = "";
    if (raw.startsWith("#")) {
        hash = raw.slice(1);
    } else {
        try {
            const url = new URL(raw, window.location.href);
            if (url.origin !== window.location.origin) {
                return null;
            }
            if (url.pathname !== window.location.pathname) {
                return null;
            }
            hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
        } catch (_e) {
            return null;
        }
    }

    if (!hash) {
        return null;
    }

    let decoded = hash;
    try {
        decoded = decodeURIComponent(hash);
    } catch (_e) {
        decoded = hash;
    }

    const byId = document.getElementById(decoded);
    if (byId instanceof HTMLElement) {
        return byId;
    }

    try {
        const byName = document.querySelector(`[name="${CSS.escape(decoded)}"]`);
        if (byName instanceof HTMLElement) {
            return byName;
        }
    } catch (_e) {
        // Invalid selector characters — ignore.
    }

    return null;
}

/**
 * Move focus to the scrolled target for keyboard / screen-reader users.
 *
 * @param {HTMLElement} el
 * @returns {void}
 */
function focusAnchorTarget(el) {
    if (!(el instanceof HTMLElement)) {
        return;
    }

    if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "-1");
    }

    try {
        el.focus({ preventScroll: true });
    } catch (_e) {
        el.focus();
    }
}

/**
 * Update the URL hash without triggering a native jump.
 *
 * @param {string} hash Without leading `#`.
 * @returns {void}
 */
function setHashWithoutJump(hash) {
    if (!hash || typeof history.pushState !== "function") {
        return;
    }

    const next = `${window.location.pathname}${window.location.search}#${hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next === current) {
        return;
    }

    history.pushState(null, "", `#${hash}`);
}

/**
 * @param {MouseEvent} event
 * @returns {boolean}
 */
function isModifiedClick(event) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

/**
 * Delegated click handler for `a[data-scroll-to]`.
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function onScrollToClick(event) {
    if (!(event.target instanceof Element)) {
        return;
    }

    const link = event.target.closest("a[data-scroll-to]");
    if (!(link instanceof HTMLAnchorElement)) {
        return;
    }

    // Drawer owns this path: it must close and restart Lenis before scrolling.
    if (link.closest(".header_mobile")) {
        return;
    }

    if (isModifiedClick(event)) {
        return;
    }

    const href = link.getAttribute("href") || "";
    const target = resolveHashTarget(href);
    if (!target) {
        return;
    }

    event.preventDefault();
    scrollToAnchorTarget(target);

    const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";
    if (hash) {
        setHashWithoutJump(hash);
    }
    focusAnchorTarget(target);
}

let initialized = false;

/**
 * Attach the global delegated listener once.
 *
 * @returns {void}
 */
export function initOkdScrollToAnchor() {
    if (initialized) {
        return;
    }
    initialized = true;
    document.addEventListener("click", onScrollToClick);
}
