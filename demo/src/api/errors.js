export class MyError extends Error {
    constructor(message = 'MyError') {
        super(message);
        this.name = 'MyError';
        this.message = message;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}
