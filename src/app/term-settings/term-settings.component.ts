import { Component, OnInit } from '@angular/core';
import { QuranService } from '../services/quran.service';

@Component({
   selector: 'qterm-settings',
   templateUrl: './term-settings.component.html',
   styleUrls: ['./term-settings.component.css'],
   host: {
      'style': 'display: flex; direction: rtl;'
   }
})
export class TermSettingsComponent {

   constructor(public qService: QuranService) {
   }

   onWordOrderChanged() {
      this.qService.searchCriteriaPres.filter_updated();
   }

   onMatchTypeChanged() {
      this.qService.searchCriteriaPres.filter_updated();
   }

}
