import type { IAutopsyStorageMutation } from '../../types/index.js';

export interface IAutopsyQueueStoreAdapter {
  loadQueue(): Promise<IAutopsyStorageMutation[]>;
  saveQueue(queue: IAutopsyStorageMutation[]): Promise<void>;
}

const clone = <T>(value: T): T => structuredClone(value);

export class InMemoryAutopsyQueueStore implements IAutopsyQueueStoreAdapter {
  private queue: IAutopsyStorageMutation[] = [];

  async loadQueue(): Promise<IAutopsyStorageMutation[]> {
    return clone(this.queue);
  }

  async saveQueue(queue: IAutopsyStorageMutation[]): Promise<void> {
    this.queue = clone(queue);
  }
}

export class IndexedDbAutopsyQueueStore implements IAutopsyQueueStoreAdapter {
  constructor(
    private readonly databaseName = 'post-bid-autopsy',
    private readonly storeName = 'sync-queue',
    private readonly fallback: IAutopsyQueueStoreAdapter = new InMemoryAutopsyQueueStore()
  ) {}

  async loadQueue(): Promise<IAutopsyStorageMutation[]> {
    if (!('indexedDB' in globalThis)) {
      return this.fallback.loadQueue();
    }

    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const request = tx.objectStore(this.storeName).getAll();
      request.onsuccess = () => resolve((request.result as IAutopsyStorageMutation[]) ?? []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveQueue(queue: IAutopsyStorageMutation[]): Promise<void> {
    if (!('indexedDB' in globalThis)) {
      await this.fallback.saveQueue(queue);
      return;
    }

    const db = await this.openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.clear();
      for (const item of queue) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = globalThis.indexedDB.open(this.databaseName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'mutationId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
