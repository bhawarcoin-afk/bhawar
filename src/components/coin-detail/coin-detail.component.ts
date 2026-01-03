import { ChangeDetectionStrategy, Component, input, signal, effect, untracked, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinInfo } from '../../types/coin-info';
import QRCode from 'qrcode';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { GeminiService } from '../../services/gemini.service';
import { CollectionService } from '../../services/collection.service';
import { UserService } from '../../services/user.service';
import { PaymentService } from '../../services/payment.service';
import { PaymentDetails } from '../../types/payment-details';

@Component({
  selector: 'app-coin-detail',
  imports: [CommonModule, ChatbotComponent],
  templateUrl: './coin-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoinDetailComponent {
  coinInfo = input.required<CoinInfo>();
  qrCodeUrl = signal<string | null>(null);
  
  geminiService = inject(GeminiService);
  collectionService = inject(CollectionService);
  userService = inject(UserService);
  paymentService = inject(PaymentService);

  isSpeaking = signal(false);
  isLoadingSpeech = signal(false);
  isSelling = signal(false);
  private audioContext: AudioContext | null = null;
  
  chatContext = signal<string>('');

  // A computed signal to check if the current coin is already in the user's collection.
  isAddedToCollection = computed(() => {
    const collection = this.collectionService.collection();
    const currentCoinId = `${this.coinInfo().name.replace(/\s/g, '-')}-${this.coinInfo().year}`;
    return collection.some(item => item.coin_id === currentCoinId);
  });
  
  constructor() {
    effect(() => {
      const info = this.coinInfo();
      untracked(() => {
        this.chatContext.set(JSON.stringify(info, null, 2));
      });
    });
  }

  generateQrCode(): void {
    const coinDataString = JSON.stringify(this.coinInfo(), null, 2);
    QRCode.toDataURL(coinDataString, { errorCorrectionLevel: 'H' })
      .then(url => {
        this.qrCodeUrl.set(url);
      })
      .catch(err => {
        console.error('QR Code generation failed:', err);
      });
  }
  
  addToCollection(): void {
    if (this.userService.currentUser()) {
      this.collectionService.addCoinToCollection(this.coinInfo());
    } else {
      alert('Please log in to add coins to your collection.');
    }
  }

  buyCoin(): void {
    const coin = this.coinInfo();
    const amount = parseFloat(coin.estimatedValue.replace(/[^0-9.]/g, ''));
    if (isNaN(amount)) {
      console.error("Could not parse coin value for payment.");
      alert("Error: Could not determine coin value for payment.");
      return;
    }

    const paymentDetails: PaymentDetails = {
      itemName: coin.name,
      amount: amount,
      recipientUpi: 'bhawarcoin@upi',
      recipientName: 'Bhawarcoin',
      transactionId: `BC-TXN-${Date.now()}`
    };
    
    this.paymentService.open(paymentDetails);
  }

  sellCoin(): void {
    this.isSelling.set(true);
    console.log('[ADMIN PANEL LOG] Sell listing created for:', this.coinInfo().name, 'starting at:', this.coinInfo().estimatedValue);
    setTimeout(() => {
      alert(`Your ${this.coinInfo().name} has been listed for auction starting at ${this.coinInfo().estimatedValue}. This listing is now visible in the admin panel.`);
      this.isSelling.set(false);
    }, 2000);
  }

  async speak(): Promise<void> {
    if (this.isLoadingSpeech() || this.isSpeaking()) return;

    this.isLoadingSpeech.set(true);
    const coin = this.coinInfo();
    const textToSpeak = `
      Coin: ${coin.name}.
      Era: ${coin.era}.
      Year: ${coin.year}.
      Value: ${coin.estimatedValue}.
      Description: ${coin.obverseDescription}. ${coin.reverseDescription}.
    `;
    
    const audioContent = await this.geminiService.generateSpeech(textToSpeak);
    this.isLoadingSpeech.set(false);

    if (audioContent) {
      this.playAudio(audioContent);
    }
  }

  private playAudio(base64Audio: string): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      const audioData = atob(base64Audio);
      const buffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      
      this.audioContext.decodeAudioData(buffer, (decodedData) => {
        this.isSpeaking.set(true);
        const source = this.audioContext!.createBufferSource();
        source.buffer = decodedData;
        source.connect(this.audioContext!.destination);
        source.start(0);
        source.onended = () => {
          this.isSpeaking.set(false);
        };
      });
    } catch (e) {
      console.error('Error playing audio:', e);
      this.isSpeaking.set(false);
    }
  }
}