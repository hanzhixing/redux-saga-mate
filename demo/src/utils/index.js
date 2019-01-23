export const delay = seconds => new Promise(resolve => window.setTimeout(resolve, seconds * 1000));

// @see https://stackoverflow.com/questions/30452263/is-there-a-mechanism-to-loop-x-times-in-es6-ecmascript-6-without-mutable-varia
const recur = (...args) => ({ type: recur, args });

const loop = f => {
    let acc = f ();
    while (acc.type === recur) {
        acc = f (...acc.args);
    }
    return acc;
};

export const repeat = $n => f => x => loop((n = $n, acc = x) => n === 0 ? acc : recur (n - 1, f (acc)));

export const offsetToPage = (offset, limit = 10) => ((offset / limit) + 1);

export const pageToOffset = (page, limit = 10) => (page > 1 ? (page - 1) * limit : 0);
