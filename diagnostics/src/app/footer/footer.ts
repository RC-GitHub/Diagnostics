import { Component, inject } from '@angular/core';
import { LanguageService } from '../core/services/language';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

  private router = inject(Router);
  private languageService = inject(LanguageService);

  readonly text = this.languageService.text;

}
