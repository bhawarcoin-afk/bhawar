import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AuctionService } from '../../../services/auction.service';
import { AuctionItem } from '../../../types/auction-item';

@Component({
  selector: 'app-auction',
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './auction.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionComponent implements OnInit, OnDestroy {
  private auctionService = inject(AuctionService);
  auctionItems = this.auctionService.getAuctions();
  
  timeRemaining = signal<{[key: string]: string}>({});
  private timer: number | undefined;

  ngOnInit(): void {
    this.updateTimes(); // Initial call to populate times immediately
    this.timer = window.setInterval(() => {
        this.updateTimes();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  updateTimes(): void {
    const now = new Date();
    const remaining: {[key: string]: string} = {};
    for (const item of this.auctionItems()) {
      const diff = item.endTime.getTime() - now.getTime();
      if (diff > 0) {
        remaining[item.id] = this.formatTimeDiff(diff);
      } else {
        remaining[item.id] = 'Auction Ended';
      }
    }
    this.timeRemaining.set(remaining);
  }

  formatTimeDiff(diff: number): string {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);
    const secs = Math.floor(diff / 1000);
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (days === 0 && mins > 0) result += `${mins}m `;
    if (days === 0 && hours === 0) result += `${secs}s`;

    return result.trim();
  }

  placeBid(item: AuctionItem): void {
    const bidAmount = prompt(`The current bid for ${item.name} is ${item.currentBid.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}.\n\nEnter your new bid amount:`);
    if (bidAmount) {
      const numericBid = parseFloat(bidAmount);
      if (!isNaN(numericBid) && numericBid > item.currentBid) {
        alert(`Your bid of ${numericBid.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} has been placed!`);
        // In a real app, this would update the backend.
      } else {
        alert('Invalid bid. Please enter a number higher than the current bid.');
      }
    }
  }
}
