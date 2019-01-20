import { Component, ViewChild, OnInit } from '@angular/core';
import { QuranService } from './services/quran.service';

// Consts
@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

   @ViewChild('cb')
   cb: any;

   constructor(private qService: QuranService) {

   }

   ngOnInit() {
      this.qService.cbElem = this.cb.nativeElement;
   }
}
