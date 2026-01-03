import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.currentUser()) {
    return true; // User is logged in, allow access
  }

  // User is not logged in, redirect to login page
  router.navigate(['/login']);
  return false;
};
