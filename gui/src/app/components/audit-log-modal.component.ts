import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

import { ApiService } from '../services/api.service';

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
  selector: 'app-audit-log-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TableModule,
    TagModule,
    ScrollPanelModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule
  ],
  template: `
    <p-dialog
      header="📋 Audit Log History"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '900px', height: '700px' }"
      [draggable]="false"
      [resizable]="true"
      styleClass="audit-dialog"
      (onHide)="onClose()"
      (onShow)="loadAuditLogs()"
    >
      <div class="audit-content">
        <div class="audit-header">
          <h4>Change History for {{ entityType }} #{{ entityId }}</h4>
          <p class="audit-description">
            View all changes made to this record, including who made the changes and when.
          </p>
        </div>

        <div *ngIf="loading" class="loading-container">
          <p-progressSpinner></p-progressSpinner>
          <p>Loading audit history...</p>
        </div>

        <div *ngIf="!loading && auditLogs.length === 0" class="no-data">
          <p-message 
            severity="info" 
            text="No audit log entries found for this record."
          ></p-message>
        </div>

        <div *ngIf="!loading && auditLogs.length > 0" class="audit-table-container">
          <p-table [value]="auditLogs" [scrollable]="true" scrollHeight="400px">
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 100px">Action</th>
                <th style="width: 120px">Changed By</th>
                <th style="width: 140px">Date & Time</th>
                <th>Changes</th>
                <th style="width: 100px">IP Address</th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-log>
              <tr>
                <td>
                  <p-tag 
                    [value]="log.action" 
                    [severity]="getActionSeverity(log.action)"
                    [icon]="getActionIcon(log.action)"
                  ></p-tag>
                </td>
                <td>
                  <div class="user-info">
                    <i class="pi pi-user"></i>
                    <span>{{ log.changedBy }}</span>
                  </div>
                </td>
                <td>
                  <div class="date-info">
                    <div class="date">{{ log.changedAt | date:'shortDate' }}</div>
                    <div class="time">{{ log.changedAt | date:'shortTime' }}</div>
                  </div>
                </td>
                <td>
                  <div class="changes-container">
                    <div *ngIf="log.action === 'INSERT'" class="change-summary">
                      <strong>Record created</strong>
                      <div class="change-details">
                        <span *ngFor="let field of getCreatedFields(log.newValues); let last = last">
                          {{ field }}<span *ngIf="!last">, </span>
                        </span>
                      </div>
                    </div>
                    
                    <div *ngIf="log.action === 'UPDATE'" class="change-summary">
                      <strong>{{ getChangedFieldsCount(log.oldValues, log.newValues) }} field(s) updated</strong>
                      <div class="change-details">
                        <div 
                          *ngFor="let change of getFieldChanges(log.oldValues, log.newValues)" 
                          class="field-change"
                        >
                          <span class="field-name">{{ change.field }}:</span>
                          <span class="old-value">{{ change.oldValue || 'null' }}</span>
                          <i class="pi pi-arrow-right"></i>
                          <span class="new-value">{{ change.newValue || 'null' }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div *ngIf="log.action === 'DELETE'" class="change-summary">
                      <strong>Record deleted</strong>
                      <div class="change-details">
                        All data permanently removed
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    class="ip-address" 
                    [pTooltip]="log.userAgent"
                    tooltipPosition="left"
                  >
                    {{ log.ipAddress }}
                  </span>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="audit-footer">
          <small class="audit-info">
            💡 Audit logs are kept for compliance and security purposes
          </small>
          <p-button 
            label="Close" 
            icon="pi pi-times" 
            (onClick)="onClose()"
            styleClass="p-button-secondary"
          ></p-button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .audit-content {
      padding: 0;
    }

    .audit-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .audit-header h4 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 1.3rem;
    }

    .audit-description {
      color: #64748b;
      margin: 0;
      font-size: 0.95rem;
    }

    .loading-container {
      text-align: center;
      padding: 3rem;
    }

    .loading-container p {
      margin-top: 1rem;
      color: #64748b;
    }

    .no-data {
      padding: 2rem;
      text-align: center;
    }

    .audit-table-container {
      margin-top: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-info i {
      color: #6b7280;
    }

    .date-info .date {
      font-weight: 600;
      color: #1e293b;
    }

    .date-info .time {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .changes-container {
      max-width: 300px;
    }

    .change-summary strong {
      color: #1e293b;
      display: block;
      margin-bottom: 0.5rem;
    }

    .change-details {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .field-change {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      font-size: 0.85rem;
    }

    .field-name {
      font-weight: 600;
      color: #374151;
      min-width: 80px;
    }

    .old-value {
      color: #dc2626;
      text-decoration: line-through;
      max-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .new-value {
      color: #059669;
      font-weight: 600;
      max-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .field-change i {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .ip-address {
      font-family: monospace;
      font-size: 0.85rem;
      color: #6b7280;
      cursor: help;
    }

    .audit-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .audit-info {
      color: #64748b;
      font-style: italic;
    }

    :global(.audit-dialog) {
      margin-top: 3vh;
    }

    :global(.audit-dialog .p-dialog-content) {
      padding: 1.5rem;
      overflow: hidden;
    }

    :global(.audit-dialog .p-dialog-footer) {
      padding: 1rem 1.5rem;
    }

    :global(.audit-dialog .p-table .p-datatable-tbody > tr > td) {
      padding: 0.75rem 0.5rem;
      vertical-align: top;
    }
  `]
})
export class AuditLogModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() entityType: string = 'Entry';
  @Input() entityId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  auditLogs: AuditLog[] = [];
  loading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Load audit logs when component initializes if visible
    if (this.visible && this.entityId) {
      this.loadAuditLogs();
    }
  }

  loadAuditLogs() {
    if (!this.entityId) return;
    
    this.loading = true;
    this.apiService.getEntityAuditHistory(this.entityType.toLowerCase(), this.entityId, 0, 100)
      .subscribe({
        next: (response: any) => {
          this.auditLogs = response.content || [];
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Failed to load audit logs:', error);
          this.auditLogs = [];
          this.loading = false;
        }
      });
  }

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  getActionSeverity(action: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (action) {
      case 'INSERT': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'danger';
      default: return 'info';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'INSERT': return 'pi pi-plus';
      case 'UPDATE': return 'pi pi-pencil';
      case 'DELETE': return 'pi pi-trash';
      default: return 'pi pi-info-circle';
    }
  }

  getCreatedFields(newValues: any): string[] {
    if (!newValues) return [];
    return Object.keys(newValues).filter(key => 
      newValues[key] !== null && newValues[key] !== undefined && newValues[key] !== ''
    );
  }

  getChangedFieldsCount(oldValues: any, newValues: any): number {
    if (!oldValues || !newValues) return 0;
    
    let count = 0;
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        count++;
      }
    }
    return count;
  }

  getFieldChanges(oldValues: any, newValues: any): any[] {
    if (!oldValues || !newValues) return [];
    
    const changes = [];
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changes.push({
          field: key,
          oldValue: this.formatValue(oldValues[key]),
          newValue: this.formatValue(newValues[key])
        });
      }
    }
    return changes;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string' && value.length > 20) {
      return value.substring(0, 20) + '...';
    }
    return String(value);
  }
}