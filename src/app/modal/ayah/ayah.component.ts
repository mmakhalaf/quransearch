import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Ayah, Surah, Quran, QuranWord, Category } from '../../quran/quran';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { QuranService } from '../../services/quran.service';
import { NavService } from '../../services/nav-service.service';

@Component({
   selector: 'qmodal-ayah-dialog',
   templateUrl: './ayah.component.html',
   styleUrls: ['./ayah.component.css']
})
export class AyahDialogComponent implements OnInit {

   constructor(
      public dialogRef: MatDialogRef<AyahDialogComponent>,
      private qService: QuranService,
      private navService: NavService,
      @Inject(MAT_DIALOG_DATA) public ayah: Ayah
      ) {
      
   }

   ngOnInit() {
      if (isNullOrUndefined(this.ayah)) {
         console.error('No Ayah Provided');
         this.dialogRef.close();
      }
   }

   onWordClicked(word: QuranWord) {
      this.qService.request_search_with_word_filter(word.imlaai, false);
      this.dialogRef.close();
   }

   onCategoryClicked(cat: Category) {
      this.qService.request_search_with_cat_filter(cat, false);
      this.dialogRef.close();
   }

   onNavAyahLink(ayah: Ayah) {
      this.navService.open_ayah_and_copy_link(ayah.id);
   }

   onCopyAyah(ayah: Ayah) {
      this.qService.copy_text(ayah.uthmani, 'تم نسخ الآية');
   }

   ///

   show_related(): boolean {
      return this.ayah.related_ayat.length > 0;
   }

   show_categories(): boolean {
      return this.ayah.categories.length > 0;
   }

   show_tabs(): boolean {
      return this.show_categories() && this.show_related();
   }
}

@Component({
   selector: 'qmodal-ayah',
   template: ''
})
export class AyahComponent implements OnInit, OnDestroy {

   id = NaN;
   private dialogRef: MatDialogRef<AyahDialogComponent, any> = null;

   constructor(
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private qService: QuranService,
      private navService: NavService
      ) {
      this.qService.onQuranLoaded.set(this, (q: Quran) => {this.on_quran_loaded(q); });
   }
   
   ngOnInit() {
      console.log('Ayah Component Created');
      this.route.params.subscribe((params: {id: string}) => {
         console.log('Ayah Query');
         this.id = +params.id;
         setTimeout(() => {
            this.on_quran_loaded(this.qService.quran);
         });
      });

      setTimeout(() => {
         this.on_quran_loaded(this.qService.quran);
      });
   }

   ngOnDestroy() {
      console.log('Ayah Component Destroyed');
      if (!isNullOrUndefined(this.dialogRef)) {
         this.dialogRef.close();
      }
   }

   private on_quran_loaded(q: Quran) {
      if (q == null || isNaN(this.id)) {
         return;
      }

      let ayah = q.get_ayah(this.id);
      if (isNullOrUndefined(ayah)) {
         this.destroy();
         return;
      }

      if (this.dialogRef == null) {
         this.dialogRef = this.dialog.open(AyahDialogComponent, {
            maxWidth: '95vw',
            maxHeight: '90vh',
            direction: "rtl",
            autoFocus: false,
            data: ayah
         });
         
         this.dialogRef.afterClosed().subscribe(() => {
            this.destroy();
         });
      } else {
         this.dialogRef.componentInstance.ayah = ayah;
      }
   }

   private destroy() {
      this.navService.close_ayah(this.route);
   }
}
