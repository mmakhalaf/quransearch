import { Component, OnInit } from '@angular/core';
import { QuranService } from '../../../services/quran.service';
import { FilterPres } from '../../../services/filter-pres';

@Component({
   selector: 'qfilters-list',
   templateUrl: './filters-list.component.html',
   styleUrls: ['./filters-list.component.css'],
   host: {
      'style': 'display: flex; direction: rtl;'
   }
})
export class FiltersListComponent {

   constructor(public qService: QuranService) {

   }

   onClearAllClicked() {
      this.qService.searchCriteriaPres.clear();
   }

   onSelectFilterClicked(filter: FilterPres) {
      this.qService.searchCriteriaPres.make_current(filter, this.qService.quran);
   }

   onRemoveFilterClicked(filter: FilterPres): void {
      this.qService.searchCriteriaPres.remove_filter(filter);
      // this.change_det.detectChanges();
   }
   

}
