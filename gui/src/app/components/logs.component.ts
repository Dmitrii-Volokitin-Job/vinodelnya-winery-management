import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { TagModule } from "primeng/tag";
import { CardModule } from "primeng/card";
import { ToolbarModule } from "primeng/toolbar";
import { DialogModule } from "primeng/dialog";
import { ScrollPanelModule } from "primeng/scrollpanel";

import { ApiService } from "../services/api.service";
import { AuthService } from "../services/auth.service";
import { I18nService } from "../services/i18n.service";

interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  logger: string;
  message: string;
  thread: string;
}

interface LogStats {
  levelCounts: { [key: string]: number };
  totalLogs: number;
  lastHour: number;
  lastDay: number;
  systemUptime: string;
}

@Component({
  selector: "app-logs",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    CardModule,
    ToolbarModule,
    DialogModule,
    ScrollPanelModule,
  ],
  template: `
    <div class="logs-container">
      <p-toolbar>
        <div class="toolbar-content">
          <h2>{{ i18n.translate("LOGS.TITLE") }}</h2>
          <div class="toolbar-actions">
            <p-button
              icon="pi pi-refresh"
              [text]="true"
              (onClick)="refreshLogs()"
              data-testid="refresh-logs-button"
              pTooltip="Refresh Logs"
            >
            </p-button>
            <p-button
              icon="pi pi-chart-bar"
              [text]="true"
              (onClick)="showStats = true"
              data-testid="show-stats-button"
              pTooltip="Show Statistics"
            >
            </p-button>
          </div>
        </div>
      </p-toolbar>

      <!-- Filters -->
      <div class="filters-panel">
        <div class="grid">
          <div class="col-4">
            <label for="logLevel">{{ i18n.translate("LOGS.LEVEL") }}</label>
            <p-dropdown
              id="logLevel"
              [(ngModel)]="selectedLevel"
              [options]="logLevels"
              placeholder="Select Level"
              data-testid="log-level-filter"
              class="w-full"
              (onChange)="applyFilters()"
            >
            </p-dropdown>
          </div>
          <div class="col-4">
            <label for="searchTerm">{{ i18n.translate("LOGS.SEARCH") }}</label>
            <input
              id="searchTerm"
              type="text"
              pInputText
              [(ngModel)]="searchTerm"
              placeholder="Search logs..."
              data-testid="log-search"
              class="w-full"
              (keyup.enter)="applyFilters()"
            />
          </div>
          <div class="col-4">
            <label for="logLimit">{{ i18n.translate("LOGS.LIMIT") }}</label>
            <p-dropdown
              id="logLimit"
              [(ngModel)]="logLimit"
              [options]="limitOptions"
              data-testid="log-limit-filter"
              class="w-full"
              (onChange)="applyFilters()"
            >
            </p-dropdown>
          </div>
        </div>
        <div class="filter-actions">
          <p-button
            label="Apply Filters"
            icon="pi pi-filter"
            (onClick)="applyFilters()"
            data-testid="apply-log-filters-button"
          >
          </p-button>
          <p-button
            label="Clear Filters"
            icon="pi pi-filter-slash"
            [outlined]="true"
            (onClick)="clearFilters()"
            data-testid="clear-log-filters-button"
          >
          </p-button>
        </div>
      </div>

      <!-- Logs Table -->
      <p-table
        [value]="logs"
        [loading]="loading"
        dataKey="id"
        [scrollable]="true"
        scrollHeight="600px"
        data-testid="logs-table"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 180px;">
              {{ i18n.translate("LOGS.TIMESTAMP") }}
            </th>
            <th style="width: 100px;">{{ i18n.translate("LOGS.LEVEL") }}</th>
            <th style="width: 120px;">{{ i18n.translate("LOGS.THREAD") }}</th>
            <th style="width: 250px;">{{ i18n.translate("LOGS.LOGGER") }}</th>
            <th>{{ i18n.translate("LOGS.MESSAGE") }}</th>
            <th style="width: 100px;">
              {{ i18n.translate("COMMON.ACTIONS") }}
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-log>
          <tr>
            <td>{{ log.timestamp | date: "short" }}</td>
            <td>
              <p-tag
                [value]="log.level"
                [severity]="getLogLevelSeverity(log.level)"
              >
              </p-tag>
            </td>
            <td>{{ log.thread }}</td>
            <td class="logger-cell">{{ log.logger }}</td>
            <td class="message-cell">{{ log.message }}</td>
            <td>
              <p-button
                icon="pi pi-eye"
                size="small"
                [text]="true"
                (onClick)="viewLogDetails(log)"
                data-testid="view-log-details-button"
                pTooltip="View Details"
              >
              </p-button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center">
              {{ i18n.translate("COMMON.NO_DATA") }}
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Log Details Dialog -->
      <p-dialog
        header="Log Entry Details"
        [(visible)]="showLogDetails"
        [modal]="true"
        [style]="{ width: '80vw', maxWidth: '800px' }"
        data-testid="log-details-dialog"
      >
        <div class="log-details" *ngIf="selectedLog">
          <div class="detail-section">
            <h4>{{ i18n.translate("LOGS.BASIC_INFO") }}</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>{{ i18n.translate("LOGS.TIMESTAMP") }}:</label>
                <span>{{ selectedLog.timestamp | date: "full" }}</span>
              </div>
              <div class="detail-item">
                <label>{{ i18n.translate("LOGS.LEVEL") }}:</label>
                <p-tag
                  [value]="selectedLog.level"
                  [severity]="getLogLevelSeverity(selectedLog.level)"
                ></p-tag>
              </div>
              <div class="detail-item">
                <label>{{ i18n.translate("LOGS.THREAD") }}:</label>
                <span>{{ selectedLog.thread }}</span>
              </div>
              <div class="detail-item">
                <label>{{ i18n.translate("LOGS.LOGGER") }}:</label>
                <span>{{ selectedLog.logger }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>{{ i18n.translate("LOGS.MESSAGE") }}</h4>
            <div class="message-content">
              <pre>{{ selectedLog.message }}</pre>
            </div>
          </div>
        </div>
      </p-dialog>

      <!-- Statistics Dialog -->
      <p-dialog
        header="Log Statistics"
        [(visible)]="showStats"
        [modal]="true"
        [style]="{ width: '60vw', maxWidth: '600px' }"
        data-testid="log-stats-dialog"
      >
        <div class="stats-container" *ngIf="logStats">
          <div class="stats-grid">
            <div class="stat-card">
              <h4>{{ i18n.translate("LOGS.TOTAL_LOGS") }}</h4>
              <div class="stat-value">{{ logStats.totalLogs }}</div>
            </div>
            <div class="stat-card">
              <h4>{{ i18n.translate("LOGS.LAST_HOUR") }}</h4>
              <div class="stat-value">{{ logStats.lastHour }}</div>
            </div>
            <div class="stat-card">
              <h4>{{ i18n.translate("LOGS.LAST_DAY") }}</h4>
              <div class="stat-value">{{ logStats.lastDay }}</div>
            </div>
            <div class="stat-card">
              <h4>{{ i18n.translate("LOGS.UPTIME") }}</h4>
              <div class="stat-value small">{{ logStats.systemUptime }}</div>
            </div>
          </div>

          <div class="level-stats">
            <h4>{{ i18n.translate("LOGS.BY_LEVEL") }}</h4>
            <div class="level-counts">
              <div
                class="level-count"
                *ngFor="let level of Object.keys(logStats.levelCounts)"
              >
                <p-tag
                  [value]="level + ': ' + logStats.levelCounts[level]"
                  [severity]="getLogLevelSeverity(level)"
                >
                </p-tag>
              </div>
            </div>
          </div>
        </div>
      </p-dialog>
    </div>
  `,
  styles: [
    `
      .logs-container {
        padding: 1rem;
      }

      .toolbar-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .toolbar-content h2 {
        margin: 0;
        color: #495057;
      }

      .toolbar-actions {
        display: flex;
        gap: 0.5rem;
      }

      .filters-panel {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 6px;
        margin: 1rem 0;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .col-4 {
        grid-column: span 4;
      }
      .col-12 {
        grid-column: span 12;
      }

      @media (max-width: 768px) {
        .col-4 {
          grid-column: span 12;
        }
      }

      .filter-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }

      .logger-cell {
        font-family: monospace;
        font-size: 0.9rem;
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .message-cell {
        max-width: 400px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .log-details {
        max-height: 70vh;
        overflow-y: auto;
      }

      .detail-section {
        margin-bottom: 2rem;
      }

      .detail-section h4 {
        margin: 0 0 1rem 0;
        color: #495057;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 0.5rem;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      @media (max-width: 768px) {
        .detail-grid {
          grid-template-columns: 1fr;
        }
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .detail-item label {
        font-weight: 600;
        color: #6c757d;
        font-size: 0.9rem;
      }

      .message-content {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 1rem;
      }

      .message-content pre {
        margin: 0;
        white-space: pre-wrap;
        font-family: "Consolas", "Monaco", "Courier New", monospace;
        font-size: 0.9rem;
      }

      .stats-container {
        max-height: 70vh;
        overflow-y: auto;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
      }

      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }

      .stat-card {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 1rem;
        text-align: center;
      }

      .stat-card h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        color: #6c757d;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #495057;
      }

      .stat-value.small {
        font-size: 1.2rem;
      }

      .level-stats h4 {
        margin: 0 0 1rem 0;
        color: #495057;
      }

      .level-counts {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .w-full {
        width: 100%;
      }

      .text-center {
        text-align: center;
      }
    `,
  ],
})
export class LogsComponent implements OnInit, OnDestroy {
  logs: LogEntry[] = [];
  loading = false;
  showLogDetails = false;
  showStats = false;
  selectedLog: LogEntry | null = null;
  logStats: LogStats | null = null;

