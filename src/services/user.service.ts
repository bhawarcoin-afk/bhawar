import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  user_id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'user' | 'admin';
  verified: boolean;
  created_at: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private router = inject(Router);
  currentUser = signal<User | null>(null);

  constructor() {
    // Check local storage for a logged-in user to persist session
    const storedUser = localStorage.getItem('bhawarcoin_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Make sure date is correctly parsed
      user.created_at = new Date(user.created_at);
      this.currentUser.set(user);
    }
  }

  private isAdmin(email: string): boolean {
    return email === "bhawarcoin@gmail.com";
  }

  // Mock login
  async login(email: string, password: string): Promise<boolean> {
    if (email && password) {
      // Determine role based on email logic
      const role = this.isAdmin(email) ? 'admin' : 'user';

      // In a real app, you'd call an API
      const mockUser: User = {
        user_id: 'mock-user-123',
        name: role === 'admin' ? 'Bhawar Admin' : 'Bhawar Singh',
        email: email,
        mobile: '9216931412',
        role: role,
        verified: true,
        created_at: new Date('2023-01-15T10:00:00Z'),
      };
      this.currentUser.set(mockUser);
      localStorage.setItem('bhawarcoin_user', JSON.stringify(mockUser));
      
      // Redirect based on role
      if (role === 'admin') {
        await this.router.navigate(['/admin']);
      } else {
        await this.router.navigate(['/profile']);
      }
      return true;
    }
    return false;
  }

  // Mock signup
  async signup(details: { name: string, email: string, mobile: string, password: string }): Promise<boolean> {
     if (details.name && details.email && details.mobile && details.password) {
      const role = this.isAdmin(details.email) ? 'admin' : 'user';

      const newUser: User = {
        user_id: `mock-user-${Date.now()}`,
        name: details.name,
        email: details.email,
        mobile: details.mobile,
        role: role,
        verified: false, // new users are not verified by default
        created_at: new Date(),
      };
      this.currentUser.set(newUser);
      localStorage.setItem('bhawarcoin_user', JSON.stringify(newUser));
      
      if (role === 'admin') {
        await this.router.navigate(['/admin']);
      } else {
        await this.router.navigate(['/profile']);
      }
      return true;
    }
    return false;
  }
  
  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('bhawarcoin_user');
    this.router.navigate(['/home']);
  }
}