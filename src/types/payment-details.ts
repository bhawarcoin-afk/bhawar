export interface PaymentDetails {
  itemName: string;
  amount: number; // The amount in INR
  recipientUpi: string;
  recipientName: string;
  transactionId: string;
}
