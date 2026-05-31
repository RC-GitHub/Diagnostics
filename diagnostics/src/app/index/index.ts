import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageService } from '../core/services/language';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexComponent {
  private router = inject(Router);
  private languageService = inject(LanguageService);

  readonly text = this.languageService.text;

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
