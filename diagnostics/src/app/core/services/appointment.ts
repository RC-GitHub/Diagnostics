import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  id: number;
  patient_name?: string;
  doctor_name?: string;
  examination_name: string;
  date: Date;
  notes?: string;
  results?: string;
}

export interface Examination {
  id: number;
  name: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  getActiveAppointments(role: string): Observable<Appointment[]> {
    return role == 'patient' ? this.http.get<Appointment[]>(`${this.baseUrl}/patient/appointments/active`, { withCredentials: true }) : this.http.get<Appointment[]>(`${this.baseUrl}/doctor/schedule/active`, { withCredentials: true });
  }

  getAppointmentHistory(role: string): Observable<Appointment[]> {
    return role == 'patient' ? this.http.get<Appointment[]>(`${this.baseUrl}/patient/appointments/history`, { withCredentials: true }) : this.http.get<Appointment[]>(`${this.baseUrl}/doctor/schedule/history`, { withCredentials: true });
  }

  getAvailableExaminations(): Observable<Examination[]> {
    return this.http.get<Examination[]>(`${this.baseUrl}/examinations`, { withCredentials: true });
  }

  bookAppointment(examinationId: number): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/patient/book`, { examination_id: examinationId }, { withCredentials: true });
  }

  cancelAppointment(appointmentid: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/patient/appointments/${appointmentid}`, { withCredentials: true });
  }

  completeAppointment(appointmentid: number, result: string, notes: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/doctor/appointments/${appointmentid}/complete`, { result, notes }, { withCredentials: true });
  }

  getQrCodeUrl(hash: string): string {
    return `${this.baseUrl}/results/${hash}/qr`;
  }
}
