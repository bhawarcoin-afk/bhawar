import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from './services/user.service';
import { PaymentModalComponent } from './components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PaymentModalComponent]
})
export class AppComponent {
  title = 'Bhawarcoin';
  userService = inject(UserService);
  currentUser = this.userService.currentUser;

  logout(): void {
    this.userService.logout();
  }
}