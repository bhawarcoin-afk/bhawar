import { Injectable, signal } from '@angular/core';
import { AuctionItem } from '../types/auction-item';

@Injectable({
  providedIn: 'root',
})
export class AuctionService {
  private auctionItems: AuctionItem[] = [
    {
      id: 'auction-1',
      name: '1 Rupee, George VI',
      year: '1947',
      description: 'The last silver rupee issued under British rule. A key historical piece.',
      imageUrl: 'https://picsum.photos/seed/rupee1947/400/400',
      startingBid: 1500,
      currentBid: 2250,
      bidderCount: 8,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 15 * 60 * 1000), // ~2d 3h 15m
    },
    {
      id: 'auction-2',
      name: '1/4 Anna, East India Company',
      year: '1835',
      description: 'Classic copper coin from the EIC, featuring the company arms.',
      imageUrl: 'https://picsum.photos/seed/anna1835/400/400',
      startingBid: 800,
      currentBid: 1100,
      bidderCount: 5,
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // ~1d 10h
    },
    {
      id: 'auction-3',
      name: '1 Mohur, Queen Victoria',
      year: '1862',
      description: 'A stunning and highly sought-after gold Mohur.',
      imageUrl: 'https://picsum.photos/seed/mohur1862/400/400',
      startingBid: 150000,
      currentBid: 185000,
      bidderCount: 12,
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // ~5d
    },
    {
      id: 'auction-4',
      name: '5 Rupees, Jawaharlal Nehru Commemorative',
      year: '1989',
      description: 'UNC commemorative coin issued by the Noida mint.',
      imageUrl: 'https://picsum.photos/seed/nehru1989/400/400',
      startingBid: 200,
      currentBid: 350,
      bidderCount: 6,
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000 + 30 * 60 * 1000), // ~4h 30m
    },
     {
      id: 'auction-5',
      name: '1 Paisa, Republic India',
      year: '1952',
      description: 'An early bronze coin from the Republic of India with the Ashoka Lion pedestal.',
      imageUrl: 'https://picsum.photos/seed/paisa1952/400/400',
      startingBid: 50,
      currentBid: 120,
      bidderCount: 4,
      endTime: new Date(Date.now() + 1 * 60 * 60 * 1000 + 5 * 60 * 1000), // Auction ending soon! ~1h 5m
    },
  ];

  auctions = signal<AuctionItem[]>(this.auctionItems);

  getAuctions() {
    return this.auctions;
  }
}
