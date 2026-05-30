import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {

  readonly languages = ['pl', 'en'];
  readonly currentLang = signal<string>('pl');

  setLanguage(lang: string): void {
    this.currentLang.set(lang);
  }

  constructor() {
    effect(() => {
      this.fetchAllTranslationFiles(this.currentLang());
    });
  }

  private http = inject(HttpClient);

  readonly translationTextSignal = signal<any>({});
  readonly text = this.translationTextSignal.asReadonly();

  private readonly translationModules = ['header', 'index'];

  private fetchAllTranslationFiles(lang: string): void {
    const requests = this.translationModules.map(module =>
      this.http.get<Record<string, any>>(`./i18n/${lang}/${module}.json`)
    );

    forkJoin(requests).subscribe({
      next: (jsonResponses) => {
        const mergedTranslations = jsonResponses.reduce((accumulator, currentObject) => {
          return { ...accumulator, ...currentObject };
        }, {});

        this.translationTextSignal.set(mergedTranslations);
        console.log(`Successfully merged all translation modules for [${lang}]`);
      },
      error: (err) => {
        console.error(`Error loading translation modules for [${lang}]`, err);
      }
    });
  }
}
