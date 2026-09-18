import "@testing-library/jest-dom";

// Polyfill window.crypto.subtle if missing in test environment
if (typeof window !== "undefined") {
  if (!window.crypto) {
    (window as any).crypto = {};
  }
}
