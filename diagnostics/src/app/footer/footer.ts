import { Component, inject } from '@angular/core';
import { LanguageService } from '../core/services/language';

import { InfoModalService, ModalKey } from '../core/services/modal';
import { InfoModalComponent } from '../modal/modal';

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

  readonly infoModal = inject(InfoModalService);

  open(key: ModalKey): void { this.infoModal.open(key); }
}
