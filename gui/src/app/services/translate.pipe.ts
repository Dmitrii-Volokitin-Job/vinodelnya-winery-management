import { Pipe, PipeTransform, ChangeDetectorRef } from "@angular/core";
import { I18nService } from "./i18n.service";

@Pipe({
  name: "translate",
  standalone: true,
  pure: false, // Make it impure so it updates when language changes
})
export class TranslatePipe implements PipeTransform {
  constructor(
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef,
  ) {
    // Trigger change detection when language changes
    this.i18nService.language$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(key: string, params?: any): string {
    return this.i18nService.translate(key, params);
  }
}
