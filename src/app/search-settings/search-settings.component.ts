import { Component } from '@angular/core';
import { QuranService } from '../services/quran.service';
import { Location } from '@angular/common';
import * as HttpUtils from '../quran/utils/http-utils';

@Component({
   selector: 'qsearch-settings',
   templateUrl: './search-settings.component.html',
   styleUrls: ['./search-settings.component.css'],
   host: {
      'style': 'display: flex; direction: rtl;'
   }
})
export class SearchSettingsComponent {

   constructor(public qService: QuranService, private location: Location) {
   }

   onSortOrderChanged() {
      this.qService.searchCriteriaPres.filter_updated();
   }

   onCopyFiltersClicked() {
      this.qService.copy_text(
         `${location.href}${this.location.path()}?${HttpUtils.params_to_string(this.qService.searchCriteriaPres.to_params(this.qService.quran))}`,
         'تم نسخ رابط البحث'
         );
   }
   
}
