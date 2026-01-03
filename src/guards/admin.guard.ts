import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const user = userService.currentUser();

  if (user && user.role === 'admin') {
    return true; // User is logged in and is admin
  }

  // Not authorized
  router.navigate(['/home']);
  return false;
};