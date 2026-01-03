export interface AuctionItem {
  id: string;
  name: string;
  year: string;
  description: string;
  imageUrl: string;
  startingBid: number;
  currentBid: number;
  bidderCount: number;
  endTime: Date;
}
