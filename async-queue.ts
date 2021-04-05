export class AsyncQueue<T> implements AsyncIterator<T>
{
    private _reads:  (({}: IteratorResult<T>) => void)[] = [];
    private _writes: [() => void, T][]                   = [];


    next(): Promise<IteratorResult<T>>
    {
        return new Promise(resolve => {
            this._reads.push(resolve);
            this._flush();
        });
    }

    push(value: T): Promise<void>
    {
        return new Promise(resolve => {
            this._writes.push([resolve, value]);
            this._flush();
        });
    }

    end() {
        for (const resolve of this._reads)
            resolve({value: undefined, done: true});

        this._reads = [];


        for (const [resolve] of this._writes)
            resolve();

        this._writes = [];
    }

    [Symbol.asyncIterator](): AsyncIterator<T> { return this; }


    private _flush() {
        let count = Math.min(this._reads.length, this._writes.length);

        while (count--) {
            const resolveRead           = this._reads.shift()!;
            const [resolveWrite, value] = this._writes.shift()!;

            resolveRead({value, done: false});
            resolveWrite();
        }
    }
}
