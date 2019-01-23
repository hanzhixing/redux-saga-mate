export class FluxStandardActionError extends Error {
    constructor(message = 'Invalid FSA. See https://github.com/acdlite/flux-standard-action') {
        super(message);
        this.name = 'FluxStandardActionError';
        this.message = message;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}
