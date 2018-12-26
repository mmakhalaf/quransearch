import { Component, OnInit } from '@angular/core';
import { QuranService } from './services/quran.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

// Consts
@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

   constructor(
      private qService: QuranService,
      private route: ActivatedRoute
      ) {
   }

   ngOnInit() {
      this.route.queryParams.subscribe((params: ParamMap) => {
         this.on_query_change(params);
      });
   }

   on_query_change(params: ParamMap) {
      let q = params['q'];
      let r = params['r'];
      console.log(`OnInit ${q}, ${r}`);
      if (q !== undefined) {
         this.qService.perform_query_search(q);
      } else if (r !== undefined) {
         this.qService.perform_root_search(r);
      }
   }

   onMoreClicked() {
      this.qService.show_more();
   }

   /// DOM & Search

   can_show_more(): boolean {
      return this.qService.can_show_more();
   }
}
