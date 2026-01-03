import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../../services/collection.service';
import { CollectionItem } from '../../../types/collection-item';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type SortKey = 'name' | 'year' | 'estimatedValue' | 'added_at';

@Component({
  selector: 'app-collections',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './collections.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsComponent {
  private collectionService = inject(CollectionService);
  
  searchQuery = signal<string>('');
  private sortKey = signal<SortKey>('added_at');
  private sortDirection = signal<'asc' | 'desc'>('desc');

  // A computed signal that filters the collection based on the search query.
  private filteredCollection = computed(() => {
    const collection = this.collectionService.collection();
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return collection;
    }

    return collection.filter(coin => 
      coin.name.toLowerCase().includes(query) ||
      coin.year.toLowerCase().includes(query) ||
      coin.metal.toLowerCase().includes(query)
    );
  });

  // A computed signal that sorts the *filtered* collection.
  sortedCollection = computed(() => {
    const collection = this.filteredCollection();
    const key = this.sortKey();
    const direction = this.sortDirection();

    return [...collection].sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      if (key === 'estimatedValue') {
        // Convert estimated value string to a number for correct sorting.
        valA = parseFloat(a.estimatedValue.replace(/[^0-9.-]+/g,""));
        valB = parseFloat(b.estimatedValue.replace(/[^0-9.-]+/g,""));
      } else if (key === 'added_at') {
        valA = a.added_at.getTime();
        valB = b.added_at.getTime();
      } else {
        valA = a[key as keyof Omit<CollectionItem, 'estimatedValue' | 'added_at'>];
        valB = b[key as keyof Omit<CollectionItem, 'estimatedValue' | 'added_at'>];
      }
      
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });

  // Method to handle sorting when a table header is clicked.
  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      // If already sorting by this key, reverse the direction.
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      // Otherwise, set the new key and default to ascending order.
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
  }

  // Helper method to get the current sort direction for a specific key for UI styling.
  getSortDirection(key: SortKey): 'asc' | 'desc' | null {
    return this.sortKey() === key ? this.sortDirection() : null;
  }
}