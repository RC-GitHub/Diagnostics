import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ProfileService } from '../services/user';
import { inject, Injector, runInInjectionContext } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const router = inject(Router);

  const credentialReq = req.clone({ withCredentials: true });

  return next(credentialReq).pipe(
    catchError((error) => {
      const isPeselEndpoint = req.url.includes('/profile/pesel');
      if ((error.status === 401 || error.status === 403) && !isPeselEndpoint) {
        runInInjectionContext(injector, () => {
          inject(ProfileService).clearProfile();
        });
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
