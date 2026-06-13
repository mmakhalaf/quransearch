import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { QuranService } from '../../../services/quran.service';
import * as HttpUtils from '../../../quran/utils/http-utils';

@Component({
   selector: 'qsearch-settings',
   templateUrl: './search-settings.component.html',
   styleUrls: ['./search-settings.component.css'],
   host: {
      'style': 'display: flex; direction: rtl;'
   },
   imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule]
})
export class SearchSettingsComponent {

   qService = inject(QuranService);
   private router = inject(Router);

   onSortOrderChanged() {
      this.qService.searchCriteriaPres.filter_updated();
   }

   onCopyFiltersClicked() {
      let params = this.qService.searchCriteriaPres.to_params(this.qService.quran);
      let params_str = `?${HttpUtils.params_to_string(params)}`;
      let rel_url = this.router.url;
      let url = `${location.origin}`;
      this.qService.copy_text(
         `${url}${rel_url}${params_str}`,
         'تم نسخ رابط البحث'
         );
   }

}
