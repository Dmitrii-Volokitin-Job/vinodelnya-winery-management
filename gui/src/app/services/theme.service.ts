import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type Theme = "light" | "dark";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<Theme>("light");
  public theme$ = this.currentTheme.asObservable();

  constructor() {
    this.loadTheme();
  }

  setTheme(theme: Theme): void {
    this.currentTheme.next(theme);
    localStorage.setItem("theme", theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme.value === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem("theme") as Theme;
    let theme: Theme;
    
    if (savedTheme) {
      theme = savedTheme;
    } else {
      // Use system/browser preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? "dark" : "light";
    }
    
    this.setTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    const themeLink = document.getElementById("theme-css") as HTMLLinkElement;

    if (themeLink) {
      themeLink.href =
        theme === "dark"
          ? "https://cdn.jsdelivr.net/npm/primeng@17.18.15/resources/themes/lara-dark-blue/theme.css"
          : "https://cdn.jsdelivr.net/npm/primeng@17.18.15/resources/themes/lara-light-blue/theme.css";
    }

    document.body.className = theme === "dark" ? "dark-theme" : "light-theme";
  }
}
