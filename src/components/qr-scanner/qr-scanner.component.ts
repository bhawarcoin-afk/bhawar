import { ChangeDetectionStrategy, Component, signal, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsQR from 'jsqr';
import { CoinInfo } from '../../types/coin-info';
import { CoinDetailComponent } from '../coin-detail/coin-detail.component';

@Component({
  selector: 'app-qr-scanner',
  imports: [CommonModule, CoinDetailComponent],
  templateUrl: './qr-scanner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrScannerComponent implements OnDestroy {
  isCameraActive = signal(false);
  identifiedCoin = signal<CoinInfo | null>(null);
  error = signal<string | null>(null);
  isPermissionDeniedError = signal(false);
  
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas?: ElementRef<HTMLCanvasElement>;

  async startCamera(): Promise<void> {
    this.resetScanner();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permissionStatus.state === 'denied') {
            throw new DOMException('Permission previously denied.', 'NotAllowedError');
          }
        }
        
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        this.isCameraActive.set(true);
        
        Promise.resolve().then(() => {
          if (this.videoPlayer?.nativeElement && this.stream) {
            this.videoPlayer.nativeElement.srcObject = this.stream;
            this.videoPlayer.nativeElement.play();
            this.scanFrame();
          }
        });

      } catch (error: any) {
        console.error('Error accessing camera:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          this.error.set('Camera permission has been denied. Please enable camera access for this site in your browser settings.');
          this.isPermissionDeniedError.set(true);
        } else {
          this.error.set('Could not access the camera. It might be in use by another application.');
        }
      }
    } else {
      this.error.set('Camera not supported on this device or browser.');
    }
  }

  stopCamera(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.isCameraActive.set(false);
    this.stream = null;
  }

  scanFrame = (): void => {
    if (!this.isCameraActive()) return;
    
    const video = this.videoPlayer?.nativeElement;
    const canvasEl = this.canvas?.nativeElement;
    
    if (video && canvasEl && video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvasContext = canvasEl.getContext('2d');
      if (canvasContext) {
        canvasEl.height = video.videoHeight;
        canvasEl.width = video.videoWidth;
        canvasContext.drawImage(video, 0, 0, canvasEl.width, canvasEl.height);
        const imageData = canvasContext.getImageData(0, 0, canvasEl.width, canvasEl.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code) {
          this.handleQrCode(code.data);
          return; // Stop scanning
        }
      }
    }
    
    this.animationFrameId = requestAnimationFrame(this.scanFrame);
  }

  handleQrCode(data: string): void {
    try {
      const coinInfo: CoinInfo = JSON.parse(data);
      // Basic validation to see if it looks like our coin object
      if (coinInfo && coinInfo.name && coinInfo.year && coinInfo.category) {
        this.identifiedCoin.set(coinInfo);
        this.stopCamera();
      } else {
        this.error.set('Invalid QR code format. Please scan a valid Bhawarcoin QR code.');
        this.stopCamera();
      }
    } catch (e) {
      console.error('Error parsing QR code data:', e);
      this.error.set('Could not read the QR code. Please ensure it is a valid Bhawarcoin QR code and try again.');
      this.stopCamera();
    }
  }

  resetScanner(): void {
    this.stopCamera();
    this.identifiedCoin.set(null);
    this.error.set(null);
    this.isPermissionDeniedError.set(false);
  }

  reloadPage(): void {
    window.location.reload();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }
}
