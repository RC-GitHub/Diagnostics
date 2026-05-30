import { Component, inject } from '@angular/core';
import { LanguageService } from '../core/services/language';

import { Logo } from '../logo/logo';

@Component({
  selector: 'app-footer',
  imports: [Logo],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private languageService = inject(LanguageService);
  readonly text = this.languageService.text;
}
