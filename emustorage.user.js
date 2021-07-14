// ==UserScript==
// @name        Emulated Storage
// @match       *://*/*
// @inject-into page
// @run-at      document-start
// @grant       GM_getValue
// ==/UserScript==


class Storage {
    #data;


    constructor(data = []) {
        this.#data = new Map(data);
        return new Proxy(this, Storage.#metaInterface);
    }


    get length()   { return this.#data.size; }
    set length({}) {}

    key(index) { return [...this.#data.keys()][index] ?? null; }

    getItem(key)        { return this.#data.get(String(key)) ?? null; }
    setItem(key, value) { this.#data.set(String(key), String(value)); }
    removeItem(key)     { this.#data.delete(String(key)); }

    clear() { this.#data.clear(); }

    toString() {
        return JSON.stringify(
            Object.fromEntries(this.#data.entries()),
            null, "\t"
        );
    }


    #isProperty(property) {
        return property in this || typeof property !== "string";
    }

    static #metaInterface = {
        preventExtensions(target) { return false; },

        getOwnPropertyDescriptor(target, property) {
            if (target.#isProperty(property))
                return Reflect.getOwnPropertyDescriptor(...arguments);
            else if (target.#data.has(property))
                return {
                    value:        target.#data.get(property),
                    writable:     true,
                    enumerable:   true,
                    configurable: true
                };
        },

        defineProperty(target, property, descriptor) {
            if (!("value" in descriptor) || typeof property !== "string") {
                return Reflect.defineProperty(...arguments);
            }
            else {
                target.#data.set(property, String(descriptor.value));
                return true;
            }
        },

        has(target, property) {
            return Reflect.has(...arguments) ||
                typeof property === "string" &&
                target.#data.has(property);
        },

        get(target, property, receiver) {
            if (target.#isProperty(property)) {
                const value = Reflect.get(...arguments);

                return typeof value === "function" ?
                    value.bind(target) :
                    value;
            }
            else {
                return target.#data.get(property);
            }
        },

        set(target, property, value, receiver) {
            if (target.#isProperty(property)) {
                return Reflect.set(...arguments);
            }
            else {
                target.#data.set(property, String(value));
                return true;
            }
        },

        deleteProperty(target, property) {
            if (target.#isProperty(property)) {
                return Reflect.deleteProperty(...arguments);
            }
            else {
                target.#data.delete(property);
                return true;
            }
        },

        ownKeys(target) {
            return [
                ...Reflect.ownKeys(...arguments),
                ...target.#data.keys()
            ];
        }
    };
}


try {
    unsafeWindow.localStorage;
    unsafeWindow.sessionStorage;
}
catch {
    const initialValues = Object.entries(GM_getValue(location.origin, {}));

    Object.defineProperties(unsafeWindow, {
        localStorage:   {value: new Storage(initialValues)},
        sessionStorage: {value: new Storage},

        Storage: {value: Storage}
    });
}
