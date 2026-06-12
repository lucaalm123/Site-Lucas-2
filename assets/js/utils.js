/* utils.js — small helpers */

window.$ = function $(selector, context) {
  return (context || document).querySelector(selector);
};

window.$$ = function $$(selector, context) {
  return Array.from((context || document).querySelectorAll(selector));
};

window.clamp = function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
};

window.prefersReducedMotion = function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

window.isTouchDevice = function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches;
};

window.escapeHtml = function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};
