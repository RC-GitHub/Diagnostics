import { Component, input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../core/services/language';

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  templateUrl: './logo.html',
  styleUrl: '../../styles.scss'
})
export class Logo {
  typeInverse = input<boolean>(false);

  private languageService = inject(LanguageService);
  readonly text = this.languageService.text;
}
