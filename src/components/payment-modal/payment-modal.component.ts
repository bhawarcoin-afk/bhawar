import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { PaymentService } from '../../services/payment.service';
import QRCode from 'qrcode';

type PaymentStatus = 'awaiting' | 'processing' | 'success' | 'failed';

@Component({
  selector: 'app-payment-modal',
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './payment-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentModalComponent {
  paymentService = inject(PaymentService);
  private sanitizer = inject(DomSanitizer);
  
  status = signal<PaymentStatus>('awaiting');
  qrCodeUrl = signal<string | null>(null);

  // Raw UPI string for QR code generation
  private upiString = computed(() => {
    const details = this.paymentService.paymentDetails();
    if (!details) return '';
    
    // Construct UPI deep link URL based on the requested specification
    const params = new URLSearchParams({
      pa: details.recipientUpi,
      pn: details.recipientName,
      tr: details.transactionId,
      tn: 'Coin Purchase',
      am: details.amount.toFixed(2),
      cu: 'INR',
    });
    return `upi://pay?${params.toString()}`;
  });

  // Sanitized URL for the anchor tag href to safely allow upi:// scheme
  sanitizedDeepLink = computed(() => {
    const url = this.upiString();
    return url ? this.sanitizer.bypassSecurityTrustUrl(url) : '';
  });

  constructor() {
    effect(() => {
      const deepLink = this.upiString();
      if (deepLink) {
        this.generateQrCode(deepLink);
      } else {
        this.qrCodeUrl.set(null);
      }
      
      // Reset status when modal opens
      if (this.paymentService.isModalOpen()) {
        this.status.set('awaiting');
      }
    });
  }

  generateQrCode(data: string): void {
    QRCode.toDataURL(data, { errorCorrectionLevel: 'M', margin: 2, scale: 6 })
      .then(url => {
        this.qrCodeUrl.set(url);
      })
      .catch(err => {
        console.error('QR Code generation failed:', err);
        this.qrCodeUrl.set(null);
      });
  }
  
  simulatePayment(): void {
    this.status.set('processing');
    setTimeout(() => {
      // Simulate a successful payment
      this.status.set('success');
    }, 2500);
  }

  closeModal(): void {
    this.paymentService.close();
  }
}