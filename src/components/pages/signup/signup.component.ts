import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  private userService = inject(UserService);

  name = '';
  email = '';
  mobile = '';
  password = '';
  confirmPassword = '';

  async onSignUp(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    await this.userService.signup({
      name: this.name,
      email: this.email,
      mobile: this.mobile,
      password: this.password
    });
  }
}