  // Filters
  selectedLevel = "ALL";
  searchTerm = "";
  logLimit = 100;

  // Options
  logLevels = [
    { label: "All Levels", value: "ALL" },
    { label: "ERROR", value: "ERROR" },
    { label: "WARN", value: "WARN" },
    { label: "INFO", value: "INFO" },
    { label: "DEBUG", value: "DEBUG" },
    { label: "TRACE", value: "TRACE" },
  ];

  limitOptions = [
    { label: "50 logs", value: 50 },
    { label: "100 logs", value: 100 },
    { label: "200 logs", value: 200 },
    { label: "500 logs", value: 500 },
  ];

  private refreshInterval: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public i18n: I18nService,
  ) {}

  ngOnInit() {
    // Only load data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadLogs();
      this.loadLogStats();

      // Auto-refresh every 30 seconds
      this.refreshInterval = setInterval(() => {
        this.loadLogs();
      }, 30000);
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadLogs() {
    this.loading = true;

    const params: any = {
      limit: this.logLimit,
      level: this.selectedLevel,
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    this.apiService.getLogs(params).subscribe({
      next: (response) => {
        this.logs = response.logs;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading logs:", error);
        this.logs = [];
        this.loading = false;
      },
    });
  }

  loadLogStats() {
    this.apiService.getLogStats().subscribe({
      next: (stats) => {
        this.logStats = stats;
      },
      error: (error) => {
        console.error("Error loading log stats:", error);
      },
    });
  }

  refreshLogs() {
    this.loadLogs();
    this.loadLogStats();
  }

  applyFilters() {
    this.loadLogs();
  }

  clearFilters() {
    this.selectedLevel = "ALL";
    this.searchTerm = "";
    this.logLimit = 100;
    this.loadLogs();
  }

  viewLogDetails(log: LogEntry) {
    this.selectedLog = log;
    this.showLogDetails = true;
  }

  getLogLevelSeverity(
    level: string,
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
      ERROR: "danger",
      WARN: "warning",
      INFO: "info",
      DEBUG: "secondary",
      TRACE: "contrast",
    };
    return severityMap[level] || "secondary";
  }

  // Helper for template
  Object = Object;
}
