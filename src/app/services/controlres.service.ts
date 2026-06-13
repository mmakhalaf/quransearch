import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ScrollEvent {
   dir: number;
   atTop: boolean;
}

@Injectable({
   providedIn: 'root'
})
export class ControlsResService {

   readonly scroll$ = new Subject<ScrollEvent>();
   readonly scrollToTop$ = new Subject<void>();

   onScrollUp(at_top: boolean) {
      this.scroll$.next({ dir: 1, atTop: at_top });
   }

   onScrollDown(at_top: boolean) {
      this.scroll$.next({ dir: -1, atTop: at_top });
   }

   request_scroll_to_top() {
      this.scrollToTop$.next();
   }
}
