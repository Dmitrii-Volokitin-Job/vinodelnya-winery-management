import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { CalendarModule } from "primeng/calendar";
import { TagModule } from "primeng/tag";
import { DialogModule } from "primeng/dialog";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { TooltipModule } from "primeng/tooltip";

import { ApiService } from "../services/api.service";
import { AuthService } from "../services/auth.service";
import { I18nService } from "../services/i18n.service";

interface AuditLog {
  id: number;
  tableName: string;
  recordId: number;
  action: "INSERT" | "UPDATE" | "DELETE";
  oldValues: any;
  newValues: any;
  changedBy: string;
  changedAt: string;
  ipAddress: string;
  userAgent: string;
}

@Component({
  selector: "app-audit",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    TagModule,
    DialogModule,
    ScrollPanelModule,
    TooltipModule,
  ],
  template: `
    <div class="card">
      <div class="card-header">
        <div class="flex justify-content-between align-items-center">
          <h2>{{ i18n.translate("AUDIT.TITLE") }}</h2>
        </div>

        <!-- Filters -->
        <div class="grid mt-3">
          <div class="col-12 md:col-3">
            <label>{{ i18n.translate("AUDIT.TABLE_NAME") }}</label>
            <p-dropdown
              [(ngModel)]="filters.tableName"
              [options]="tableOptions"
              optionLabel="label"
              optionValue="value"
              [placeholder]="i18n.translate('AUDIT.SELECT_TABLE')"
              [showClear]="true"
              data-testid="audit-table-filter"
              styleClass="w-full"
            >
            </p-dropdown>
          </div>

          <div class="col-12 md:col-2">
            <label>{{ i18n.translate("AUDIT.RECORD_ID") }}</label>
            <input
              pInputText
              [(ngModel)]="filters.recordId"
              [placeholder]="i18n.translate('AUDIT.RECORD_ID_PLACEHOLDER')"
              class="w-full"
            />
          </div>

          <div class="col-12 md:col-2">
            <label>{{ i18n.translate("AUDIT.CHANGED_BY") }}</label>
            <input
              pInputText
              [(ngModel)]="filters.changedBy"
              [placeholder]="i18n.translate('AUDIT.USER_PLACEHOLDER')"
              class="w-full"
            />
          </div>

          <div class="col-12 md:col-2">
            <label>{{ i18n.translate("AUDIT.FROM_DATE") }}</label>
            <p-calendar
              [(ngModel)]="filters.startDate"
              [showTime]="true"
              dateFormat="dd/mm/yy"
              [placeholder]="i18n.translate('AUDIT.FROM_DATE')"
              data-testid="audit-from-date"
              styleClass="w-full"
            >
            </p-calendar>
          </div>

          <div class="col-12 md:col-2">
            <label>{{ i18n.translate("AUDIT.TO_DATE") }}</label>
            <p-calendar
              [(ngModel)]="filters.endDate"
              [showTime]="true"
              dateFormat="dd/mm/yy"
              [placeholder]="i18n.translate('AUDIT.TO_DATE')"
              data-testid="audit-to-date"
              styleClass="w-full"
            >
            </p-calendar>
          </div>

          <div class="col-12 md:col-1 flex align-items-end gap-1">
            <p-button
              [label]="i18n.translate('ACTIONS.APPLY_FILTERS')"
              icon="pi pi-search"
              (onClick)="applyFilters()"
              data-testid="apply-audit-filters-button"
              styleClass="w-full"
            >
            </p-button>
            <p-button
              [label]="i18n.translate('ACTIONS.CLEAR_FILTERS')"
              icon="pi pi-times"
              severity="secondary"
              (onClick)="clearFilters()"
              data-testid="clear-audit-filters-button"
              styleClass="w-full"
            >
            </p-button>
          </div>
        </div>
      </div>

      <p-table
        *ngIf="isAuthenticated"
        [value]="auditLogs"
        [loading]="loading"
        [paginator]="true"
        [rows]="15"
        [rowsPerPageOptions]="[15, 30, 45]"
        [totalRecords]="totalRecords"
        [lazy]="true"
        (onLazyLoad)="loadAuditLogs($event)"
        dataKey="id"
        data-testid="audit-table"
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="header">
          <tr>
            <th [pSortableColumn]="'changedAt'">
              {{ i18n.translate("AUDIT.TIMESTAMP") }}
              <p-sortIcon field="changedAt"></p-sortIcon>
            </th>
            <th [pSortableColumn]="'tableName'">
              {{ i18n.translate("AUDIT.TABLE_NAME") }}
              <p-sortIcon field="tableName"></p-sortIcon>
            </th>
            <th [pSortableColumn]="'recordId'">
              {{ i18n.translate("AUDIT.RECORD_ID") }}
              <p-sortIcon field="recordId"></p-sortIcon>
            </th>
            <th [pSortableColumn]="'action'">
              {{ i18n.translate("AUDIT.ACTION") }}
              <p-sortIcon field="action"></p-sortIcon>
            </th>
            <th [pSortableColumn]="'changedBy'">
              {{ i18n.translate("AUDIT.CHANGED_BY") }}
              <p-sortIcon field="changedBy"></p-sortIcon>
            </th>
            <th>{{ i18n.translate("COMMON.ACTIONS") }}</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-audit>
          <tr>
            <td>{{ audit.changedAt | date: "short" }}</td>
            <td>
              <p-tag
                [value]="getTableDisplayName(audit.tableName)"
                severity="info"
              ></p-tag>
            </td>
            <td>{{ audit.recordId }}</td>
            <td>
              <p-tag
                [value]="i18n.translate('AUDIT.ACTION_' + audit.action)"
                [severity]="getActionSeverity(audit.action)"
              >
              </p-tag>
            </td>
            <td>{{ audit.changedBy }}</td>
            <td>
              <p-button
                icon="pi pi-eye"
                size="small"
                [pTooltip]="i18n.translate('AUDIT.VIEW_DETAILS')"
                data-testid="view-audit-details-button"
                (onClick)="viewAuditDetails(audit)"
              >
              </p-button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Audit Details Dialog -->
    <p-dialog
      [header]="i18n.translate('AUDIT.DETAILS_TITLE')"
      [(visible)]="showDetailsDialog"
      [modal]="true"
      [style]="{ width: '80vw', maxWidth: '800px' }"
      [closable]="true"
      data-testid="audit-details-dialog"
    >
      <div *ngIf="selectedAudit" class="audit-details">
        <div class="grid">
          <div class="col-6">
            <h4>{{ i18n.translate("AUDIT.BASIC_INFO") }}</h4>
            <div class="field-group">
              <div class="field">
                <label>{{ i18n.translate("AUDIT.TABLE_NAME") }}:</label>
                <span>{{ getTableDisplayName(selectedAudit.tableName) }}</span>
              </div>
              <div class="field">
                <label>{{ i18n.translate("AUDIT.RECORD_ID") }}:</label>
                <span>{{ selectedAudit.recordId }}</span>
              </div>
              <div class="field">
                <label>{{ i18n.translate("AUDIT.ACTION") }}:</label>
                <p-tag
                  [value]="
                    i18n.translate('AUDIT.ACTION_' + selectedAudit.action)
                  "
                  [severity]="getActionSeverity(selectedAudit.action)"
                >
                </p-tag>
              </div>
              <div class="field">
                <label>{{ i18n.translate("AUDIT.CHANGED_BY") }}:</label>
                <span>{{ selectedAudit.changedBy }}</span>
              </div>
              <div class="field">
                <label>{{ i18n.translate("AUDIT.TIMESTAMP") }}:</label>
                <span>{{ selectedAudit.changedAt | date: "full" }}</span>
              </div>
              <div class="field">
                <label>{{ i18n.translate("AUDIT.IP_ADDRESS") }}:</label>
                <span>{{ selectedAudit.ipAddress }}</span>
              </div>
            </div>
          </div>

          <div class="col-6">
            <h4>{{ i18n.translate("AUDIT.TECHNICAL_INFO") }}</h4>
            <div class="field-group">
              <div class="field">
                <label>{{ i18n.translate("AUDIT.USER_AGENT") }}:</label>
                <p-scrollPanel [style]="{ width: '100%', height: '60px' }">
                  <small>{{ selectedAudit.userAgent }}</small>
                </p-scrollPanel>
              </div>
            </div>
          </div>
        </div>

        <div class="grid mt-4" *ngIf="selectedAudit.action !== 'INSERT'">
          <div class="col-6" *ngIf="selectedAudit.oldValues">
            <h4>{{ i18n.translate("AUDIT.OLD_VALUES") }}</h4>
            <p-scrollPanel [style]="{ width: '100%', height: '200px' }">
              <pre>{{ selectedAudit.oldValues | json }}</pre>
            </p-scrollPanel>
          </div>

          <div
            class="col-6"
            *ngIf="selectedAudit.newValues && selectedAudit.action !== 'DELETE'"
          >
            <h4>{{ i18n.translate("AUDIT.NEW_VALUES") }}</h4>
            <p-scrollPanel [style]="{ width: '100%', height: '200px' }">
              <pre>{{ selectedAudit.newValues | json }}</pre>
            </p-scrollPanel>
          </div>
        </div>

        <div
          class="mt-4"
          *ngIf="selectedAudit.action === 'INSERT' && selectedAudit.newValues"
        >
          <h4>{{ i18n.translate("AUDIT.CREATED_VALUES") }}</h4>
          <p-scrollPanel [style]="{ width: '100%', height: '200px' }">
            <pre>{{ selectedAudit.newValues | json }}</pre>
          </p-scrollPanel>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      .card {
        background: white;
        border-radius: 6px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin: 1rem;
      }

      .card-header {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e9ecef;
      }

      .audit-details .field {
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .audit-details .field label {
        font-weight: 600;
        min-width: 120px;
        margin-right: 1rem;
      }

      .field-group {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        border: 1px solid #e9ecef;
      }

      pre {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        font-size: 0.875rem;
        overflow-x: auto;
        white-space: pre-wrap;
      }
    `,
  ],
})
export class AuditComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  loading = false;
  totalRecords = 0;
  showDetailsDialog = false;
  selectedAudit: AuditLog | null = null;

  filters = {
    tableName: null as string | null,
    recordId: null as number | null,
    changedBy: null as string | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
  };

  tableOptions = [
    { label: "All Tables", value: null },
    { label: "Persons", value: "persons" },
    { label: "Categories", value: "categories" },
    { label: "Entries", value: "entries" },
    { label: "Events", value: "events" },
    { label: "Users", value: "users" },
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public i18n: I18nService,
  ) {}

  ngOnInit() {
    this.initializeCurrentMonthFilters();
    this.updateTranslations();

    // Update translations when language changes
    this.i18n.language$.subscribe(() => {
      this.updateTranslations();
    });
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  private initializeCurrentMonthFilters() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.filters.startDate = firstDayOfMonth;
    this.filters.endDate = lastDayOfMonth;
  }

  private updateTranslations() {
    this.tableOptions = [
      { label: this.i18n.translate("AUDIT.ALL_TABLES"), value: null },
      { label: this.i18n.translate("MENU.PERSONS"), value: "persons" },
      { label: this.i18n.translate("MENU.CATEGORIES"), value: "categories" },
      { label: this.i18n.translate("MENU.ENTRIES"), value: "entries" },
      { label: this.i18n.translate("MENU.EVENTS"), value: "events" },
      { label: this.i18n.translate("MENU.USERS"), value: "users" },
    ];
  }

  loadAuditLogs(event: any) {
    // Only load data if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.loading = true;
    const page = event.first / event.rows;
    const size = event.rows;
    const sortBy = event.sortField || "changedAt";
    const sortDir = event.sortOrder === 1 ? "asc" : "desc";

    // Build filters
    const params: any = { page, size, sortBy, sortDir };

    if (this.filters.tableName) params.tableName = this.filters.tableName;
    if (this.filters.recordId) params.recordId = this.filters.recordId;
    if (this.filters.changedBy) params.changedBy = this.filters.changedBy;
    if (this.filters.startDate)
      params.startDate = this.filters.startDate.toISOString();
    if (this.filters.endDate)
      params.endDate = this.filters.endDate.toISOString();

    this.apiService.getAuditHistory(params).subscribe({
      next: (response) => {
        this.auditLogs = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading audit logs:", error);
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.loadAuditLogs({ first: 0, rows: 20 });
  }

  clearFilters() {
    this.filters = {
      tableName: null,
      recordId: null,
      changedBy: null,
      startDate: null,
      endDate: null,
    };
    this.loadAuditLogs({ first: 0, rows: 20 });
  }

  viewAuditDetails(audit: AuditLog) {
    this.selectedAudit = audit;
    this.showDetailsDialog = true;
  }

  getTableDisplayName(tableName: string): string {
    const tableMap: { [key: string]: string } = {
      persons: this.i18n.translate("MENU.PERSONS"),
      categories: this.i18n.translate("MENU.CATEGORIES"),
      entries: this.i18n.translate("MENU.ENTRIES"),
      events: this.i18n.translate("MENU.EVENTS"),
      users: this.i18n.translate("MENU.USERS"),
    };
    return tableMap[tableName] || tableName;
  }

  getActionSeverity(
    action: string,
  ): "success" | "info" | "warning" | "danger" | "secondary" | "contrast" {
    const severityMap: {
      [key: string]:
        | "success"
        | "info"
        | "warning"
        | "danger"
        | "secondary"
        | "contrast";
    } = {
      INSERT: "success",
      UPDATE: "info",
      DELETE: "danger",
    };
    return severityMap[action] || "info";
  }
}
