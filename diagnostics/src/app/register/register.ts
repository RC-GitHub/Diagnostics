import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../core/services/language';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../../styles/auth.scss'
})
export class RegisterComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private languageService = inject(LanguageService);
  private readonly baseUrl = 'http://localhost:8080';

  readonly text = this.languageService.text;

  // Subsystem States managed via Signals
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly serverStatusCode = signal<number | null>(null);

  // Form Model Bound Properties
  protected registerData = {
    email: '',
    password: '',
    role: 'patient',
    specialization: ''
  };

  // Derived State Framework
  protected readonly isDoctor = computed(() => this.registerData.role === 'doctor');

  protected async handleRegistration(): Promise<void> {
    this.errorMessage.set(null);
    this.serverStatusCode.set(null);

    // Comprehensive Input Validation
    if (!this.registerData.email || !this.registerData.password) {
      this.errorMessage.set('MISSING_FIELDS');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage.set('INVALID_CREDENTIALS'); // Mapuje na niepoprawny format danych logowania/rejestracji
      return;
    }

    if (this.registerData.password.length < 8) {
      this.errorMessage.set('SHORT_PASSWORD'); // Nowy kod klucza dodany do walidacji JSON
      return;
    }

    if (this.isDoctor() && !this.registerData.specialization.trim()) {
      this.errorMessage.set('MISSING_FIELDS');
      return;
    }

    // Payload Isolation
    const payload: any = {
      email: this.registerData.email,
      password: this.registerData.password,
      role: this.registerData.role
    };

    if (this.isDoctor()) {
      payload.specialization = this.registerData.specialization;
    }

    this.isSubmitting.set(true);

    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/auth/register`, payload)
      );

      // Navigate users onto login view upon 200 OK success state
      this.router.navigate(['/login']);
    } catch (error) {
      this.handleErrorResponse(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private handleErrorResponse(error: any): void {
    if (error instanceof HttpErrorResponse) {
      this.serverStatusCode.set(error.status);

      if (error.status === 400) {
        this.errorMessage.set('INVALID_CREDENTIALS'); // Email zajęty lub złe dane traktujemy jako błąd kryteriów
      } else {
        this.errorMessage.set('SERVER_ERROR');
      }
    } else {
      this.errorMessage.set('UNEXPECTED');
    }
  }
}
