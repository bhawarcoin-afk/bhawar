import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  userService = inject(UserService);
  
  stats = {
    totalUsers: 12543,
    activeAuctions: 5,
    coinsIdentifiedToday: 142,
    totalRevenue: 450000
  };

  recentActivities = [
    { user: 'Rohan Gupta', action: 'Added "1 Rupee 1947" to collection', time: '2 mins ago' },
    { user: 'Priya Sharma', action: 'Placed bid on "Mohur 1862"', time: '15 mins ago' },
    { user: 'Amit Patel', action: 'Registered new account', time: '1 hour ago' },
    { user: 'Suresh Kumar', action: 'Verified listing #4022', time: '3 hours ago' }
  ];
}