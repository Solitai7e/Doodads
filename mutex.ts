export class Mutex {
    private _queue: (({}: () => void) => void)[] = [];

    lock(): Promise<() => void>
    {
        return new Promise(resolve => {
            if (!this._queue[0])
                resolve(this._grantLock());

            this._queue.push(resolve);
        });
    }

    unlock() {
        this._queue.shift();
        this._queue[0]?.(this._grantLock());
    }

    private _grantLock(): () => void
    {
        const {proxy, revoke} = Proxy.revocable(() => {
            revoke();
            this.unlock();
        }, {});

        return proxy;
    }
}
