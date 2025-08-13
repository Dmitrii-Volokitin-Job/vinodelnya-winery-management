import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";

import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { ChartModule } from "primeng/chart";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { TabViewModule } from "primeng/tabview";
import { DataViewModule } from "primeng/dataview";
import { TagModule } from "primeng/tag";
import { ProgressBarModule } from "primeng/progressbar";
import { SkeletonModule } from "primeng/skeleton";
import { AvatarModule } from "primeng/avatar";
import { AccordionModule } from "primeng/accordion";
import { FieldsetModule } from "primeng/fieldset";
import { TooltipModule } from "primeng/tooltip";
import { InputTextModule } from "primeng/inputtext";
import { MessageService } from "primeng/api";

import { ApiService } from "../services/api.service";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    CalendarModule,
    ChartModule,
    TableModule,
    ToastModule,
    TabViewModule,
    DataViewModule,
    TagModule,
    ProgressBarModule,
    SkeletonModule,
    AvatarModule,
    AccordionModule,
    FieldsetModule,
    TooltipModule,
    InputTextModule,
  ],
  providers: [MessageService],
  template: `
    <div class="main-container">
      <div class="reports-header">
        <h2>📊 Reports & Analytics</h2>
        <p>Comprehensive insights into your winery operations</p>
      </div>

      <!-- Date Filter Section -->
      <div class="filter-section">
        <p-fieldset legend="📅 Report Period" [toggleable]="true">
          <form [formGroup]="dateForm" class="date-filter">
            <div class="filter-grid">
              <div class="field">
                <label for="fromDate">From Date</label>
                <p-calendar
                  id="fromDate"
                  formControlName="fromDate"
                  dateFormat="yy-mm-dd"
                  showIcon="true"
                  class="w-full"
                ></p-calendar>
              </div>
              <div class="field">
                <label for="toDate">To Date</label>
                <p-calendar
                  id="toDate"
                  formControlName="toDate"
                  dateFormat="yy-mm-dd"
                  showIcon="true"
                  class="w-full"
                ></p-calendar>
              </div>
              <div class="field">
                <p-button
                  label="Generate Reports"
                  icon="pi pi-refresh"
                  (onClick)="generateReports()"
                  [loading]="loading"
                  class="w-full generate-btn"
                  pTooltip="Generate reports for selected period"
                ></p-button>
              </div>
            </div>
          </form>
        </p-fieldset>
      </div>

      <!-- Reports Tabs -->
      <div class="reports-content">
        <p-tabView [scrollable]="true">
          <!-- Events Report Tab -->
          <p-tabPanel header="🍷 Events Report" leftIcon="pi pi-calendar">
            <div *ngIf="loading; else eventsContent">
              <div class="loading-skeleton">
                <p-skeleton height="200px" class="mb-3"></p-skeleton>
                <p-skeleton height="150px" class="mb-3"></p-skeleton>
                <p-skeleton height="100px"></p-skeleton>
              </div>
            </div>
            <ng-template #eventsContent>
              <!-- Events Summary Cards -->
              <div class="summary-grid">
                <div class="summary-card events-summary">
                  <div class="card-header">
                    <p-avatar icon="pi pi-calendar" size="large" styleClass="events-avatar"></p-avatar>
                    <div class="card-stats">
                      <div class="stat-value">{{ eventsReport?.totalEvents || 0 }}</div>
                      <div class="stat-label">Total Events</div>
                    </div>
                  </div>
                  <div class="progress-section">
                    <div class="progress-label">Completion Rate</div>
                    <p-progressBar [value]="eventsReport?.completionRate || 0" [style]="{height: '8px'}" styleClass="events-progress"></p-progressBar>
                  </div>
                </div>

                <div class="summary-card revenue-summary">
                  <div class="card-header">
                    <p-avatar icon="pi pi-dollar" size="large" styleClass="revenue-avatar"></p-avatar>
                    <div class="card-stats">
                      <div class="stat-value">{{ eventsReport?.totalRevenue | currency:'GEL':'symbol':'1.0-0' }}</div>
                      <div class="stat-label">Events Revenue</div>
                    </div>
                  </div>
                  <div class="progress-section">
                    <div class="progress-label">Monthly Target</div>
                    <p-progressBar [value]="eventsReport?.targetProgress || 0" [style]="{height: '8px'}" styleClass="revenue-progress"></p-progressBar>
                  </div>
                </div>

                <div class="summary-card guests-summary">
                  <div class="card-header">
                    <p-avatar icon="pi pi-users" size="large" styleClass="guests-avatar"></p-avatar>
                    <div class="card-stats">
                      <div class="stat-value">{{ eventsReport?.totalGuests || 0 }}</div>
                      <div class="stat-label">Total Guests</div>
                    </div>
                  </div>
                  <div class="guest-types">
                    <div class="guest-breakdown">
                      <span>Adults: {{ eventsReport?.adultGuests || 0 }}</span>
                      <span>Children: {{ eventsReport?.childrenGuests || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Events Chart -->
              <div class="chart-section">
                <p-card header="📈 Events Trend Analysis">
                  <p-chart
                    type="bar"
                    [data]="eventsChartData"
                    [options]="eventsChartOptions"
                    height="300px"
                  ></p-chart>
                </p-card>
              </div>

              <!-- Events Details -->
              <div class="details-section">
                <p-accordion [multiple]="true">
                  <p-accordionTab header="📊 Event Types Breakdown" [selected]="true">
                    <div class="event-types-grid">
                      <div class="event-type" *ngFor="let type of eventsReport?.eventTypes">
                        <div class="type-header">
                          <h4>{{ type.name }}</h4>
                          <p-tag [value]="type.count + ' events'" severity="info"></p-tag>
                        </div>
                        <div class="type-stats">
                          <div class="type-stat">
                            <span class="label">Revenue:</span>
                            <span class="value">{{ type.revenue | currency:'GEL' }}</span>
                          </div>
                          <div class="type-stat">
                            <span class="label">Avg per Event:</span>
                            <span class="value">{{ type.avgRevenue | currency:'GEL' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </p-accordionTab>
                  
                  <p-accordionTab header="🎯 Performance Metrics">
                    <div class="metrics-grid">
                      <div class="metric-card" *ngFor="let metric of eventsReport?.metrics">
                        <div class="metric-icon">
                          <i [class]="metric.icon"></i>
                        </div>
                        <div class="metric-info">
                          <div class="metric-value" [ngClass]="metric.trend">{{ metric.value }}</div>
                          <div class="metric-label">{{ metric.label }}</div>
                          <div class="metric-trend">
                            <i class="pi" [ngClass]="getTrendIcon(metric.trend)"></i>
                            {{ metric.change }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </p-accordionTab>
                </p-accordion>
              </div>
            </ng-template>
          </p-tabPanel>

          <!-- Detailed Data Tab -->
          <p-tabPanel header="📋 Detailed Data" leftIcon="pi pi-list">
            <div *ngIf="loading; else detailsContent">
              <div class="loading-skeleton">
                <p-skeleton height="200px" class="mb-3"></p-skeleton>
                <p-skeleton height="150px" class="mb-3"></p-skeleton>
                <p-skeleton height="100px"></p-skeleton>
              </div>
            </div>
            <ng-template #detailsContent>
              <p-tabView>
                <!-- Entries Details Tab -->
                <p-tabPanel header="📝 Work Entries">
                  <div class="section-header">
                    <h3>Individual Work Entries</h3>
                    <p>Detailed breakdown of all work entries contributing to the totals</p>
                  </div>
                  
                  <div class="summary-banner" *ngIf="detailedEntries?.length">
                    <div class="banner-stat">
                      <span class="stat-label">Total Entries:</span>
                      <span class="stat-value">{{ detailedEntries.length }}</span>
                    </div>
                    <div class="banner-stat">
                      <span class="stat-label">Total Hours:</span>
                      <span class="stat-value">{{ getTotalHours() }}h</span>
                    </div>
                    <div class="banner-stat">
                      <span class="stat-label">Total Cost:</span>
                      <span class="stat-value">{{ getTotalCost() | currency:'EUR' }}</span>
                    </div>
                    <div class="banner-stat">
                      <span class="stat-label">People Involved:</span>
                      <span class="stat-value">{{ getUniquePersons() }}</span>
                    </div>
                  </div>

                  <p-table 
                    [value]="detailedEntries" 
                    [paginator]="true" 
                    [rows]="15"
                    [rowsPerPageOptions]="[15, 30, 45]"
                    [sortField]="'date'" 
                    [sortOrder]="-1"
                    styleClass="detailed-table"
                    [globalFilterFields]="['description', 'personName', 'categoryName']"
                    #entriesTable
                  >
                    <ng-template pTemplate="caption">
                      <div class="table-header">
                        <span class="p-input-icon-left">
                          <i class="pi pi-search"></i>
                          <input 
                            pInputText 
                            type="text" 
                            (input)="onGlobalFilter(entriesTable, $event)" 
                            placeholder="Search entries..." 
                          />
                        </span>
                      </div>
                    </ng-template>
                    
                    <ng-template pTemplate="header">
                      <tr>
                        <th pSortableColumn="date" style="width: 120px">Date <p-sortIcon field="date"></p-sortIcon></th>
                        <th pSortableColumn="description">Description <p-sortIcon field="description"></p-sortIcon></th>
                        <th pSortableColumn="personName" style="width: 150px">Person <p-sortIcon field="personName"></p-sortIcon></th>
                        <th pSortableColumn="categoryName" style="width: 150px">Category <p-sortIcon field="categoryName"></p-sortIcon></th>
                        <th pSortableColumn="workHours" style="width: 100px; text-align: right">Hours <p-sortIcon field="workHours"></p-sortIcon></th>
                        <th pSortableColumn="amountPaid" style="width: 120px; text-align: right">Paid <p-sortIcon field="amountPaid"></p-sortIcon></th>
                        <th pSortableColumn="amountDue" style="width: 120px; text-align: right">Due <p-sortIcon field="amountDue"></p-sortIcon></th>
                      </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="body" let-entry let-rowIndex="rowIndex">
                      <tr [ngClass]="{'highlight-row': rowIndex % 2 === 0}">
                        <td>{{ entry.date | date:'shortDate' }}</td>
                        <td>
                          <div class="description-cell">
                            {{ entry.description }}
                          </div>
                        </td>
                        <td>
                          <div class="person-cell">
                            <p-avatar icon="pi pi-user" size="normal"></p-avatar>
                            <span>{{ entry.personName }}</span>
                          </div>
                        </td>
                        <td>
                          <p-tag [value]="entry.categoryName" severity="info"></p-tag>
                        </td>
                        <td style="text-align: right">
                          <span class="hours-badge">{{ entry.workHours || 0 }}h</span>
                        </td>
                        <td style="text-align: right">
                          <span class="amount-paid">{{ entry.amountPaid | currency:'EUR':'symbol':'1.2-2' }}</span>
                        </td>
                        <td style="text-align: right">
                          <span class="amount-due">{{ entry.amountDue | currency:'EUR':'symbol':'1.2-2' }}</span>
                        </td>
                      </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="summary">
                      <div class="table-summary">
                        <div class="summary-row">
                          <strong>Period Totals: </strong>
                          <span>{{ getTotalHours() }} hours</span> | 
                          <span>{{ getTotalPaid() | currency:'EUR' }} paid</span> | 
                          <span>{{ getTotalDue() | currency:'EUR' }} due</span>
                        </div>
                      </div>
                    </ng-template>
                  </p-table>
                </p-tabPanel>

                <!-- Events Details Tab -->
                <p-tabPanel header="🍷 Event Details">
                  <div class="section-header">
                    <h3>Individual Events</h3>
                    <p>Detailed breakdown of all events contributing to revenue totals</p>
                  </div>
                  
                  <div class="summary-banner" *ngIf="detailedEvents?.length">
                    <div class="banner-stat">
                      <span class="stat-label">Total Events:</span>
                      <span class="stat-value">{{ detailedEvents.length }}</span>
                    </div>
                    <div class="banner-stat">
                      <span class="stat-label">Total Revenue:</span>
                      <span class="stat-value">{{ getEventsRevenue() | currency:'EUR' }}</span>
                    </div>
                    <div class="banner-stat">
                      <span class="stat-label">Total Guests:</span>
                      <span class="stat-value">{{ getTotalGuests() }}</span>
                    </div>
                    <div class="banner-stat">
                      <span class="stat-label">Avg per Event:</span>
                      <span class="stat-value">{{ getAverageRevenue() | currency:'EUR' }}</span>
                    </div>
                  </div>

                  <p-table 
                    [value]="detailedEvents" 
                    [paginator]="true" 
                    [rows]="15"
                    [rowsPerPageOptions]="[15, 30, 45]"
                    [sortField]="'visitDate'" 
                    [sortOrder]="-1"
                    styleClass="detailed-table"
                    [globalFilterFields]="['company', 'contactName']"
                    #eventsTable
                  >
                    <ng-template pTemplate="caption">
                      <div class="table-header">
                        <span class="p-input-icon-left">
                          <i class="pi pi-search"></i>
                          <input 
                            pInputText 
                            type="text" 
                            (input)="onGlobalFilter(eventsTable, $event)" 
                            placeholder="Search events..." 
                          />
                        </span>
                      </div>
                    </ng-template>
                    
                    <ng-template pTemplate="header">
                      <tr>
                        <th pSortableColumn="visitDate" style="width: 120px">Date <p-sortIcon field="visitDate"></p-sortIcon></th>
                        <th pSortableColumn="visitTime" style="width: 100px">Time <p-sortIcon field="visitTime"></p-sortIcon></th>
                        <th pSortableColumn="company">Company/Contact <p-sortIcon field="company"></p-sortIcon></th>
                        <th pSortableColumn="adultLunchGuests" style="width: 80px; text-align: center">Lunch <p-sortIcon field="adultLunchGuests"></p-sortIcon></th>
                        <th pSortableColumn="adultTastingGuests" style="width: 80px; text-align: center">Tasting <p-sortIcon field="adultTastingGuests"></p-sortIcon></th>
                        <th pSortableColumn="childrenGuests" style="width: 80px; text-align: center">Kids <p-sortIcon field="childrenGuests"></p-sortIcon></th>
                        <th pSortableColumn="grandTotal" style="width: 120px; text-align: right">Revenue <p-sortIcon field="grandTotal"></p-sortIcon></th>
                        <th style="width: 100px; text-align: center">Status</th>
                      </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="body" let-event let-rowIndex="rowIndex">
                      <tr [ngClass]="{'highlight-row': rowIndex % 2 === 0}">
                        <td>{{ event.visitDate | date:'shortDate' }}</td>
                        <td>{{ event.visitTime }}</td>
                        <td>
                          <div class="company-cell">
                            <div class="company-name">{{ event.company || 'Private Event' }}</div>
                            <div class="contact-info">{{ event.contactName }}</div>
                          </div>
                        </td>
                        <td style="text-align: center">
                          <span class="guest-count lunch">{{ event.adultLunchGuests + event.childrenGuests }}</span>
                        </td>
                        <td style="text-align: center">
                          <span class="guest-count tasting">{{ event.adultTastingGuests }}</span>
                        </td>
                        <td style="text-align: center">
                          <span class="guest-count children">{{ event.childrenGuests }}</span>
                        </td>
                        <td style="text-align: right">
                          <span class="revenue-amount">{{ event.grandTotal | currency:'EUR':'symbol':'1.2-2' }}</span>
                        </td>
                        <td style="text-align: center">
                          <div class="status-column">
                            <p-tag 
                              [value]="event.masterclass ? 'Master' : 'Standard'" 
                              [severity]="event.masterclass ? 'success' : 'info'"
                              styleClass="mb-1"
                            ></p-tag>
                            <p-tag 
                              [value]="event.invoiceIssued ? 'Invoiced' : 'Pending'" 
                              [severity]="event.invoiceIssued ? 'success' : 'warning'"
                            ></p-tag>
                          </div>
                        </td>
                      </tr>
                    </ng-template>
                    
                    <ng-template pTemplate="summary">
                      <div class="table-summary">
                        <div class="summary-row">
                          <strong>Period Totals: </strong>
                          <span>{{ getTotalGuests() }} guests</span> | 
                          <span>{{ getEventsRevenue() | currency:'EUR' }} revenue</span> | 
                          <span>{{ getInvoicedEvents() }}/{{ (detailedEvents.length || 0) }} invoiced</span>
                        </div>
                      </div>
                    </ng-template>
                  </p-table>
                </p-tabPanel>
              </p-tabView>
            </ng-template>
          </p-tabPanel>

          <!-- Work/Jobs Report Tab -->
          <p-tabPanel header="👷 Work Report" leftIcon="pi pi-wrench">
            <div *ngIf="loading; else workContent">
              <div class="loading-skeleton">
                <p-skeleton height="200px" class="mb-3"></p-skeleton>
                <p-skeleton height="150px" class="mb-3"></p-skeleton>
                <p-skeleton height="100px"></p-skeleton>
              </div>
            </div>
            <ng-template #workContent>
              <!-- Work Summary Cards -->
              <div class="summary-grid">
                <div class="summary-card work-hours-summary">
                  <div class="card-header">
                    <p-avatar icon="pi pi-clock" size="large" styleClass="hours-avatar"></p-avatar>
                    <div class="card-stats">
                      <div class="stat-value">{{ workReport?.totalHours || 0 }}<span class="unit">h</span></div>
                      <div class="stat-label">Total Work Hours</div>
                    </div>
                  </div>
                  <div class="progress-section">
                    <div class="progress-label">Monthly Capacity</div>
                    <p-progressBar [value]="workReport?.capacityUsage || 0" [style]="{height: '8px'}" styleClass="hours-progress"></p-progressBar>
                  </div>
                </div>

                <div class="summary-card labor-cost-summary">
                  <div class="card-header">
                    <p-avatar icon="pi pi-wallet" size="large" styleClass="cost-avatar"></p-avatar>
                    <div class="card-stats">
                      <div class="stat-value">{{ workReport?.totalCost | currency:'GEL':'symbol':'1.0-0' }}</div>
                      <div class="stat-label">Labor Costs</div>
                    </div>
                  </div>
                  <div class="progress-section">
                    <div class="progress-label">Budget Usage</div>
                    <p-progressBar [value]="workReport?.budgetUsage || 0" [style]="{height: '8px'}" styleClass="cost-progress"></p-progressBar>
                  </div>
                </div>

                <div class="summary-card efficiency-summary">
                  <div class="card-header">
                    <p-avatar icon="pi pi-chart-line" size="large" styleClass="efficiency-avatar"></p-avatar>
                    <div class="card-stats">
                      <div class="stat-value">{{ workReport?.efficiency || 0 }}<span class="unit">%</span></div>
                      <div class="stat-label">Efficiency Rate</div>
                    </div>
                  </div>
                  <div class="efficiency-indicator">
                    <p-tag 
                      [value]="getEfficiencyLabel(workReport?.efficiency || 0)" 
                      [severity]="getEfficiencySeverity(workReport?.efficiency || 0)"
                    ></p-tag>
                  </div>
                </div>
              </div>

              <!-- Work Chart -->
              <div class="chart-section">
                <p-card header="📈 Work Distribution Analysis">
                  <p-chart
                    type="doughnut"
                    [data]="workChartData"
                    [options]="workChartOptions"
                    height="300px"
                  ></p-chart>
                </p-card>
              </div>

              <!-- Work Details -->
              <div class="details-section">
                <p-accordion [multiple]="true">
                  <p-accordionTab header="👥 Personnel Performance" [selected]="true">
                    <p-dataView [value]="workReport?.personnel" layout="grid">
                      <ng-template #gridItem let-person>
                        <div class="person-card">
                          <div class="person-header">
                            <p-avatar icon="pi pi-user" size="large"></p-avatar>
                            <div class="person-info">
                              <div class="person-name">{{ person.name }}</div>
                              <div class="person-role">{{ person.role }}</div>
                            </div>
                          </div>
                          <div class="person-stats">
                            <div class="stat-row">
                              <span>Hours:</span>
                              <span class="stat-value">{{ person.hours }}h</span>
                            </div>
                            <div class="stat-row">
                              <span>Cost:</span>
                              <span class="stat-value">{{ person.cost | currency:'GEL' }}</span>
                            </div>
                            <div class="stat-row">
                              <span>Tasks:</span>
                              <span class="stat-value">{{ person.completedTasks }}</span>
                            </div>
                          </div>
                          <div class="person-progress">
                            <div class="progress-label">Performance</div>
                            <p-progressBar [value]="person.performance" [style]="{height: '6px'}"></p-progressBar>
                          </div>
                        </div>
                      </ng-template>
                    </p-dataView>
                  </p-accordionTab>
                  
                  <p-accordionTab header="🏷️ Categories Breakdown">
                    <p-table [value]="workReport?.categories">
                      <ng-template pTemplate="header">
                        <tr>
                          <th pSortableColumn="name">Category <p-sortIcon field="name"></p-sortIcon></th>
                          <th pSortableColumn="hours">Hours <p-sortIcon field="hours"></p-sortIcon></th>
                          <th pSortableColumn="cost">Cost <p-sortIcon field="cost"></p-sortIcon></th>
                          <th pSortableColumn="entries">Entries <p-sortIcon field="entries"></p-sortIcon></th>
                          <th>Share</th>
                        </tr>
                      </ng-template>
                      <ng-template pTemplate="body" let-category>
                        <tr>
                          <td>
                            <div class="category-cell">
                              <div class="category-color" [style.background-color]="category.color"></div>
                              {{ category.name }}
                            </div>
                          </td>
                          <td>{{ category.hours }}h</td>
                          <td>{{ category.cost | currency:'GEL' }}</td>
                          <td>{{ category.entries }}</td>
                          <td>
                            <p-progressBar [value]="category.percentage" [style]="{height: '12px', width: '80px'}" [color]="category.color"></p-progressBar>
                            <small>{{ category.percentage }}%</small>
                          </td>
                        </tr>
                      </ng-template>
                    </p-table>
                  </p-accordionTab>
                </p-accordion>
              </div>
            </ng-template>
          </p-tabPanel>
        </p-tabView>
      </div>
    </div>

    <p-toast></p-toast>
  `,
  styles: [
    `
      .reports-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .reports-header h2 {
        margin: 0 0 0.5rem 0;
        color: #1e293b;
        font-size: 2rem;
        font-weight: 600;
      }

      .reports-header p {
        color: #64748b;
        margin: 0;
        font-size: 1.1rem;
      }

      .filter-section {
        margin-bottom: 2rem;
      }

      .date-filter {
        padding: 0;
      }

      .filter-grid {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 1rem;
        align-items: end;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .field label {
        font-weight: 500;
        color: #374151;
        font-size: 0.9rem;
      }

      .generate-btn {
        height: 3rem;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .summary-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 1.5rem;
        color: white;
        position: relative;
        overflow: hidden;
      }

      .summary-card::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        transform: translate(30px, -30px);
      }

      .events-summary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .revenue-summary {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .guests-summary {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      .work-hours-summary {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      .labor-cost-summary {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }

      .efficiency-summary {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #1e293b;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .card-stats {
        flex: 1;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 0.25rem;
      }

      .stat-value .unit {
        font-size: 1.2rem;
        font-weight: 500;
        opacity: 0.8;
      }

      .stat-label {
        font-size: 0.9rem;
        opacity: 0.9;
        font-weight: 500;
      }

      .progress-section {
        margin-top: 1rem;
      }

      .progress-label {
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
        opacity: 0.9;
      }

      .guest-breakdown {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        margin-top: 1rem;
      }

      .efficiency-indicator {
        margin-top: 1rem;
      }

      .chart-section {
        margin: 2rem 0;
      }

      .details-section {
        margin-top: 2rem;
      }

      .event-types-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .event-type {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1rem;
      }

      .type-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .type-header h4 {
        margin: 0;
        color: #1e293b;
      }

      .type-stats {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .type-stat {
        display: flex;
        justify-content: space-between;
      }

      .type-stat .label {
        color: #6b7280;
        font-size: 0.9rem;
      }

      .type-stat .value {
        font-weight: 600;
        color: #1e293b;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .metric-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: white;
      }

      .metric-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        color: #6b7280;
      }

      .metric-info {
        flex: 1;
      }

      .metric-value {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
      }

      .metric-value.up {
        color: #10b981;
      }

      .metric-value.down {
        color: #ef4444;
      }

      .metric-label {
        color: #6b7280;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }

      .metric-trend {
        font-size: 0.8rem;
        color: #10b981;
        font-weight: 500;
      }

      .person-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        background: white;
      }

      .person-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .person-info {
        flex: 1;
      }

      .person-name {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 0.25rem;
      }

      .person-role {
        color: #6b7280;
        font-size: 0.9rem;
      }

      .person-stats {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .stat-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
      }

      .stat-row .stat-value {
        font-weight: 600;
        color: #1e293b;
      }

      .person-progress {
        margin-top: 1rem;
      }

      .progress-label {
        font-size: 0.8rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
      }

      .category-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .category-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .loading-skeleton {
        padding: 2rem;
      }

      .w-full {
        width: 100%;
      }

      .section-header {
        margin-bottom: 1.5rem;
        text-align: center;
      }

      .section-header h3 {
        margin: 0 0 0.5rem 0;
        color: #1e293b;
        font-size: 1.5rem;
      }

      .section-header p {
        color: #64748b;
        margin: 0;
      }

      .summary-banner {
        display: flex;
        justify-content: space-around;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        border: 1px solid #cbd5e1;
      }

      .banner-stat {
        text-align: center;
      }

      .banner-stat .stat-label {
        display: block;
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 0.25rem;
        font-weight: 500;
      }

      .banner-stat .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
      }

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
      }

      .description-cell {
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .person-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .company-cell .company-name {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 0.25rem;
      }

      .company-cell .contact-info {
        font-size: 0.9rem;
        color: #64748b;
      }

      .hours-badge {
        background: #dbeafe;
        color: #1e40af;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .amount-paid {
        color: #10b981;
        font-weight: 600;
      }

      .amount-due {
        color: #ef4444;
        font-weight: 600;
      }

      .revenue-amount {
        color: #059669;
        font-weight: 700;
        font-size: 1.1rem;
      }

      .guest-count {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 600;
        min-width: 30px;
        text-align: center;
      }

      .guest-count.lunch {
        background: #fef3c7;
        color: #d97706;
      }

      .guest-count.tasting {
        background: #ddd6fe;
        color: #7c3aed;
      }

      .guest-count.children {
        background: #fce7f3;
        color: #be185d;
      }

      .status-column {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        align-items: center;
      }

      .highlight-row {
        background-color: #f9fafb;
      }

      .detailed-table {
        margin-top: 1rem;
      }

      .table-summary {
        background: #f8fafc;
        padding: 1rem;
        border-radius: 6px;
        margin-top: 1rem;
        border: 1px solid #e2e8f0;
      }

      .summary-row {
        text-align: center;
        font-size: 0.95rem;
        color: #374151;
      }

      .summary-row span {
        margin: 0 0.5rem;
      }

      @media (max-width: 768px) {
        .filter-grid {
          grid-template-columns: 1fr;
        }

        .summary-grid {
          grid-template-columns: 1fr;
        }

        .metrics-grid {
          grid-template-columns: 1fr;
        }

        .event-types-grid {
          grid-template-columns: 1fr;
        }

        .summary-banner {
          flex-direction: column;
          gap: 1rem;
        }

        .banner-stat .stat-value {
          font-size: 1.25rem;
        }

        .company-cell .company-name,
        .company-cell .contact-info {
          font-size: 0.85rem;
        }
      }
    `,
  ],
})
export class ReportsComponent implements OnInit {
  dateForm: FormGroup;
  loading = false;
  eventsReport: any = null;
  workReport: any = null;
  detailedEntries: any[] = [];
  detailedEvents: any[] = [];
  eventsChartData: any;
  eventsChartOptions: any;
  workChartData: any;
  workChartOptions: any;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private messageService: MessageService,
  ) {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.dateForm = this.fb.group({
      fromDate: [firstOfMonth, Validators.required],
      toDate: [today, Validators.required],
    });

    this.initializeCharts();
  }

  ngOnInit() {
    this.generateReports();
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  private initializeCharts() {
    // Events Chart
    this.eventsChartData = {
      labels: ['Wine Tastings', 'Vineyard Tours', 'Private Events', 'Corporate', 'Masterclasses'],
      datasets: [{
        label: 'Events Count',
        data: [12, 8, 5, 3, 7],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }]
    };

    this.eventsChartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };

    // Work Chart
    this.workChartData = {
      labels: ['Vineyard Work', 'Cellar Operations', 'Administration', 'Events Support', 'Maintenance'],
      datasets: [{
        data: [35, 25, 15, 15, 10],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
        hoverBackgroundColor: ['#059669', '#2563EB', '#D97706', '#DC2626', '#7C3AED']
      }]
    };

    this.workChartOptions = {
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  generateReports() {
    if (this.dateForm.valid) {
      this.loading = true;
      const fromDate = this.dateForm.value.fromDate.toISOString().split("T")[0];
      const toDate = this.dateForm.value.toDate.toISOString().split("T")[0];

      // Load actual data from API
      this.loadDetailedData(fromDate, toDate);
    }
  }

  private loadDetailedData(fromDate: string, toDate: string) {
    const apiFilters = {
      dateFrom: fromDate,
      dateTo: toDate
    };

    // Load entries data
    this.apiService.getEntries(0, 1000, 'date,desc', apiFilters).subscribe({
      next: (entriesResponse) => {
        this.detailedEntries = entriesResponse.content;
        this.loadEventsData(fromDate, toDate);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load entries data'
        });
        this.loading = false;
      }
    });
  }

  private loadEventsData(fromDate: string, toDate: string) {
    // Load events data
    this.apiService.getEvents(0, 1000, 'visitDate,desc').subscribe({
      next: (eventsResponse) => {
        // Filter events by date range
        this.detailedEvents = eventsResponse.content.filter(event => {
          const eventDate = new Date(event.visitDate);
          const startDate = new Date(fromDate);
          const endDate = new Date(toDate);
          return eventDate >= startDate && eventDate <= endDate;
        });
        
        this.generateEventsReport(fromDate, toDate);
        this.generateWorkReport(fromDate, toDate);
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Reports generated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load events data'
        });
        this.loading = false;
      }
    });
  }

  private generateEventsReport(fromDate: string, toDate: string) {
    this.eventsReport = {
      totalEvents: 35,
      completionRate: 94,
      totalRevenue: 28750,
      targetProgress: 76,
      totalGuests: 342,
      adultGuests: 289,
      childrenGuests: 53,
      eventTypes: [
        {
          name: 'Wine Tastings',
          count: 12,
          revenue: 12400,
          avgRevenue: 1033
        },
        {
          name: 'Vineyard Tours',
          count: 8,
          revenue: 6800,
          avgRevenue: 850
        },
        {
          name: 'Private Events',
          count: 5,
          revenue: 9550,
          avgRevenue: 1910
        }
      ],
      metrics: [
        {
          label: 'Booking Rate',
          value: '87%',
          trend: 'up',
          change: '+5%',
          icon: 'pi pi-calendar-plus'
        },
        {
          label: 'Guest Satisfaction',
          value: '4.8/5',
          trend: 'up',
          change: '+0.2',
          icon: 'pi pi-star'
        },
        {
          label: 'Avg Revenue/Guest',
          value: '€84',
          trend: 'up',
          change: '+€7',
          icon: 'pi pi-euro'
        }
      ]
    };
  }

  private generateWorkReport(fromDate: string, toDate: string) {
    // Calculate actual data from entries
    const totalHours = this.getTotalHours();
    const totalCost = this.getTotalCost();
    
    // Generate personnel performance data from actual entries
    const personnelStats = this.generatePersonnelStats();
    
    // Generate category breakdown from actual entries  
    const categoryStats = this.generateCategoryStats();
    
    this.workReport = {
      totalHours: totalHours,
      capacityUsage: Math.min(100, Math.round((totalHours / 500) * 100)), // Assuming 500h monthly capacity
      totalCost: totalCost,
      budgetUsage: Math.min(100, Math.round((totalCost / 25000) * 100)), // Assuming 25000 budget
      efficiency: Math.min(100, Math.round(75 + (totalHours / 10))), // Basic efficiency calculation
      personnel: personnelStats,
      categories: categoryStats
    };
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return 'pi-arrow-up';
      case 'down':
        return 'pi-arrow-down';
      default:
        return 'pi-minus';
    }
  }

  getEfficiencyLabel(efficiency: number): string {
    if (efficiency >= 90) return 'Excellent';
    if (efficiency >= 75) return 'Good';
    if (efficiency >= 60) return 'Average';
    return 'Needs Improvement';
  }

  getEfficiencySeverity(efficiency: number): 'success' | 'warning' | 'danger' | 'info' {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 75) return 'info';
    if (efficiency >= 60) return 'warning';
    return 'danger';
  }

  // Methods for calculating detailed data totals
  getTotalHours(): number {
    return this.detailedEntries.reduce((sum, entry) => sum + (entry.workHours || 0), 0);
  }

  getTotalCost(): number {
    return this.detailedEntries.reduce((sum, entry) => sum + (entry.amountPaid || 0) + (entry.amountDue || 0), 0);
  }

  getTotalPaid(): number {
    return this.detailedEntries.reduce((sum, entry) => sum + (entry.amountPaid || 0), 0);
  }

  getTotalDue(): number {
    return this.detailedEntries.reduce((sum, entry) => sum + (entry.amountDue || 0), 0);
  }

  getUniquePersons(): number {
    const uniquePersons = new Set(this.detailedEntries.map(entry => entry.personName));
    return uniquePersons.size;
  }

  getEventsRevenue(): number {
    return this.detailedEvents.reduce((sum, event) => sum + (event.grandTotal || 0), 0);
  }

  getTotalGuests(): number {
    return this.detailedEvents.reduce((sum, event) => {
      return sum + (event.adultLunchGuests || 0) + (event.adultTastingGuests || 0) + (event.childrenGuests || 0);
    }, 0);
  }

  getAverageRevenue(): number {
    if (this.detailedEvents.length === 0) return 0;
    return this.getEventsRevenue() / this.detailedEvents.length;
  }

  getInvoicedEvents(): number {
    return this.detailedEvents.filter(event => event.invoiceIssued).length;
  }

  private generatePersonnelStats(): any[] {
    // Group entries by person
    const personStats = new Map<string, any>();
    
    this.detailedEntries.forEach(entry => {
      const personName = entry.personName || 'Unknown';
      
      if (!personStats.has(personName)) {
        personStats.set(personName, {
          name: personName,
          role: this.getPersonRole(personName), // Helper method to determine role
          hours: 0,
          cost: 0,
          completedTasks: 0,
          performance: 0
        });
      }
      
      const stats = personStats.get(personName);
      stats.hours += entry.workHours || 0;
      stats.cost += (entry.amountPaid || 0) + (entry.amountDue || 0);
      stats.completedTasks += 1;
    });
    
    // Convert map to array and calculate performance
    return Array.from(personStats.values()).map(person => ({
      ...person,
      performance: Math.min(100, Math.round(60 + (person.hours / 5) + (person.completedTasks * 2)))
    }));
  }

  private generateCategoryStats(): any[] {
    // Group entries by category
    const categoryStats = new Map<string, any>();
    const totalHours = this.getTotalHours();
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];
    let colorIndex = 0;
    
    this.detailedEntries.forEach(entry => {
      const categoryName = entry.categoryName || 'Uncategorized';
      
      if (!categoryStats.has(categoryName)) {
        categoryStats.set(categoryName, {
          name: categoryName,
          hours: 0,
          cost: 0,
          entries: 0,
          percentage: 0,
          color: colors[colorIndex % colors.length]
        });
        colorIndex++;
      }
      
      const stats = categoryStats.get(categoryName);
      stats.hours += entry.workHours || 0;
      stats.cost += (entry.amountPaid || 0) + (entry.amountDue || 0);
      stats.entries += 1;
    });
    
    // Convert map to array and calculate percentages
    return Array.from(categoryStats.values()).map(category => ({
      ...category,
      percentage: totalHours > 0 ? Math.round((category.hours / totalHours) * 100) : 0
    }));
  }

  private getPersonRole(personName: string): string {
    // Simple role assignment based on name patterns or could be enhanced with API data
    const rolePatterns = [
      { pattern: /marco|silva/i, role: 'Head Vintner' },
      { pattern: /elena|rodriguez/i, role: 'Tour Guide' },
      { pattern: /david|chen/i, role: 'Cellar Worker' },
      { pattern: /admin/i, role: 'Administrator' }
    ];
    
    for (const rolePattern of rolePatterns) {
      if (rolePattern.pattern.test(personName)) {
        return rolePattern.role;
      }
    }
    
    return 'Worker'; // Default role
  }
}
