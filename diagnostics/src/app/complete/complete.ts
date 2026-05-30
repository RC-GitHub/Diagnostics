import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LanguageService } from '../core/services/language';
import { ProfileService } from '../core/services/user';

import { Header } from '../header/header';
import { Footer } from '../footer/footer';

interface UserStatusResponse {
  authenticated: boolean;
  profile_complete: boolean;
  role: 'patient' | 'doctor';
  user_id: number;
}

interface Examination {
  id: number;
  name: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './complete.html',
  styleUrl: '../../styles/auth.scss'
})
export class CompleteSetup implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  protected readonly profileService = inject(ProfileService);

  private readonly baseUrl = 'http://localhost:8080';

  readonly text = this.languageService.text;

  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly serverStatusCode = signal<number | null>(null);
  protected readonly userRole = signal<'patient' | 'doctor' | null>(null);
  protected readonly examinations = signal<Examination[]>([]);

  protected profileData = {
      first_name: '',
      last_name: '',
      pesel: '',            // Patient Only
      specialization: ''    // Doctor Only
  };

  protected readonly isDoctor = computed(() => this.userRole() === 'doctor');

  ngOnInit(): void {
    this.evaluateUserRole();
  }

  private async evaluateUserRole(): Promise<void> {
    try {
      const status = await firstValueFrom(
        this.http.get<UserStatusResponse>(`${this.baseUrl}/api/me`)
      );

      if (status.profile_complete) {
        this.router.navigate(['/profile']);
        return;
      }

      if (!status.authenticated) {
        this.router.navigate(['/login']);
        return;
      }

      this.userRole.set(status.role);

      if (status.role === 'doctor') {
        const exams = await firstValueFrom(
          this.http.get<Examination[]>(`${this.baseUrl}/api/examinations`)
        );
        this.examinations.set(exams);
      }

    } catch (error) {
      this.errorMessage.set('SESSION_EXPIRED');
    }
  }

  selectedExaminations: Set<number> = new Set<number>();

  protected isExaminationSelected(id: number): boolean {
    return this.selectedExaminations.has(id);
  }

  protected examinationChecked(examinationId: number): void {
    if (this.selectedExaminations.has(examinationId)) {
      this.selectedExaminations.delete(examinationId);
    } else {
      this.selectedExaminations.add(examinationId);
    }
  }

  protected async handleProfileUpdate(): Promise<void> {
    this.errorMessage.set(null);
    this.serverStatusCode.set(null);

    if (!this.profileData.first_name.trim() || !this.profileData.last_name.trim()) {
      this.errorMessage.set('REQUIRED_NAME');
      return;
    }

    if (this.userRole() === 'patient') {
      const peselRegex = /^\d{11}$/;
      if (!peselRegex.test(this.profileData.pesel)) {
        this.errorMessage.set('INVALID_PESEL');
        return;
      }
    }

    if (this.isDoctor() && !this.profileData.specialization.trim()) {
      this.errorMessage.set('REQUIRED_SPECIALIZATION');
      return;
    }

    const endpoint = this.userRole() === 'patient' ? '/api/patient/profile' : '/api/doctor/profile';

    const payload: any = {
      first_name: this.profileData.first_name.trim(),
      last_name: this.profileData.last_name.trim()
    };

    if (this.userRole() === 'patient') {
      payload.pesel = this.profileData.pesel;
    } else {
      payload.specialization = this.profileData.specialization.trim();
      payload.examination_ids = [...this.selectedExaminations];
    }

    this.isSubmitting.set(true);

    try {
      const updatedData: any = await firstValueFrom(
        this.http.patch(`${this.baseUrl}${endpoint}`, payload)
      );

      console.log(updatedData, updatedData.profile);

      if (updatedData.message === "profile updated successfully") {
        await this.profileService.checkCurrentSession();
      }

      this.router.navigate(['/profile']);
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
        this.errorMessage.set(error.error?.message ? 'BACKEND_MSG' : 'SERVER_ERROR');
        if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        }
      } else {
        this.errorMessage.set('SERVER_ERROR');
      }
    } else {
      this.errorMessage.set('UNEXPECTED');
    }
  }
}
