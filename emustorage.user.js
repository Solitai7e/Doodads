// ==UserScript==
// @name        Emulated Storage
// @match       *://*/*
// @inject-into page
// @run-at      document-start
// @grant       GM_getValue
// ==/UserScript==

// Drop-in replacement for localStorage and sessionStorage
// backed by a map, created as a workaround for sites that
// refuse to function without localStorage or sessionStorage.
//
// This class is mostly just a reimplementation of the Storage
// interface described by MDN. Any behavior not mentioned there
// was taken from Chromium. The "legacy" interface, in which
// storage items are accessible as object properties, is also
// supported with the use of a proxy.
//
// Data written to this object does not persist between
// page reloads or propagate to another tab with the same
// origin. (i.e. it will never trigger the storage event)
//
// On page load, this script attempts to access the real
// localStorage and sessionStorage. If either operation
// throws an exception, both properties will be re-assigned
// with an instance of this class. The instance created for
// localStorage will also be populated with user-specified
// data retrieved from the userscript's own storage, should
// there be any.
//
// The toString method has been repurposed to return a string
// containing every storage item in the form of a JSON object.


class Storage {
    #data;


    constructor(data = {}) {
        this.#data = new Map(Object.entries(data));
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
        const data = Object.fromEntries(this.#data.entries());
        return JSON.stringify(data, null, "\t");
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
                const value = Reflect.get(target, property);

                // Apparently if you don't do this the
                // function gets bound to the proxy itself
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
                return Reflect.set(target, property, value);
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
    const initialValues = GM_getValue(location.origin, {});

    Object.defineProperties(unsafeWindow, {
        localStorage:   {value: new Storage(initialValues)},
        sessionStorage: {value: new Storage},

        Storage: {value: Storage}
    });
}
