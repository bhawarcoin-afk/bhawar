import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accessories',
  imports: [CommonModule],
  templateUrl: './accessories.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessoriesComponent {

}
