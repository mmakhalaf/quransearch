import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { QuranService } from '../../../services/quran.service';
import { FilterPres } from '../../../services/filter-pres';

@Component({
   selector: 'qfilters-list',
   templateUrl: './filters-list.component.html',
   styleUrls: ['./filters-list.component.css'],
   host: {
      'style': 'display: flex; direction: rtl;'
   },
   imports: [CommonModule, MatChipsModule, MatIconModule, MatButtonModule]
})
export class FiltersListComponent {

   qService = inject(QuranService);

   onClearAllClicked() {
      this.qService.searchCriteriaPres.clear();
   }

   onSelectFilterClicked(filter: FilterPres) {
      this.qService.searchCriteriaPres.make_current(filter, this.qService.quran);
   }

   onRemoveFilterClicked(filter: FilterPres): void {
      this.qService.searchCriteriaPres.remove_filter(filter);
   }

}
