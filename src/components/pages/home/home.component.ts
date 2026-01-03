import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Category {
  name: string;
  link: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  categories: Category[] = [
    { name: 'British India', link: '/category/british-india', description: 'Coins from the era of British rule.', icon: '👑' },
    { name: 'Republic India', link: '/category/republic-india', description: 'Post-independence coinage.', icon: '🇮🇳' },
    { name: 'Mughal Empire', link: '/category/mughal-empire', description: 'Coins from the Mughal Empire (1100-1835)', icon: '🕌' },
    { name: 'Commemorative', link: '/category/commemorative', description: 'Special issues celebrating events.', icon: '🎉' },
    { name: 'Regular Issues', link: '/category/regular-issues', description: 'Standard circulation coins.', icon: ' circulación' },
    { name: 'Coin Accessories', link: '/accessories', description: 'Essential tools and supplies for coin collectors.', icon: '📦' },
  ];
}