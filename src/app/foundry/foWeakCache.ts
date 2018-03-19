export class foWeakCache<T extends object, U> {
    private readonly cacheItems: foWeakDictionary<T, U>;

    constructor() {
        if (typeof WeakMap !== undefined)
            this.cacheItems = new WeakMap<T, U>();
        else
            this.cacheItems = new foWeakMap();
    }

    getOrCreate<TCreate extends U = U>(key: T, createFunc: () => TCreate) {
        let item = this.get(key) as TCreate;

        if (item == null) {
            item = createFunc();
            this.set(key, item);
        }

        return item;
    }

    has(key: T) {
        return this.cacheItems.has(key);
    }

    get(key: T) {
        return this.cacheItems.get(key);
    }

    set(key: T, value: U) {
        this.cacheItems.set(key, value);
    }

    removeByKey(key: T) {
        this.cacheItems.delete(key);
    }
}

export interface foWeakDictionary<K extends object, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    delete(key: K): void;
}

export class foWeakMap<K extends object, V> implements foWeakDictionary<K, V> {
    private propSaver = new foPropSaver<K, V>();

    get(key: K) {
        return this.propSaver.get(key);
    }

    set(key: K, value: V) {
        this.propSaver.set(key, value);
    }

    has(key: K) {
        return this.propSaver.get(key) != null;
    }

    delete(key: K) {
        this.propSaver.remove(key);
    }
}

export class foPropSaver<TObject, TValue> {
    private readonly propName = `__key_${foPropSaver.instanceCount++}`;

    private static instanceCount = 0;

    get(obj: TObject) {
        return (obj as any)[this.propName] as TValue | undefined;
    }

    set(obj: TObject, value: TValue) {
        Object.defineProperty(obj, this.propName, {
            configurable: true,
            enumerable: false,
            writable: false,
            value
        });
    }

    remove(obj: TObject) {
        delete (obj as any)[this.propName];
    }
}