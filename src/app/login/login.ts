import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface UserStatusResponse {
  authenticated: boolean;
  message: string;
  profile_complete: boolean;
  role: 'patient' | 'doctor';
  user_id: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = 'http://localhost:8080';

  // Subsystem States managed via Signals
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Form Binding Properties
  protected loginData = {
    email: '',
    password: '',
    role: 'patient' // Matches specification default options
  };

  protected async handleLogin(): Promise<void> {
    this.errorMessage.set(null);

    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage.set('Wprowadź adres e-mail oraz hasło.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/auth/login`, this.loginData)
      );

      const status = await firstValueFrom(
        this.http.get<UserStatusResponse>(`${this.baseUrl}/api/me`)
      );

      this.routeUserBasedOnStatus(status);

    } catch (error) {
      this.handleErrorResponse(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private routeUserBasedOnStatus(status: UserStatusResponse): void {
    if (!status.profile_complete) {
      // If profile is incomplete, route away from dashboards to prevent backend 403 blocks
      this.router.navigate(['/setup']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  private handleErrorResponse(error: any): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        this.errorMessage.set('Nieprawidłowy e-mail, hasło lub wybrana rola.');
      } else {
        this.errorMessage.set(`Błąd połączenia z serwerem (${error.status}). Spróbuj ponownie.`);
      }
    } else {
      this.errorMessage.set('Wystąpił nieoczekiwany błąd aplikacji.');
    }
  }
}
