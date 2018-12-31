import { Component, OnInit, ViewChild } from '@angular/core';
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
      public qService: QuranService,
      private route: ActivatedRoute
      ) {
   }

   ngOnInit() {
      this.route.queryParams.subscribe((params: ParamMap) => {
         this.on_query_change(params);
      });
   }

   on_query_change(params: ParamMap) {
      // let q = params['q'];
      // let r = params['r'];
      // let c = params['c'];
      // if (q !== undefined) {
      //    this.qService.perform_search(q, SearchMode.Word);
      // } else if (r !== undefined) {
      //    this.qService.perform_search(r, SearchMode.Root);
      // } else if (c !== undefined) {
      //    this.qService.perform_search(c, SearchMode.Category);
      // }
   }
}
