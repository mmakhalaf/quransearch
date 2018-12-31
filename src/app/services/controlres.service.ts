
import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root'
})
export class ControlsResService {

   onScroll = new Map<any, (dir: number)=>void>();
   onScrollToTopRequest = new Map<any, ()=>void>();

   constructor() {
   }

   onScrollUp() {
      this.onScroll.forEach((cb) => {
         cb(1);
      });
   }

   onScrollDown() {
      this.onScroll.forEach((cb) => {
         cb(-1);
      });
   }

   request_scroll_to_top() {
      this.onScrollToTopRequest.forEach((cb) => {
         cb();
      });
   }
}
