import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LanguageService } from '../core/services/language';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  animations: [
    trigger('toggleMenu', [
      state(
        'closed',
        style({
          height: '0px',
          opacity: 0,
          transform: 'translateY(-20px)',
          paddingTop: '0px',
          paddingBottom: '0px',
          overflow: 'hidden',
          visibility: 'hidden',
        }),
      ),
      state(
        'open',
        style({
          height: '*',
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      transition('closed <=> open', [animate('250ms cubic-bezier(0.4, 0, 0.2, 1)')]),
    ]),
  ],
})
export class Header {
  private platformId = inject(PLATFORM_ID);

  private router = inject(Router);
  private languageService = inject(LanguageService);

  readonly languages = this.languageService.languages;
  readonly currentLang = this.languageService.currentLang;

  readonly text = this.languageService.text;

  protected readonly isLangOpen = signal<boolean>(false);
  protected isMobile = signal<boolean>(false);
  protected readonly isMenuOpen = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Set initial screen state on load
      this.isMobile.set(window.innerWidth <= 1024);

      // Listen for window resize adjustments to switch layout contexts dynamically
      window.addEventListener('resize', () => {
        const mobileView = window.innerWidth <= 1024;
        this.isMobile.set(mobileView);
        if (!mobileView) {
          this.isMenuOpen.set(false); // Reset open states when going to desktop
        }
      });
    }
  }

  getMenuAnimationState(): string {
    if (!this.isMobile()) {
      return 'none';
    }
    return this.isMenuOpen() ? 'open' : 'closed';
  }

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected toggleLang(): void {
    this.isLangOpen.update((v) => !v);
  }

  protected changeLang(lang: string): void {
    this.languageService.setLanguage(lang);
    this.isLangOpen.set(false);
  }

  getLanguageName(lang: string): string {
    return this.text().HEADER?.LANGUAGES?.[lang.toUpperCase()] ?? lang;
  }

  // Routes
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
