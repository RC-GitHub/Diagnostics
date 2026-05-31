import { Injectable, signal } from '@angular/core';

export type ModalKey =
  | 'HOW_IT_WORKS' | 'FOR_WHO' | 'CONTACT' | 'FAQ'
  | 'EXAM_OFFER' | 'BOOK_VISIT' | 'RESULTS_HISTORY' | 'QR_CHECK'
  | 'SCHEDULE' | 'ISSUE_RESULT' | 'PROFILE_SPEC'
  | 'TERMS' | 'RODO' | 'COOKIES';

@Injectable({ providedIn: 'root' })
export class InfoModalService {
  activeModal = signal<ModalKey | null>(null);

  open(key: ModalKey): void  { this.activeModal.set(key); }
  close():             void  { this.activeModal.set(null); }
}
