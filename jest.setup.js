require("@testing-library/jest-dom");

const localStorageMock = {
  clear: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn()
};

global.localStorage = localStorageMock;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    addEventListener: jest.fn(),
    addListener: jest.fn(),
    dispatchEvent: jest.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: jest.fn(),
    removeListener: jest.fn()
  }))
});
