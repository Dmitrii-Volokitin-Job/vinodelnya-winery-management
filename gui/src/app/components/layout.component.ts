import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { SidebarModule } from "primeng/sidebar";
import { MenuModule } from "primeng/menu";
import { ButtonModule } from "primeng/button";
import { AvatarModule } from "primeng/avatar";
import { DropdownModule } from "primeng/dropdown";
import { TooltipModule } from "primeng/tooltip";
import { MenuItem } from "primeng/api";

import { AuthService } from "../services/auth.service";
import { ThemeService, Theme } from "../services/theme.service";
import { I18nService, Language } from "../services/i18n.service";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    SidebarModule,
    MenuModule,
    ButtonModule,
    AvatarModule,
    DropdownModule,
    TooltipModule,
  ],
  template: `
    <div class="layout-container" [class.mobile-menu-active]="mobileMenuActive">
      <!-- Mobile Menu Toggle -->
      <p-button
        *ngIf="isMobile"
        icon="pi pi-bars"
        [text]="true"
        severity="secondary"
        class="mobile-menu-toggle"
        (onClick)="toggleMobileMenu()"
      ></p-button>
      
      <!-- Sidebar -->
      <div class="layout-sidebar" [class.mobile-active]="mobileMenuActive">
        <div class="sidebar-header">
          <h2>🍷 Vinodelnya</h2>
          <p-button
            *ngIf="isMobile"
            icon="pi pi-times"
            [text]="true"
            severity="secondary"
            size="small"
            (onClick)="toggleMobileMenu()"
            styleClass="mobile-close-btn"
          ></p-button>
        </div>

        <p-menu [model]="menuItems" styleClass="sidebar-menu" (onClick)="onMenuClick()"></p-menu>
      </div>

      <!-- Overlay for mobile -->
      <div 
        *ngIf="isMobile && mobileMenuActive" 
        class="mobile-overlay"
        (click)="toggleMobileMenu()"
      ></div>

      <div class="layout-content">
        <div class="top-bar">
          <div class="top-bar-content">
            <div class="spacer"></div>
            <div class="user-info-top">
              <p-dropdown
                [options]="languageOptions"
                [(ngModel)]="selectedLanguage"
                (onChange)="changeLanguage($event.value)"
                optionLabel="label"
                optionValue="value"
                styleClass="language-selector"
                [style]="{'min-width': '140px'}"
              >
              </p-dropdown>
              <p-button
                [icon]="currentTheme === 'light' ? 'pi pi-moon' : 'pi pi-sun'"
                [text]="true"
                severity="secondary"
                size="small"
                (onClick)="toggleTheme()"
                [pTooltip]="
                  currentTheme === 'light'
                    ? 'Switch to Dark'
                    : 'Switch to Light'
                "
              >
              </p-button>
              <p-avatar icon="pi pi-user" shape="circle" size="normal"></p-avatar>
              <div class="user-details">
                <div class="username">{{ currentUser?.username }}</div>
                <div class="role">{{ currentUser?.role }}</div>
              </div>
              <p-button
                icon="pi pi-sign-out"
                [text]="true"
                severity="secondary"
                size="small"
                (onClick)="logout()"
                data-testid="logout-button"
                pTooltip="Logout"
              >
              </p-button>
            </div>
          </div>
        </div>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .layout-container {
        display: flex;
        height: 100vh;
        overflow: hidden;
      }

      .layout-sidebar {
        width: 280px;
        background: #1e293b;
        color: white;
        display: flex;
        flex-direction: column;
        box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
      }

      .sidebar-header {
        padding: 1.5rem 1rem;
        border-bottom: 1px solid #334155;
      }

      .sidebar-header h2 {
        margin: 0;
        color: white;
        font-size: 1.5rem;
        font-weight: 600;
      }

      :host ::ng-deep .sidebar-menu {
        background: transparent;
        border: none;
        flex: 1;
      }

      :host ::ng-deep .sidebar-menu .p-menu-list {
        padding: 1rem 0;
      }

      :host ::ng-deep .sidebar-menu .p-menuitem-link {
        padding: 0.75rem 1rem;
        color: #cbd5e1;
        transition: all 0.2s;
      }

      :host ::ng-deep .sidebar-menu .p-menuitem-link:hover {
        background: #334155;
        color: white;
      }

      :host ::ng-deep .sidebar-menu .p-menuitem-icon {
        margin-right: 0.75rem;
        color: #94a3b8;
      }

      .sidebar-footer {
        padding: 1rem;
        border-top: 1px solid #334155;
      }

      .settings-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .setting-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .setting-item label {
        font-size: 0.8rem;
        color: #94a3b8;
        font-weight: 500;
      }

      .layout-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #f8fafc;
      }

      .top-bar {
        background: white;
        border-bottom: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        z-index: 10;
      }

      .top-bar-content {
        display: flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        height: 60px;
      }

      .spacer {
        flex: 1;
      }

      .user-info-top {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #f8fafc;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }

      .user-details {
        display: flex;
        flex-direction: column;
      }

      .username {
        font-weight: 500;
        font-size: 0.9rem;
        color: #1e293b;
      }

      .role {
        font-size: 0.75rem;
        color: #64748b;
      }

      .content-area {
        flex: 1;
        overflow-y: auto;
      }

      /* Mobile Styles */
      .mobile-menu-toggle {
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 1001;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .mobile-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 998;
      }

      .mobile-close-btn {
        margin-left: auto;
      }

      @media (max-width: 768px) {
        .layout-sidebar {
          position: fixed;
          top: 0;
          left: -280px;
          height: 100vh;
          z-index: 999;
          transition: left 0.3s ease;
        }
        
        .layout-sidebar.mobile-active {
          left: 0;
        }
        
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .layout-content {
          margin-left: 0;
          width: 100%;
        }
        
        .top-bar-content {
          padding: 0.5rem;
        }
        
        .user-info-top {
          flex-wrap: wrap;
          padding: 0.25rem 0.5rem;
          gap: 0.5rem;
        }
        
        .language-selector {
          width: 120px !important;
          min-width: 120px !important;
        }
        
        .username {
          display: none;
        }
        
        .role {
          display: none;
        }
        
        .user-details {
          display: none;
        }
      }
      
      @media (max-width: 480px) {
        .user-info-top {
          gap: 0.25rem;
          padding: 0.25rem;
        }
        
        .p-button-sm {
          padding: 0.25rem 0.5rem;
        }
      }
    `,
  ],
})
export class LayoutComponent implements OnInit {
  menuItems: MenuItem[] = [];
  currentUser: any;
  currentTheme: Theme = "light";
  selectedLanguage: Language = "en";
  mobileMenuActive = false;
  isMobile = false;

