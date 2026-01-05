/**
 * Simple IndexedDB Wrapper for Offline Capability
 * Database: antigravity_db
 * Version: 1
 * 
 * NOTE: Refactored to remove ES Modules for file:// protocol compatibility.
 */

const DB_NAME = 'antigravity_db';
const DB_VERSION = 4;

class Database {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("Database error: " + event.target.errorCode);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Database initialized successfully");
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 1. Tasks Store
                if (!db.objectStoreNames.contains('tasks')) {
                    const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    taskStore.createIndex('status', 'status', { unique: false });
                    taskStore.createIndex('dueDate', 'dueDate', { unique: false });
                }

                // 2. Goals Store
                if (!db.objectStoreNames.contains('goals')) {
                    const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
                    goalStore.createIndex('parentId', 'parentId', { unique: false });
                }

                // 3. Habits Store (NEW in v2)
                if (!db.objectStoreNames.contains('habits')) {
                    const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
                }

                // 4. Skills/Gamification Store (NEW in v3)
                if (!db.objectStoreNames.contains('skills')) {
                    db.createObjectStore('skills', { keyPath: 'id' });
                }

                // 5. AI Patterns Store (NEW in v4)
                if (!db.objectStoreNames.contains('patterns')) {
                    // id: auto-increment, type: 'completion', 'focus_session', etc.
                    const patternStore = db.createObjectStore('patterns', { keyPath: 'id', autoIncrement: true });
                    patternStore.createIndex('type', 'type', { unique: false });
                    patternStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // 6. User Stats / Logs
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // CRUD - Generic Helpers

    async add(storeName, item) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.add(item);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], "readonly");
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, item) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.put(item);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], "readonly");
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    async deleteDatabase() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close();
            }
            const request = indexedDB.deleteDatabase(DB_NAME);

            request.onsuccess = () => {
                console.log("Database deleted successfully");
                resolve();
            };

            request.onerror = (event) => {
                console.error("Error deleting database:", event);
                reject(event.target.error);
            };

            request.onblocked = () => {
                console.warn("Database delete blocked. closing connections...");
                if (this.db) this.db.close();
            };
        });
    }
}

// Attach to window for global access
window.db = new Database();
