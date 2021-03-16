export class AsyncQueue<T> implements AsyncIterator<T>
{
    private _data:     T[] = [];
    private _promises: (({}: IteratorResult<T>) => void)[] = [];


    get size(): number { return this._data.length; }

    next(): Promise<IteratorResult<T>>
    {
        return new Promise(resolve => {
            this._promises.push(resolve);
            this._flush();
        });
    }

    push(...values: T[]) {
        this._data.push(...values);
        this._flush();
    }

    end() {
        for (const resolve of this._promises)
            resolve({value: undefined, done: true});

        this._data     = [];
        this._promises = [];
    }

    [Symbol.asyncIterator](): AsyncIterator<T> { return this; }


    private _flush() {
        let count = Math.min(
            this._data.length,
            this._promises.length
        );

        while (count--) {
            const resolve = this._promises.shift()!;
            const value   = this._data.shift()!;

            resolve({value, done: false});
        }
    }
}
