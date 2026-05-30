import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageService } from '../core/services/language';

import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexComponent {
  private router = inject(Router);
  private languageService = inject(LanguageService);

  readonly text = this.languageService.text;
  constructor() {
    effect(() => {
      console.log('Current translations state:', this.text());
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
