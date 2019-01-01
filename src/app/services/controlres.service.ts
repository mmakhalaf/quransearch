
import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root'
})
export class ControlsResService {

   onScroll = new Map<any, (dir: number, atTop: boolean)=>void>();
   onScrollToTopRequest = new Map<any, ()=>void>();

   constructor() {
   }

   onScrollUp(at_top: boolean) {
      this.onScroll.forEach((cb) => {
         cb(1, at_top);
      });
   }

   onScrollDown(at_top: boolean) {
      this.onScroll.forEach((cb) => {
         cb(-1, at_top);
      });
   }

   request_scroll_to_top() {
      this.onScrollToTopRequest.forEach((cb) => {
         cb();
      });
   }
}
