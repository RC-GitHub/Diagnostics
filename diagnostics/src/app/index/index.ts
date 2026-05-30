import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LanguageService } from '../core/services/language';

import { Header } from '../header/header';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexComponent {
  constructor(private router: Router, private languageService: LanguageService) {
      effect(() => {
        const lang = this.languageService.currentLang();
        console.log(`Language changed via Signal: ${lang}`);
        // Your translation logic here
      });
    }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
