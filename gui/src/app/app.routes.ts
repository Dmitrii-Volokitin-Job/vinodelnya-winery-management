import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login.component";
import { authGuard } from "./guards/auth.guard";

import { LayoutComponent } from "./components/layout.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "",
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: "", redirectTo: "/dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./components/dashboard.component").then(
            (c) => c.DashboardComponent,
          ),
      },
      {
        path: "persons",
        loadComponent: () =>
          import("./components/persons.component").then(
            (c) => c.PersonsComponent,
          ),
      },
      {
        path: "categories",
        loadComponent: () =>
          import("./components/categories.component").then(
            (c) => c.CategoriesComponent,
          ),
      },
      {
        path: "entries",
        loadComponent: () =>
          import("./components/entries.component").then(
            (c) => c.EntriesComponent,
          ),
      },
      {
        path: "events",
        loadComponent: () =>
          import("./components/events.component").then(
            (c) => c.EventsComponent,
          ),
      },
      {
        path: "reports",
        loadComponent: () =>
          import("./components/reports.component").then(
            (c) => c.ReportsComponent,
          ),
      },
      {
        path: "users",
        loadComponent: () =>
          import("./components/users.component").then((c) => c.UsersComponent),
      },
      {
        path: "audit",
        loadComponent: () =>
          import("./components/audit.component").then((c) => c.AuditComponent),
      },
      {
        path: "logs",
        loadComponent: () =>
          import("./components/logs.component").then((c) => c.LogsComponent),
      },
    ],
  },
  { path: "**", redirectTo: "/dashboard" },
];
