import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { AuthResponse, LoginRequest, User } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:8081/api/v1";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('Login successful, storing tokens');
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          const user: User = {
            username: response.username,
            role: response.role as "ADMIN" | "USER",
          };
          localStorage.setItem("user", JSON.stringify(user));
          this.currentUserSubject.next(user);
          console.log('Token stored:', response.accessToken.substring(0, 20) + '...');
        }),
      );
  }

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem("refreshToken");
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/refresh`, refreshToken)
      .pipe(
        tap((response) => {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
        }),
      );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      if (Date.now() >= exp) {
        console.log('Token expired, clearing auth data');
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      console.log('Invalid token, clearing auth data');
      this.logout();
      return false;
    }
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === "ADMIN";
  }

  getToken(): string | null {
    const token = localStorage.getItem("accessToken");
    console.log('Getting token:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserSubject.next(user);
    }
  }
}
