import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface UserStatusResponse {
  authenticated: boolean;
  profile_complete: boolean;
  role: 'patient' | 'doctor';
  user_id: number;
}

export interface GoUserProfile extends UserProfile {
  first_name: string;
  last_name: string;
}

export interface UserProfile {
  id: number;
  email: string;
  role: 'patient' | 'doctor';
  firstName: string;
  lastName: string;
  pesel?: string;
  specialization?: string;
  examination_ids?: number[];
  managed_exams?: Exam[];
}

export interface Exam {
  name: string;
  id: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080';

  private readonly profileState = signal<UserProfile | null>(null);

  readonly userRole = signal<'patient' | 'doctor' | null>(null);
  readonly isProfileComplete = signal<boolean>(false);
  readonly profile = signal<UserProfile | null>(null);

  normalizeGoProfile(data: GoUserProfile) {
    return {
      ...data,
      firstName: data.first_name,
      lastName: data.last_name,
      first_name: undefined,
      last_name: undefined
    };
  }

  setProfile(data: GoUserProfile): void {
    this.profileState.set(data);
    this.userRole.set(data.role);
    this.isProfileComplete.set(!!data.first_name);
    this.profile.set(this.normalizeGoProfile(data));

    sessionStorage.setItem('user_profile', JSON.stringify(data));
  }

  clearProfile(): void {
    this.profileState.set(null);
    this.userRole.set(null);
    this.isProfileComplete.set(false);
    this.profile.set(null);
    sessionStorage.removeItem('user_profile');
  }

  loadPersistedProfile(): void {
    const saved = sessionStorage.getItem('user_profile');
    if (saved) {
      try {
        const data = JSON.parse(saved) as GoUserProfile;
        this.profileState.set(data);
        this.userRole.set(data.role);
        this.isProfileComplete.set(!!data.firstName);
        this.profile.set(this.normalizeGoProfile(data));
      } catch {
        this.clearProfile();
      }
    }
  }

  constructor() {
    this.loadPersistedProfile();
    this.checkCurrentSession();
  }

  async checkCurrentSession(): Promise<void> {
    try {
      // Pobieramy status bezpośrednio z Twojego endpointu w Go
      const status = await firstValueFrom(
        this.http.get<UserStatusResponse>(`${this.baseUrl}/api/me`, { withCredentials: true }),
      );

      if (status.authenticated) {
        this.userRole.set(status.role);
        this.isProfileComplete.set(status.profile_complete);

        if (status.profile_complete) {
          const profileEndpoint = status.role === 'patient' ? '/api/patient/profile' : '/api/doctor/profile';

          const data = await firstValueFrom(
            this.http.get<any>(`${this.baseUrl}${profileEndpoint}`, { withCredentials: true })
          );

          this.profile.set(this.normalizeGoProfile(data));

          console.log(this.profile())
        }

      } else {
        this.clearProfile();
      }
    } catch (error) {
      this.clearProfile();
    }
  }
}
