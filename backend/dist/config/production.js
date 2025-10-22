"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV === 'production') {
    console.log = () => { };
    console.warn = () => { };
    console.info = () => { };
    const originalError = console.error;
    console.error = (...args) => {
        originalError(new Date().toISOString(), ...args);
    };
}
//# sourceMappingURL=production.js.map