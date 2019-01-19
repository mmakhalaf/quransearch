import { Component } from '@angular/core';
import { QuranService } from '../../../services/quran.service';
import { opts_ayah_order, opts_ayah_loc } from 'src/app/services/filter-pres';

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

   opts_ayah_order(): Array<any> {
      return opts_ayah_order;
   }

   opts_ayah_loc(): Array<any> {
      return opts_ayah_loc;
   }
}
