import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:8080/auth/register';

  // Subsystem States
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Form Model Bound Properties
  protected registerData = {
    email: '',
    password: '',
    role: 'patient', // Default initialization
    specialization: ''
  };

  protected readonly isDoctor = computed(() => this.registerData.role === 'doctor');

  protected async handleRegistration(): Promise<void> {
    this.errorMessage.set(null);

    if (!this.registerData.email || !this.registerData.password) {
      this.errorMessage.set('Email oraz hasło są wymagane.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage.set('Wprowadź poprawny adres e-mail.');
      return;
    }

    if (this.registerData.password.length < 8) {
      this.errorMessage.set('Hasło musi składać się z co najmniej 8 znaków.');
      return;
    }

    if (this.isDoctor() && !this.registerData.specialization.trim()) {
      this.errorMessage.set('Lekarz musi podać swoją specjalizację.');
      return;
    }

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
      await firstValueFrom(this.http.post(this.apiUrl, payload));

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
      if (error.status === 400) {
        this.errorMessage.set(error.error?.message || 'Nieprawidłowe dane lub e-mail już istnieje w bazie.');
      } else {
        this.errorMessage.set(`Błąd serwera (${error.status}). Spróbuj ponownie później.`);
      }
    } else {
      this.errorMessage.set('Wystąpił nieoczekiwany błąd sieciowy.');
    }
  }
}
