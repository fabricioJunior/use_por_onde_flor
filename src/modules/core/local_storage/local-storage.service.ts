import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private storage?: Storage;




  setStorage() {
    if (typeof window !== 'undefined') {
      this.storage = localStorage;
    }


  }

  async set(key: string, value: any): Promise<boolean> {
    this.setStorage();
    if (this.storage) {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    }

    return false;
  }

  get<T>(key: string): any {
    this.setStorage();
    if (this.storage) {
      return JSON.parse(this.storage.getItem(key)!) as T;
    }
    return null;
  }

  remove(key: string): boolean {
    this.setStorage();
    if (this.storage) {
      this.storage.removeItem(key);
      return true;
    }
    return false;
  }

  clear(): boolean {
    this.setStorage();
    if (this.storage) {
      this.storage.clear();
      return true;
    }
    return false;
  }
}
