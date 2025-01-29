"use strict";

/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

// Function to register service worker safely
async function safeRegisterSW() {
    if (!navigator.serviceWorker) {
        throw new Error("Service workers are not supported by this browser.");
    }
    return navigator.serviceWorker.register("register-sw.js");
}

// Function to process input into a proper URL
function processInput(input, defaultSearch) {
    let trimmedInput = input.trim();
    if (!trimmedInput) return null;

    // If input does not contain a scheme, assume it is a search query
    if (!/^https?:\/\//i.test(trimmedInput)) {
        return defaultSearch.replace("%s", encodeURIComponent(trimmedInput));
    }
    return trimmedInput;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = ""; // Clear previous errors
    errorCode.textContent = "";

    try {
        await safeRegisterSW();
    } catch (err) {
        error.textContent = "Failed to register service worker.";
        errorCode.textContent = err.toString();
        console.error(err);
        return;
    }

    const url = processInput(address.value, searchEngine.value);
    if (!url) {
        error.textContent = "Please enter a valid URL or search query.";
        return;
    }

    let frame = document.getElementById("uv-frame");
    frame.style.display = "block";

    let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";

    try {
        if (await connection.getTransport() !== "/epoxy/index.mjs") {
            await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
        }
    } catch (err) {
        console.error("Error setting transport:", err);
    }

    // Ensure __uv$config is loaded
    if (typeof __uv$config !== "undefined" && __uv$config.encodeUrl) {
        frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
    } else {
        error.textContent = "Ultraviolet configuration is missing or failed to load.";
    }
});
