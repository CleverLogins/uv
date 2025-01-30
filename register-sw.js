"use strict";

/**
 * Distributed with Ultraviolet and compatible with most configurations.
 */
const stockSW = "/Uv/sw.js";

/**
 * List of hostnames that are allowed to run service workers on http:
 */
const swAllowedHostnames = ["localhost", "127.0.0.1"];

/**
 * Global util
 * Used in 404.html and index.html
 */
async function registerSW() {
  if (
    location.protocol !== "https:" &&
    !swAllowedHostnames.includes(location.hostname)
  ) {
    throw new Error("Service workers cannot be registered without HTTPS.");
  }

  if (!navigator.serviceWorker) {
    throw new Error("Your browser doesn't support service workers.");
  }

  // Ensure __uv$config is defined before using it
  if (typeof window.__uv$config === "undefined" || !window.__uv$config.prefix) {
    console.error("Ultraviolet configuration is missing. Make sure uv.config.js is loaded.");
    return;
  }

  // Ultraviolet has a stock `sw.js` script.
  await navigator.serviceWorker.register(stockSW, {
    scope: window.__uv$config.prefix,
  });

  console.log("Service worker registered successfully.");
}

// Ensure the script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  registerSW().catch(console.error);
});
