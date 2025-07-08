import { PersistentStorage } from "apollo-cache-persist/types";
import { IDBPDatabase } from "idb";

export class IDBWrapper implements PersistentStorage<string | object | null> {
  protected storage;
  readonly storeName;

  constructor(storage: IDBPDatabase, storeName: string) {
    this.storage = storage;
    this.storeName = storeName;
  }

  getItem(key: string): ReturnType<IDBPDatabase["get"]> {
    return this.storage.get(this.storeName, key);
  }

  removeItem(key: string): ReturnType<IDBPDatabase["delete"]> {
    return this.storage.delete(this.storeName, key);
  }

  setItem(key: string, value: string | object | null): Promise<void> {
    return new Promise(() => {
      this.storage.put(this.storeName, value, key);
    });
  }
}
