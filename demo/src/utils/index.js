export const delay = (seconds, signal = {}) => {
    if (signal.aborted) {
        return Promise.reject(new DOMException('Aborted', 'AbortError'));
    }

    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(resolve, seconds * 1000);

        // eslint-disable-next-line
        signal.onabort = () => {
            window.clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        };
    });
};

// @see https://stackoverflow.com/questions/30452263/is-there-a-mechanism-to-loop-x-times-in-es6-ecmascript-6-without-mutable-varia
const recur = (...args) => ({ type: recur, args });

const loop = f => {
    let acc = f();
    while (acc.type === recur) {
        acc = f(...acc.args);
    }
    return acc;
};

export const repeat = $n => f => x =>
    loop((n = $n, acc = x) => (n === 0 ? acc : recur(n - 1, f(acc))));

export const offsetToPage = (offset, limit = 10) => offset / limit + 1;

export const pageToOffset = (page, limit = 10) =>
    page > 1 ? (page - 1) * limit : 0;

export const e2e = str => `test-id-${str}`;
