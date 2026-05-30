import { Component, signal, inject } from '@angular/core';
import { LanguageService } from '../core/services/language';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
    private router = inject(Router);
    private languageService = inject(LanguageService);

    readonly languages = this.languageService.languages;
    readonly currentLang = this.languageService.currentLang;

    readonly text = this.languageService.text;

    protected readonly isLangOpen = signal<boolean>(false);

    protected toggleLang(): void {
      this.isLangOpen.update(v => !v);
    }

    protected changeLang(lang: string): void {
      this.languageService.setLanguage(lang);
      this.isLangOpen.set(false);
    }

    // Routes
    navigateToLogin(): void {
      this.router.navigate(['/login']);
    }
}
