export class Mutex {
    #queue: (({}: () => void) => void)[] = [];

    lock(): Promise<() => void>
    {
        return new Promise(resolve => {
            if (!this.#queue[0])
                resolve(this.#grant());

            this.#queue.push(resolve);
        });
    }

    tryLock(): (() => void) | undefined
    {
        return !this.#queue[0] ? this.#grant() : undefined;
    }

    unlock()
    {
        this.#queue.shift();
        this.#queue[0]?.(this.#grant());
    }

    #grant(): () => void
    {
        const {proxy, revoke} = Proxy.revocable(() => {
            revoke();
            this.unlock();
        }, {});

        return proxy;
    }
}
