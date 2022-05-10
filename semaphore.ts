export class Semaphore {
    #queue: (({}: () => void) => void)[] = [];
    #count: number;

    constructor(count: number) { this.#count = count; }

    acquire(): Promise<() => void>
    {
        return new Promise(resolve => {
            if (this.#count > 0) resolve(this.#grant());
            else                 this.#queue.push(resolve);
        });
    }

    tryAcquire(): (() => void) | undefined
    {
        return this.#count > 0 ? this.#grant()
                               : undefined;
    }

    release() {
        this.#count++;
        this.#queue.shift()?.(this.#grant());
    }

    #grant(): () => void
    {
        this.#count--;

        const {proxy, revoke} = Proxy.revocable(() => {
            revoke();
            this.release();
        }, {});

        return proxy;
    }
}
