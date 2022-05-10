export class AsyncQueue<T> implements AsyncIterator<T>
{
    #reads:  (({}: IteratorResult<T>) => void)[] = [];
    #writes: [() => void, T][]                   = [];


    next(): Promise<IteratorResult<T>>
    {
        return new Promise(resolve => {
            this.#reads.push(resolve);
            this.#flush();
        });
    }

    push(value: T): Promise<void>
    {
        return new Promise(resolve => {
            this.#writes.push([resolve, value]);
            this.#flush();
        });
    }

    end() {
        for (const resolve of this.#reads)
            resolve({value: undefined, done: true});

        this.#reads = [];


        for (const [resolve] of this.#writes)
            resolve();

        this.#writes = [];
    }

    [Symbol.asyncIterator](): AsyncIterator<T> { return this; }


    #flush() {
        let count = Math.min(this.#reads.length, this.#writes.length);

        while (count--) {
            const resolveRead           = this.#reads.shift()!;
            const [resolveWrite, value] = this.#writes.shift()!;

            resolveRead({value, done: false});
            resolveWrite();
        }
    }
}
