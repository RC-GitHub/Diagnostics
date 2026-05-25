import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class IndexComponent {
  // UI View States handled via Signals
  protected readonly isLoginModalOpen = signal<boolean>(false);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Form Binding Properties
  protected loginData = {
    username: '',
    password: ''
  };

  constructor(private router: Router) {}

  protected toggleLoginModal(state: boolean): void {
    this.isLoginModalOpen.set(state);
    if (!state) {
      this.resetLoginForm();
    }
  }

  protected handleLoginSubmit(): void {
    const { username, password } = this.loginData;

    // Comprehensive Input Validation
    if (!username || !password) {
      this.errorMessage.set('Wprowadź nazwę użytkownika oraz hasło.');
      return;
    }

    if (username.trim().length < 3) {
      this.errorMessage.set('Nazwa użytkownika musi mieć co najmniej 3 znaki.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Simulated Authentication Orchestration
    setTimeout(() => {
      this.isSubmitting.set(false);

      if (username === 'admin' && password === 'admin123') {
        this.toggleLoginModal(false);
        this.router.navigate(['/dashboard']); // Route into the diagnostics system engine
      } else {
        this.errorMessage.set('Nieprawidłowe dane logowania. Spróbuj ponownie.');
      }
    }, 1000);
  }

  private resetLoginForm(): void {
    this.loginData = { username: '', password: '' };
    this.errorMessage.set(null);
  }

  protected readonly isLangOpen = signal<boolean>(false);
  protected readonly currentLang = signal<string>('PL');
  protected readonly languages = ['PL', 'EN'];

  protected toggleLang(): void {
    this.isLangOpen.update(v => !v);
  }

  protected selectLang(lang: string): void {
    this.currentLang.set(lang);
    this.isLangOpen.set(false);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
