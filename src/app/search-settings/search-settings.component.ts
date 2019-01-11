import { Component } from '@angular/core';
import { QuranService } from '../services/quran.service';
import * as HttpUtils from '../quran/utils/http-utils';
import { Router } from '@angular/router';

@Component({
   selector: 'qsearch-settings',
   templateUrl: './search-settings.component.html',
   styleUrls: ['./search-settings.component.css'],
   host: {
      'style': 'display: flex; direction: rtl;'
   }
})
export class SearchSettingsComponent {

   constructor(
      public qService: QuranService,
      private router: Router) {
   }

   onSortOrderChanged() {
      this.qService.searchCriteriaPres.filter_updated();
   }

   onCopyFiltersClicked() {
      let params = this.qService.searchCriteriaPres.to_params(this.qService.quran);
      let params_str = `?${HttpUtils.params_to_string(params)}`;
      let rel_url = this.router.url;
      let url = `${location.origin}`;
      this.qService.copy_text(
         `${url}/${rel_url}${params_str}`,
         'تم نسخ رابط البحث'
         );
   }
   
}
