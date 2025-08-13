import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";

export type Language = "en" | "ka";

@Injectable({
  providedIn: "root",
})
export class I18nService {
  private currentLanguage = new BehaviorSubject<Language>("en");
  private translations: any = {};

  public language$ = this.currentLanguage.asObservable();

  constructor(private http: HttpClient) {
    this.initializeLanguage();
  }

  setLanguage(lang: Language): void {
    console.log('Setting language to:', lang);
    localStorage.setItem("language", lang);
    this.loadTranslations(lang);
  }

  translate(key: string, params?: any): string {
    let translation = this.getNestedProperty(this.translations, key) || key;

    // Replace parameters in translation
    if (params) {
      Object.keys(params).forEach((param) => {
        const regex = new RegExp(`\\{${param}\\}`, "g");
        translation = translation.replace(regex, params[param]);
      });
    }

    return translation;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage.value;
  }

  private initializeLanguage(): void {
    const savedLang = localStorage.getItem("language") as Language;
    const lang = savedLang || "en";
    this.loadTranslations(lang);
  }

  private loadTranslations(lang: Language): void {
    this.translations = {};
    
    this.http.get(`/assets/i18n/${lang}.json`).subscribe({
      next: (translations) => {
        this.translations = translations;
        console.log('Translations loaded for:', lang);
        // Emit language change after translations are loaded
        this.currentLanguage.next(lang);
      },
      error: () => {
        console.warn(`Failed to load translations for ${lang}`);
        // Still emit language change even if translations fail to load
        this.currentLanguage.next(lang);
      },
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}
