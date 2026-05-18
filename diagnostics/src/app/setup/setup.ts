import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface UserStatusResponse {
  authenticated: boolean;
  profile_complete: boolean;
  role: 'patient' | 'doctor';
  user_id: number;
}

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup.html',
  styleUrl: './setup.scss'
})
export class ProfileSetupComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = 'http://localhost:8080';

  // Subsystem States
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly userRole = signal<'patient' | 'doctor' | null>(null);

  // Form Binding Data Objects
  protected profileData = {
    first_name: '',
    last_name: '',
    pesel: '',            // Patient Only
    specialization: '',   // Doctor Only
    examination_ids: []   // Doctor Only (Optional array matching schema)
  };

  ngOnInit(): void {
    this.evaluateUserRole();
  }

  private async evaluateUserRole(): Promise<void> {
    try {
      const status = await firstValueFrom(
        this.http.get<UserStatusResponse>(`${this.baseUrl}/api/me`)
      );

      if (!status.authenticated) {
        this.router.navigate(['/login']);
        return;
      }

      this.userRole.set(status.role);
    } catch (error) {
      this.errorMessage.set('Nie udało się zweryfikować sesji użytkownika.');
    }
  }

  protected async handleProfileUpdate(): Promise<void> {
    this.errorMessage.set(null);

    if (!this.profileData.first_name.trim() || !this.profileData.last_name.trim()) {
      this.errorMessage.set('Imię i nazwisko są wymagane.');
      return;
    }

    if (this.userRole() === 'patient') {
      const peselRegex = /^\d{11}$/;
      if (!peselRegex.test(this.profileData.pesel)) {
        this.errorMessage.set('Numer PESEL musi składać się z dokładnie 11 cyfr.');
        return;
      }
    }

    if (this.userRole() === 'doctor' && !this.profileData.specialization.trim()) {
      this.errorMessage.set('Specjalizacja lekarska jest wymagana.');
      return;
    }

    const endpoint = this.userRole() === 'patient' ? '/api/patient/profile' : '/api/doctor/profile';
    const payload: any = {
      first_name: this.profileData.first_name,
      last_name: this.profileData.last_name
    };

    if (this.userRole() === 'patient') {
      payload.pesel = this.profileData.pesel;
    } else {
      payload.specialization = this.profileData.specialization;
      payload.examination_ids = this.profileData.examination_ids;
    }

    this.isSubmitting.set(true);
    try {
      await firstValueFrom(
        this.http.patch(`${this.baseUrl}${endpoint}`, payload)
      );

      // Upon successful generation, data blocks drop completely. Access granted to dashboard!
      this.router.navigate(['/profile']);
    } catch (error) {
      this.handleErrorResponse(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private handleErrorResponse(error: any): void {
    if (error instanceof HttpErrorResponse) {
      this.errorMessage.set(
        error.error?.message || `Wystąpił błąd walidacji danych po stronie serwera (${error.status}).`
      );
    } else {
      this.errorMessage.set('Nieoczekiwany błąd zapisu profilu.');
    }
  }
}
