import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔍 Interceptor called for:', req.url);
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const directToken = localStorage.getItem('accessToken');
  console.log('🔧 Auth service token:', token ? 'EXISTS' : 'NULL');
  console.log('🔧 Direct localStorage token:', directToken ? 'EXISTS' : 'NULL');

  if (token) {
    console.log('✅ Adding auth header for request:', req.url);
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    const authReq = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    });
    
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('❌ Request failed:', req.url, 'Status:', error.status);
        if (error.status === 401) {
          console.log('🚨 Auth failed (401), redirecting to login');
          authService.logout();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          console.log('⚠️ Access forbidden (403) - insufficient permissions for:', req.url);
          // Don't redirect to login for 403 errors, just log the error
        }
        return throwError(() => error);
      })
    );
  } else {
    console.log('⚠️ No token available for request:', req.url);
  }

  return next(req);
};
