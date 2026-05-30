import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../core/services/language';
import { firstValueFrom } from 'rxjs';

import { Header } from '../header/header';
import { Footer } from '../footer/footer';

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
  imports: [CommonModule, FormsModule, RouterLink, Header, Footer],
  templateUrl: './login.html',
  styleUrl: '../../styles/auth.scss'
})
export class LoginComponent {

  private router = inject(Router);
  private languageService = inject(LanguageService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080';

  readonly text = this.languageService.text;

  // Subsystem States managed via Signals
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly serverStatusCode = signal<number | null>(null);

  // Form Binding Properties
  protected loginData = {
    email: '',
    password: '',
    role: 'patient'
  };

  protected async handleLogin(): Promise<void> {
    this.errorMessage.set(null);

    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage.set('MISSING_FIELDS');
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

    } catch (error: any) {
      this.handleErrorResponse(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private routeUserBasedOnStatus(status: UserStatusResponse): void {
    if (!status.profile_complete) {
      this.router.navigate(['/complete']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  private handleErrorResponse(error: any): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        this.errorMessage.set('INVALID_CREDENTIALS');
      } else {
        this.errorMessage.set('SERVER_ERROR');
      }
    } else {
      this.errorMessage.set('UNEXPECTED');
    }
  }
}
