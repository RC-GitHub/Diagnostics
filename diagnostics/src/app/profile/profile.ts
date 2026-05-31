import { Component, OnInit, inject, signal, WritableSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../core/services/language';
import { ProfileService } from '../core/services/user';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs/operators';
import { AppointmentService, Appointment, Examination } from '../core/services/appointment';

import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent {
  readonly router = inject(Router);
  private languageService = inject(LanguageService);
  private appointmentService = inject(AppointmentService);
  readonly profileService = inject(ProfileService);
  readonly text = this.languageService.text;

  currentTab: 'active' | 'history' = 'active';

  showExaminationsModal = signal<boolean>(false);
  showQrModal = signal<boolean>(false);

  appointmentsList: WritableSignal<Appointment[]> = signal([]);
  filteredResults: WritableSignal<Appointment[]> = signal([]);
  availableExaminations: WritableSignal<Examination[]> = signal([]);
  selectedQrCodeUrl: string | null = null;

  selectedCategory: string = 'All';
  searchQuery: string = '';

  constructor() {
    effect(() => {
      const loading = this.profileService.isLoading();
      const role = this.profileService.userRole();
      const profileComplete = this.profileService.isProfileComplete();

      if (!loading) {
        if (!role) {
          this.router.navigate(['/login']);
        } else if (!profileComplete) {
          this.router.navigate(['/complete']);
        } else {
          this.loadTabItems();
        }
      }
    });
  }

  switchTab(tab: 'active' | 'history'): void {
    this.currentTab = tab;
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.loadTabItems();
  }

  loadTabItems(): void {
    if (this.currentTab === 'active') {
      this.appointmentService.getActiveAppointments(this.profileService.userRole()!!).subscribe({
        next: (data) => {

          console.log(data)

          this.appointmentsList.set(data);
          this.applyFilters();
        },
        error: (err) => console.error('Failed to load active appointments', err)
      });
    } else {
      this.appointmentService.getAppointmentHistory(this.profileService.userRole()!!).subscribe({
        next: (data) => {

          console.log(data)

          this.appointmentsList.set(data);
          this.applyFilters();
        },
        error: (err) => console.error('Failed to load appointment history', err)
      });
    }
  }

  applyFilters(): void {
    this.filteredResults.set(this.appointmentsList().filter((item) => {
      const patientName = item.patient_name || '';
      const doctorName = item.doctor_name || '';
      const examName = item.examination_name || '';
      const date = new Date(item.date || '');

      const matchesSearch =
        patientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        doctorName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        examName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        date.toISOString().toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesSearch;
    }));
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  openBookingModal(): void {
    this.appointmentService.getAvailableExaminations().subscribe({
      next: (exams) => {
        this.availableExaminations.set(exams);
        this.showExaminationsModal.set(true);
      },
      error: (err) => console.error('Failed to pull examination specifications', err)
    });
  }

  bookAppointment(examinationId: number): void {
    this.appointmentService.bookAppointment(examinationId).subscribe({
      next: () => {
        this.showExaminationsModal.set(false);
        this.loadTabItems();
      },
      error: (err) => alert(err.error?.message || 'Error executing room booking transaction.')
    });
  }

  cancelAppointment(id: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(id).subscribe({
        next: () => {
          this.loadTabItems();
        },
        error: (err: any) => console.error('Cancellation transaction failed', err)
      });
    }
  }

  // Add these signals
  showCompleteModal = signal<boolean>(false);
  selectedAppointmentId: number | null = null;
  completionResult: string = '';
  completionNotes: string = '';

  // Replace completeAppointment() with:
  openCompleteModal(id: number): void {
    this.selectedAppointmentId = id;
    this.completionResult = '';
    this.completionNotes = '';
    this.showCompleteModal.set(true);
  }

  submitCompletion(): void {
    if (!this.selectedAppointmentId || !this.completionResult.trim()) return;
    this.appointmentService.completeAppointment(
      this.selectedAppointmentId,
      this.completionResult,
      this.completionNotes
    ).subscribe({
      next: () => {
        this.showCompleteModal.set(false);
        this.selectedAppointmentId = null;
        this.loadTabItems();
      },
      error: (err: any) => console.error('Completion transaction failed', err)
    });
  }

  openQrModal(hash: string | undefined): void {
    if (!hash) return;
    this.selectedQrCodeUrl = this.appointmentService.getQrCodeUrl(hash);
    this.showQrModal.set(true);
  }

  closeModals(): void {
    this.showExaminationsModal.set(false);
    this.showQrModal.set(false);
    this.showCompleteModal.set(false);
    this.selectedQrCodeUrl = null;
    this.selectedAppointmentId = null;
  }
}
