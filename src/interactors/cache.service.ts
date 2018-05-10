export class Cache {
    private cache: Map<string, any>;
    constructor() {
        this.cache = new Map();
    }

    public get(id: string): any {
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        return null;
    }

    public set(id: string, val: any, expire: number = 86400): void {
        this.cache.set(id, val);
    }
}

export default Cache;
