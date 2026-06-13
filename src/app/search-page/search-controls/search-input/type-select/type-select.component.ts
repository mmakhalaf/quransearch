import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { QuranService } from '../../../../services/quran.service';

@Component({
   selector: 'qinput-type-select',
   templateUrl: './type-select.component.html',
   styleUrls: ['./type-select.component.css'],
   imports: [FormsModule, MatFormFieldModule, MatInputModule]
})
export class TypeSelectComponent {

   qService = inject(QuranService);

   onTermTypeChanged() {
      this.qService.searchCriteriaPres.cur_filter.cur_search_term = '';
      this.qService.searchCriteriaPres.filter_updated();
   }

}
