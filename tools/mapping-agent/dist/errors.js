"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingError = void 0;
class MappingError extends Error {
    constructor(code, message, context) {
        super(message);
        this.name = 'MappingError';
        this.code = code;
        this.context = context;
        // Maintain proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, MappingError.prototype);
    }
}
exports.MappingError = MappingError;
//# sourceMappingURL=errors.js.map