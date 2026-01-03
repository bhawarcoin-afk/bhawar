import { Injectable, signal, inject, effect } from '@angular/core';
import { UserService } from './user.service';
import { CollectionItem } from '../types/collection-item';
import { CoinInfo } from '../types/coin-info';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private userService = inject(UserService);
  
  // A signal to hold the user's collection.
  public collection = signal<CollectionItem[]>([]);

  constructor() {
    // This effect will run whenever the current user changes.
    effect(() => {
      const currentUser = this.userService.currentUser();
      if (currentUser) {
        // If a user is logged in, load their collection from localStorage.
        this.loadCollectionForUser(currentUser.user_id);
      } else {
        // If no user is logged in (e.g., after logout), clear the collection.
        this.collection.set([]);
      }
    });
  }

  private getStorageKey(userId: string): string {
    return `bhawarcoin_collection_${userId}`;
  }

  private loadCollectionForUser(userId: string): void {
    const storedCollection = localStorage.getItem(this.getStorageKey(userId));
    if (storedCollection) {
      // Parse the stored JSON and convert date strings back to Date objects.
      const parsedCollection = JSON.parse(storedCollection).map((item: any) => ({
        ...item,
        added_at: new Date(item.added_at),
      }));
      this.collection.set(parsedCollection);
    } else {
      // If no collection is found in storage, start with an empty array.
      this.collection.set([]);
    }
  }

  private saveCollection(): void {
    const currentUser = this.userService.currentUser();
    if (currentUser) {
      // Save the current state of the collection to localStorage.
      localStorage.setItem(this.getStorageKey(currentUser.user_id), JSON.stringify(this.collection()));
    }
  }

  addCoinToCollection(coinInfo: CoinInfo): void {
    const newCollectionItem: CollectionItem = {
      coin_id: `${coinInfo.name.replace(/\s/g, '-')}-${coinInfo.year}`,
      name: coinInfo.name,
      period: coinInfo.era,
      year: coinInfo.year,
      denomination: coinInfo.name.split(' ').slice(1).join(' '), // Best guess for denomination
      metal: coinInfo.material,
      mint_id: coinInfo.mint,
      obverse_desc: coinInfo.obverseDescription,
      reverse_desc: coinInfo.reverseDescription,
      edge_type: 'Reeded', // Default value as it's not in CoinInfo
      estimatedValue: coinInfo.estimatedValue,
      added_at: new Date(),
    };

    // Update the collection signal by adding the new item.
    this.collection.update(currentCollection => [...currentCollection, newCollectionItem]);
    // Persist the updated collection to storage.
    this.saveCollection();
  }
}
