import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../core/services/language';

interface PublicResult {
  id: number;
  examination: string;
  doctor_name: string;
  patient_name: string;
  diagnostic_result: string;
  notes: string;
  date: string;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.html',
  styleUrls: ['./results.scss']
})
export class ResultsComponent implements OnInit {
  private route           = inject(ActivatedRoute);
  private http            = inject(HttpClient);
  private languageService = inject(LanguageService);

  readonly text = this.languageService.text;

  result  = signal<PublicResult | null>(null);
  loading = signal<boolean>(true);
  error   = signal<string | null>(null);

  ngOnInit(): void {
    const hash = this.route.snapshot.paramMap.get('hash');
    this.http.get<PublicResult>(`http://localhost:8080/api/results/${hash}`).subscribe({
      next:  (data) => { this.result.set(data);  this.loading.set(false); },
      error: (err)  => {
        this.error.set(err.status === 404
          ? this.text().RESULTS?.ERROR_NOT_FOUND
          : this.text().RESULTS?.ERROR_GENERIC
        );
        this.loading.set(false);
      }
    });
  }
}
