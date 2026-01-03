import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { CoinInfo } from '../../types/coin-info';
import { CoinDetailComponent } from '../coin-detail/coin-detail.component';
import { TensorflowService } from '../../services/tensorflow.service';
import { ScannerTutorialComponent } from '../scanner-tutorial/scanner-tutorial.component';

@Component({
  selector: 'app-coin-scanner',
  imports: [CommonModule, CoinDetailComponent, ScannerTutorialComponent],
  templateUrl: './coin-scanner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoinScannerComponent implements OnDestroy {
  geminiService = inject(GeminiService);
  tensorflowService = inject(TensorflowService);

  obverseImage = signal<string | null>(null);
  reverseImage = signal<string | null>(null);
  
  obversePreview = signal<string | null>(null);
  reversePreview = signal<string | null>(null);

  identifiedCoin = signal<CoinInfo | null>(null);
  isPermissionDeniedError = signal(false);

  // New signals for camera
  isCameraActive = signal(false);
  isFlashOn = signal(false);
  captureTarget = signal<'obverse' | 'reverse'>('obverse');
  private stream: MediaStream | null = null;
  
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;
  @ViewChild('tutorial') tutorialComponent?: ScannerTutorialComponent;

  async startCamera(): Promise<void> {
    this.resetScanner();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Proactively check for camera permission if the Permissions API is supported.
        if (navigator.permissions && navigator.permissions.query) {
          // The name 'camera' is a valid PermissionName but might not be in default TS libs.
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permissionStatus.state === 'denied') {
            // If permission is already denied, throw a specific error to be handled by our catch block.
            // This avoids prompting the user again when we know it will be denied.
            throw new DOMException('Permission previously denied.', 'NotAllowedError');
          }
        }
        
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        this.isCameraActive.set(true);
        this.captureTarget.set('obverse');
        // Use a microtask to wait for the view to update
        Promise.resolve().then(() => {
          if (this.videoPlayer?.nativeElement && this.stream) {
            this.videoPlayer.nativeElement.srcObject = this.stream;
          }
        });
      } catch (error: any) {
        console.error('Error accessing camera:', error);
        let errorMessage: string;
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          // Centralize the user-facing message for permission denial to ensure clarity.
          errorMessage = 'Camera permission has been denied. Please enable camera access for this site in your browser settings, then reload the page.';
          this.isPermissionDeniedError.set(true);
        } else {
          errorMessage = 'Could not access the camera. It might be in use by another application or not found on your device.';
        }
        this.geminiService.error.set(errorMessage);
      }
    } else {
      this.geminiService.error.set('Camera not supported on this device or browser.');
    }
  }
  
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.isCameraActive.set(false);
    this.isFlashOn.set(false); // Reset flash state
    this.stream = null;
  }

  async toggleFlash(): Promise<void> {
    if (!this.stream || this.stream.getVideoTracks().length === 0) {
      return;
    }

    const track = this.stream.getVideoTracks()[0];
    // getCapabilities is not available in all browsers/ts-dom-lib versions, so we cast to any
    const capabilities = (track as any).getCapabilities(); 

    if (!capabilities || !('torch' in capabilities)) {
      this.geminiService.error.set('Flash/Torch is not supported on this device.');
      return;
    }

    try {
      const newFlashState = !this.isFlashOn();
      // FIX: Cast `advanced` constraint value to `any` to allow using the `torch` property,
      // which is not present in the default TypeScript DOM library definitions.
      await track.applyConstraints({
        advanced: [{ torch: newFlashState }] as any
      });
      this.isFlashOn.set(newFlashState);
    } catch (error) {
      console.error('Error toggling flash:', error);
      this.geminiService.error.set('Could not control the camera flash.');
    }
  }

  captureImage(): void {
    if (!this.videoPlayer?.nativeElement) return;

    const video = this.videoPlayer.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    const base64String = dataUrl.split(',')[1];
    
    if (this.captureTarget() === 'obverse') {
      this.obverseImage.set(base64String);
      this.obversePreview.set(dataUrl);
      this.captureTarget.set('reverse');
    } else {
      this.reverseImage.set(base64String);
      this.reversePreview.set(dataUrl);
      this.stopCamera(); // Stop camera after capturing both sides
    }
  }

  onFileSelected(event: Event, side: 'obverse' | 'reverse'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')){ 
        this.geminiService.error.set('Please select an image file.');
        return; 
      }
      
      this.geminiService.error.set(null);

      const reader = new FileReader();

      reader.onload = (e: any) => {
        const dataUrl = e.target.result as string;
        const base64String = dataUrl.split(',')[1];
        
        if (side === 'obverse') {
          this.obverseImage.set(base64String);
          this.obversePreview.set(dataUrl);
        } else {
          this.reverseImage.set(base64String);
          this.reversePreview.set(dataUrl);
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        this.geminiService.error.set('Failed to read the selected file.');
      };

      reader.readAsDataURL(file);
    }
     // Reset the input value to allow selecting the same file again
    if (input) {
      input.value = '';
    }
  }

  async identifyCoin(): Promise<void> {
    if (!this.obverseImage() || !this.reverseImage()) {
      alert('Please provide images for both sides of the coin.');
      return;
    }

    let predictionHint: string | null = null;
    // Use the local model if it's ready and an image preview is available
    if (this.tensorflowService.model() && this.obversePreview()) {
      const img = new Image();
      img.src = this.obversePreview()!;
      // Wait for the image to be fully loaded before prediction
      await new Promise(resolve => img.onload = resolve);
      
      predictionHint = await this.tensorflowService.predict(img);
      console.log('Local model prediction:', predictionHint);
    }

    const result = await this.geminiService.identifyCoin(this.obverseImage()!, this.reverseImage()!, predictionHint);
    this.identifiedCoin.set(result);
  }

  reloadPage(): void {
    window.location.reload();
  }

  resetScanner(): void {
    this.stopCamera(); // Make sure camera stops on reset
    this.obverseImage.set(null);
    this.reverseImage.set(null);
    this.obversePreview.set(null);
    this.reversePreview.set(null);
    this.identifiedCoin.set(null);
    this.geminiService.error.set(null);
    this.isPermissionDeniedError.set(false);
  }

  openTutorial(): void {
    this.tutorialComponent?.open();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }
}