import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-scanner-tutorial',
  imports: [CommonModule],
  templateUrl: './scanner-tutorial.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScannerTutorialComponent implements OnInit {
  isOpen = signal(false);
  currentStepIndex = signal(0);

  steps: TutorialStep[] = [
    {
      title: 'Lighting is Key',
      description: 'Place your coin on a plain, dark background. Ensure the area is well-lit, but avoid direct glare or harsh shadows on the coin face.',
      icon: '💡'
    },
    {
      title: 'Steady & Parallel',
      description: 'Hold your phone steady and parallel to the coin. Fill the frame with the coin, but keep it in focus.',
      icon: '📱'
    },
    {
      title: 'Both Sides Matter',
      description: 'We need images of both the Obverse (Front) and Reverse (Back) to identify mint marks and specific varieties accurately.',
      icon: '🔄'
    },
    {
      title: 'AI Analysis',
      description: 'Our AI will identify the era, mint, and year. Review the "Mint Mark" description specifically for Republic India coins.',
      icon: '🤖'
    }
  ];

  ngOnInit(): void {
    // Check local storage to see if user has already completed the tutorial
    const hasSeenTutorial = localStorage.getItem('bhawarcoin_scanner_tutorial_seen');
    if (!hasSeenTutorial) {
      this.isOpen.set(true);
    }
  }

  open(): void {
    this.currentStepIndex.set(0);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    localStorage.setItem('bhawarcoin_scanner_tutorial_seen', 'true');
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps.length - 1) {
      this.currentStepIndex.update(i => i + 1);
    } else {
      this.close();
    }
  }

  prevStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update(i => i - 1);
    }
  }

  goToStep(index: number): void {
    this.currentStepIndex.set(index);
  }
}