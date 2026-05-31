import { Component, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LanguageService } from '../core/services/language';
import { ProfileService } from '../core/services/user';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { InfoModalService, ModalKey } from '../core/services/modal';
import { InfoModalComponent } from '../modal/modal';

import { Logo } from '../logo/logo';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Logo],
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

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly languageService = inject(LanguageService);
  protected readonly profileService = inject(ProfileService);

  private readonly baseUrl = 'http://localhost:8080';

  readonly languages = this.languageService.languages;
  readonly currentLang = this.languageService.currentLang;
  readonly text = this.languageService.text;

  readonly infoModal = inject(InfoModalService);

  open(key: ModalKey): void { this.infoModal.open(key); }

  protected isMobile = signal<boolean>(false);
  protected readonly isLangOpen = signal<boolean>(false);
  protected readonly isMenuOpen = signal<boolean>(false);
  protected readonly isProfileOpen = signal<boolean>(false);

  protected readonly isUserLoggedIn = computed(() => {
    return this.profileService.userRole() !== null;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile.set(window.innerWidth <= 1024);

      window.addEventListener('resize', () => {
        const mobileView = window.innerWidth <= 1024;
        this.isMobile.set(mobileView);
        if (!mobileView) {
          this.isMenuOpen.set(false);
        }
      });

      window.addEventListener('click', () => {
        this.isLangOpen.set(false);
        this.isProfileOpen.set(false);
      });
    }
  }

  protected getMenuAnimationState(): string {
    if (!this.isMobile()) {
      return 'none';
    }
    return this.isMenuOpen() ? 'open' : 'closed';
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
    this.isLangOpen.set(false);
    this.isProfileOpen.set(false);
  }

  protected toggleLang(): void {
    this.isProfileOpen.set(false);
    this.isLangOpen.update(v => !v);
  }

  protected toggleProfile(): void {
    this.isLangOpen.set(false);
    this.isProfileOpen.update(v => !v);
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

  protected navigateTo(path: string): void {
    this.closeMenu();
    this.router.navigate([path]);
  }
  protected async handleLogout(): Promise<void> {
    this.closeMenu();

    this.profileService.clearProfile();

    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true })
      );
    } catch (error) {
      console.error('Błąd podczas usuwania sesji na serwerze:', error);
    } {
      this.navigateToLogin();
    }
  }
}
