import { Injectable, signal } from '@angular/core';
import { PaymentDetails } from '../types/payment-details';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  isModalOpen = signal(false);
  paymentDetails = signal<PaymentDetails | null>(null);

  open(details: PaymentDetails) {
    this.paymentDetails.set(details);
    this.isModalOpen.set(true);
  }

  close() {
    this.isModalOpen.set(false);
    this.paymentDetails.set(null);
  }
}
