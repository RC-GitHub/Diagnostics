import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const credentialReq = req.clone({
    withCredentials: true
  });

  return next(credentialReq);
};
