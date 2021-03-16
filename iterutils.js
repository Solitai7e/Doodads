export function* take(count, iterable) {
    const iter = iterable[Symbol.iterator]();

    for (let i = 0; i < count; i++) {
        const {value, done} = iter.next();

        if (done) break;
        yield value;
    }
}

export function* enumerate(iterable) {
    let i = 0;

    for (const e of iterable)
        yield [i++, e];
}

export function* filter(iterable, callback) {
    for (const e of iterable)
        if (callback(e)) yield e;
}

export function find(iterable, callback) {
    for (const e of iterable)
        if (callback(e)) return e;
}

export function* map(iterable, callback) {
    for (const e of iterable)
        yield callback(e);
}

export function reduce(iterable, callback, init) {
    const iter = iterable[Symbol.iterator]();
    let result = init ?? iter.next();

    for (const e of iter)
        result = callback(result, e);

    return result;
}

export function* reverse(iterable) {
    const values = "length" in iterable ? iterable : [...iterable];

    for (let i = values.length - 1; i >= 0; i--)
        yield values[i];
}

export function* flatten(iterable, depth = 1) {
    if (depth > 0)
        for (const e of iterable)
            if (e?.[Symbol.iterator])
                yield* flatten(e, depth - 1);
            else
                yield e;
    else
        yield* iterable;
}

export function* cycle(iterable) {
    const values = "length" in iterable ? iterable : [...iterable];
    for (;;) yield* values;
}

export function* replicate(count, value) {
    for (let i = 0; i < count; i++)
        yield value;
}

export function* repeat(count, callback) {
    for (let i = 0; i < count; i++)
        yield callback();
}

export function* range(...args) {
    if (args.length === 1) {
        yield* range(0, args[0]);
    }
    else {
        const [start, stop, step = 1] = args;

        for (let i = start; i != stop; i += step)
            yield i;
    }
}
