import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoModalService } from '../core/services/modal';
import { LanguageService } from '../core/services/language';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class InfoModalComponent {
  readonly modalService    = inject(InfoModalService);
  readonly languageService = inject(LanguageService);
  readonly text            = this.languageService.text;

  get modalData() {
    const key = this.modalService.activeModal();
    if (!key) return null;
    return this.text()?.MODALS?.[key] ?? null;
  }
}
