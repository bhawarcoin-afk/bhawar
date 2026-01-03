import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-category',
  imports: [CommonModule],
  templateUrl: './category.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
  private route = inject(ActivatedRoute);
  
  // Capitalize the first letter of each word
  private formatCategoryName = (name: string | undefined) => {
    if (!name) return 'Coin Category';
    return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  categoryName = toSignal(
    this.route.paramMap.pipe(map(params => this.formatCategoryName(params.get('name')))),
    { initialValue: 'Coin Category' }
  );
}
