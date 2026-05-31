import { Component, inject, signal, WritableSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../core/services/language';
import { ProfileService } from '../core/services/user';
import { Router } from '@angular/router';
import { AppointmentService, Appointment, Examination } from '../core/services/appointment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent {
  readonly router = inject(Router);
  
  private languageService = inject(LanguageService);
  private appointmentService = inject(AppointmentService);
  readonly profileService = inject(ProfileService);
  readonly text = this.languageService.text;

  currentTab: 'active' | 'history' | 'settings' = 'active';

  alertMessage = signal<string | null>(null);

  showAlert(msg: string): void {
    this.alertMessage.set(msg);
  }

  // --- Modals ---
  showExaminationsModal = signal<boolean>(false);
  showQrModal           = signal<boolean>(false);
  showCompleteModal     = signal<boolean>(false);
  showNotesModal        = signal<boolean>(false);
  showPeselModal        = signal<boolean>(false);

  // --- Data ---
  appointmentsList:     WritableSignal<Appointment[]>  = signal([]);
  filteredResults:      WritableSignal<Appointment[]>  = signal([]);
  availableExaminations:WritableSignal<Examination[]>  = signal([]);
  allExaminations:      WritableSignal<Examination[]>  = signal([]);

  selectedQrCodeUrl:    string | null = null;
  selectedNotes:        string | null = null;
  selectedCategory:     string = 'All';
  searchQuery:          string = '';

  // --- Complete modal ---
  selectedAppointmentId: number | null = null;
  completionResult:      string = '';
  completionNotes:       string = '';

  // --- PESEL modal ---
  peselPassword:    string = '';
  revealedPesel = signal<string | null>(null);
  peselError    = signal<string | null>(null);
  peselLoading:     boolean = false;

  // --- Settings form ---
  settingsFirstName:    string = '';
  settingsLastName:     string = '';
  settingsEmail:        string = '';
  settingsPesel:        string = '';
  settingsSpecialization: string = '';
  settingsExamIds:      number[] = [];
  settingsSaving:       boolean = false;
  settingsSaved:        boolean = false;
  settingsError:        string | null = null;

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
          if (this.currentTab === 'active' || this.currentTab === 'history') {
            this.loadTabItems();
          }
        }
      }
    });
  }

  switchTab(tab: 'active' | 'history' | 'settings'): void {
    this.currentTab = tab;
    this.searchQuery = '';
    this.selectedCategory = 'All';
    if (tab === 'settings') {
      this.initSettingsForm();
    } else {
      this.loadTabItems();
    }
  }

  loadTabItems(): void {
    const role = this.profileService.userRole()!;
    const obs = this.currentTab === 'active'
      ? this.appointmentService.getActiveAppointments(role)
      : this.appointmentService.getAppointmentHistory(role);

    obs.subscribe({
      next: (data) => { this.appointmentsList.set(data); this.applyFilters(); },
      error: (err) => console.error('Failed to load appointments', err)
    });
  }

  applyFilters(): void {
    this.filteredResults.set(this.appointmentsList().filter((item) => {
      item.result = item.result ? item.result : item.results || 'N/A';
      const q = this.searchQuery.toLowerCase();
      return (item.patient_name || '').toLowerCase().includes(q)
          || (item.doctor_name  || '').toLowerCase().includes(q)
          || (item.examination_name || '').toLowerCase().includes(q)
          || (item.result || '').toLowerCase().includes(q)
          || (item.notes || '').toLowerCase().includes(q)
          || new Date(item.date || '').toISOString().toLowerCase().includes(q);
    }));
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  // --- Booking ---
  openBookingModal(): void {
    this.appointmentService.getAvailableExaminations().subscribe({
      next: (exams) => { this.availableExaminations.set(exams); this.showExaminationsModal.set(true); },
      error: (err) => console.error('Failed to pull examination specifications', err)
    });
  }

  bookAppointment(examinationId: number): void {
    this.appointmentService.bookAppointment(examinationId).subscribe({
      next: () => { this.showExaminationsModal.set(false); this.loadTabItems(); },
      error: (err) => this.showAlert(err.error?.message || 'Error booking appointment.')
    });
  }

  cancelAppointment(id: number): void {
    if (confirm(this.text().PROFILE?.SETTINGS?.CANCEL_CONFIRM)) {
      this.appointmentService.cancelAppointment(id).subscribe({
        next: () => this.loadTabItems(),
        error: (err: any) => console.error('Cancellation failed', err)
      });
    }
  }

  // --- Complete modal ---
  openCompleteModal(id: number): void {
    this.selectedAppointmentId = id;
    this.completionResult = '';
    this.completionNotes = '';
    this.showCompleteModal.set(true);
  }

  submitCompletion(): void {
    if (!this.selectedAppointmentId || !this.completionResult.trim()) return;
    this.appointmentService.completeAppointment(
      this.selectedAppointmentId, this.completionResult, this.completionNotes
    ).subscribe({
      next: () => { this.showCompleteModal.set(false); this.selectedAppointmentId = null; this.loadTabItems(); },
      error: (err: any) => console.error('Completion failed', err)
    });
  }

  // --- Notes modal ---
  openNotesModal(notes: string): void {
    this.selectedNotes = notes;
    this.showNotesModal.set(true);
  }

  // --- QR modal ---
  openQrModal(hash: string | undefined): void {
    if (!hash) return;
    this.selectedQrCodeUrl = this.appointmentService.getQrCodeUrl(hash);
    this.showQrModal.set(true);
  }

  // Update openPeselModal to reset signals
  openPeselModal(): void {
    this.peselPassword = '';
    this.revealedPesel.set(null);
    this.peselError.set(null);
    this.showPeselModal.set(true);
  }

  submitPeselReveal(): void {
    if (!this.peselPassword.trim()) return;
    this.peselLoading = true;
    this.peselError.set(null);

    this.profileService.revealPesel(this.peselPassword).subscribe({
      next: (res) => {
        console.log(res); // verify shape here
        this.revealedPesel.set(res.pesel);
        this.peselLoading = false;
      },
      error: (err) => {
        this.peselError.set(err.status === 401 ? 'Incorrect password.' : 'Something went wrong.');
        this.peselLoading = false;
      }
    });
  }

  // --- Settings ---
  initSettingsForm(): void {
    const p = this.profileService.profile();
    this.settingsFirstName      = p?.firstName      || '';
    this.settingsLastName       = p?.lastName       || '';
    this.settingsEmail          = p?.email          || '';
    this.settingsPesel          = '';
    this.settingsSpecialization = p?.specialization || '';

    // Extract ids from managed_exams objects instead of examination_ids
    this.settingsExamIds = (p?.managed_exams || []).map(e => e.id);

    this.settingsSaved  = false;
    this.settingsError  = null;

    if (this.profileService.userRole() === 'doctor') {
      this.appointmentService.getAvailableExaminations().subscribe({
        next: (exams) => this.allExaminations.set(exams),
        error: () => {}
      });
    }
  }

  toggleExam(id: number): void {
    this.settingsExamIds = this.settingsExamIds.includes(id)
      ? this.settingsExamIds.filter(e => e !== id)
      : [...this.settingsExamIds, id];
  }

  saveSettings(): void {
    this.settingsSaving = true;
    this.settingsError  = null;
    this.settingsSaved  = false;

    const role = this.profileService.userRole();
    const body: any = {
      first_name: this.settingsFirstName,
      last_name:  this.settingsLastName,
    };

    if (role === 'patient' && this.settingsPesel.trim()) {
      body.pesel = this.settingsPesel;
    }
    if (role === 'doctor') {
      body.specialization  = this.settingsSpecialization;
      body.examination_ids = this.settingsExamIds;
    }

    this.profileService.updateProfile(body).subscribe({
      next: () => {
        this.settingsSaving = false;
        this.settingsSaved  = true;
        // Re-fetch cleanly instead of trying to parse the PATCH response
        this.profileService.checkCurrentSession();
      },
      error: (err) => {
        this.settingsSaving = false;
        this.settingsError = err.error?.error || 'Failed to save changes.';
      }
    });
  }

  closeModals(): void {
    this.showExaminationsModal.set(false);
    this.showQrModal.set(false);
    this.showCompleteModal.set(false);
    this.showNotesModal.set(false);
    this.showPeselModal.set(false);
    this.selectedQrCodeUrl = null;
    this.selectedAppointmentId = null;
    this.selectedNotes = null;
    this.alertMessage.set(null);
  }
}
