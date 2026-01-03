import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MintService } from '../../../services/mint.service';

@Component({
  selector: 'app-mints',
  imports: [CommonModule],
  templateUrl: './mints.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MintsComponent {
  private mintService = inject(MintService);
  mints = this.mintService.getMints();
}
