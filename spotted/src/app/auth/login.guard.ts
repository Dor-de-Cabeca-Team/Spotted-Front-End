import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './login.service';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  const token = loginService.getToken();
  const user = loginService.jwtDecode();

  if (token && user && user.roles && user.roles.length > 0) {
    if (
      user.roles.includes('USUARIO') ||
      (user.roles.includes('ADMIN') && state.url === '/principal')
    ) {
      return true;
    }
  }

  router.navigate(['/login']);
  return false;
};