  languageOptions = [
    { label: "🇺🇸 English", value: "en" },
    { label: "🇬🇪 ქართული", value: "ka" },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private i18nService: I18nService,
  ) {
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.updateMenuItems();
    });

    this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme;
    });

    this.i18nService.language$.subscribe((lang) => {
      this.selectedLanguage = lang;
      this.updateMenuItems();
    });
  }

  updateMenuItems() {
    const menuItems = [
      {
        label: this.i18nService.translate("MENU.DASHBOARD"),
        icon: "pi pi-home",
        command: () => this.router.navigate(["/dashboard"]),
      },
      {
        label: this.i18nService.translate("MENU.PERSONS"),
        icon: "pi pi-users",
        command: () => this.router.navigate(["/persons"]),
      },
      {
        label: this.i18nService.translate("MENU.CATEGORIES"),
        icon: "pi pi-tags",
        command: () => this.router.navigate(["/categories"]),
      },
      {
        label: this.i18nService.translate("MENU.ENTRIES"),
        icon: "pi pi-list",
        command: () => this.router.navigate(["/entries"]),
      },
      {
        label: this.i18nService.translate("MENU.EVENTS"),
        icon: "pi pi-calendar",
        command: () => this.router.navigate(["/events"]),
      },
      {
        label: this.i18nService.translate("MENU.REPORTS"),
        icon: "pi pi-chart-bar",
        command: () => this.router.navigate(["/reports"]),
      },
    ];

    // Add Admin-only menu items
    if (this.currentUser?.role === "ADMIN") {
      menuItems.push({
        label: this.i18nService.translate("MENU.USERS"),
        icon: "pi pi-user-edit",
        command: () => this.router.navigate(["/users"]),
      });

      menuItems.push({
        label: this.i18nService.translate("MENU.AUDIT"),
        icon: "pi pi-history",
        command: () => this.router.navigate(["/audit"]),
      });

      menuItems.push({
        label: this.i18nService.translate("MENU.LOGS"),
        icon: "pi pi-file",
        command: () => this.router.navigate(["/logs"]),
      });
    }

    this.menuItems = menuItems;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  changeLanguage(language: Language): void {
    this.i18nService.setLanguage(language);
  }

  toggleMobileMenu(): void {
    this.mobileMenuActive = !this.mobileMenuActive;
  }

  onMenuClick(): void {
    if (this.isMobile) {
      this.mobileMenuActive = false;
    }
  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.mobileMenuActive = false;
    }
  }
}
