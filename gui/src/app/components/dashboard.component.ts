import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MenubarModule } from "primeng/menubar";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";
import { ProgressBarModule } from "primeng/progressbar";
import { SkeletonModule } from "primeng/skeleton";
import { BadgeModule } from "primeng/badge";
import { AvatarModule } from "primeng/avatar";
import { RippleModule } from "primeng/ripple";
import { TooltipModule } from "primeng/tooltip";

import { AuthService } from "../services/auth.service";
import { ApiService } from "../services/api.service";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MenubarModule,
    ButtonModule,
    CardModule,
    ChartModule,
    ProgressBarModule,
    SkeletonModule,
    BadgeModule,
    AvatarModule,
    RippleModule,
    TooltipModule,
  ],
  template: `
    <div class="main-container">
      <!-- Quick Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" *ngFor="let stat of quickStats">
          <p-card>
            <ng-template #content>
              <div class="stat-content">
                <div class="stat-icon">
                  <p-avatar
                    [icon]="stat.icon"
                    size="large"
                    [style]="{ 'background-color': stat.color, color: 'white' }"
                  ></p-avatar>
                </div>
                <div class="stat-info">
                  <div class="stat-value" [pTooltip]="stat.tooltip">
                    {{ stat.loading ? '...' : stat.value }}
                  </div>
                  <div class="stat-label">{{ stat.label }}</div>
                  <div class="stat-trend" [ngClass]="stat.trend">
                    <i class="pi" [ngClass]="getTrendIcon(stat.trend)"></i>
                    {{ stat.change }}
                  </div>
                </div>
              </div>
              <div class="stat-progress" *ngIf="stat.progress !== undefined">
                <p-progressBar
                  [value]="stat.progress"
                  [style]="{ height: '4px' }"
                  [color]="stat.color"
                ></p-progressBar>
              </div>
            </ng-template>
          </p-card>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- Navigation Cards -->
        <div class="nav-section">
          <h3>Management</h3>
          <div class="nav-cards">
            <div class="nav-card" *ngFor="let item of navigationItems">
              <p-card [class]="'nav-card-' + item.color">
                <ng-template #header>
                  <div class="nav-card-header">
                    <p-avatar [icon]="item.icon" size="normal"></p-avatar>
                    <p-badge
                      *ngIf="item.badge"
                      [value]="item.badge"
                      severity="info"
                    ></p-badge>
                  </div>
                </ng-template>
                <ng-template #content>
                  <div class="nav-card-content">
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.description }}</p>
                    <div class="nav-card-actions">
                      <p-button
                        [label]="item.actionLabel"
                        [routerLink]="item.route"
                        severity="primary"
                        [outlined]="true"
                        pRipple
                      ></p-button>
                    </div>
                  </div>
                </ng-template>
              </p-card>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="chart-container">
            <p-card header="Monthly Overview">
              <ng-template #content>
                <div *ngIf="chartLoading; else chartContent">
                  <p-skeleton height="300px"></p-skeleton>
                </div>
                <ng-template #chartContent>
                  <p-chart
                    type="line"
                    [data]="chartData"
                    [options]="chartOptions"
                    height="300px"
                  ></p-chart>
                </ng-template>
              </ng-template>
            </p-card>
          </div>

          <div class="activity-container">
            <p-card header="Recent Activity">
              <ng-template #content>
                <div class="activity-list">
                  <div
                    class="activity-item"
                    *ngFor="let activity of recentActivities"
                  >
                    <p-avatar
                      [icon]="activity.icon"
                      size="normal"
                      [style]="{ 'background-color': activity.color }"
                    ></p-avatar>
                    <div class="activity-content">
                      <div class="activity-text">{{ activity.text }}</div>
                      <div class="activity-time">{{ activity.time }}</div>
                    </div>
                  </div>
                </div>
              </ng-template>
            </p-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stat-card .p-card {
        height: 100%;
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }

      .stat-info {
        flex: 1;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 0.25rem;
      }

      .stat-label {
        color: #64748b;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
      }

      .stat-trend {
        font-size: 0.8rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .stat-trend.up {
        color: #059669;
      }

      .stat-trend.down {
        color: #dc2626;
      }

      .stat-trend.neutral {
        color: #64748b;
      }

      .stat-progress {
        margin-top: 0.75rem;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
      }

      .nav-section h3 {
        margin-bottom: 1rem;
        color: #1e293b;
        font-weight: 600;
      }

      .nav-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
      }

      .nav-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
      }

      .nav-card-content {
        padding: 0 1rem 1rem;
      }

      .nav-card-content h4 {
        margin: 0 0 0.5rem 0;
        font-weight: 600;
        color: #1e293b;
      }

      .nav-card-content p {
        color: #64748b;
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
      }

      .charts-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .chart-container,
      .activity-container {
        height: fit-content;
      }

      .activity-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid #f1f5f9;
      }

      .activity-item:last-child {
        border-bottom: none;
      }

      .activity-content {
        flex: 1;
      }

      .activity-text {
        font-size: 0.9rem;
        color: #334155;
        margin-bottom: 0.25rem;
      }

      .activity-time {
        font-size: 0.8rem;
        color: #94a3b8;
      }

      @media (max-width: 1024px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }

        .stats-grid {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .nav-cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  chartLoading = true;
  
  quickStats = [
    {
      label: 'Total Persons',
      value: 0,
      icon: 'pi pi-users',
      color: '#3B82F6',
      trend: 'up',
      change: '+12%',
      progress: 75,
      tooltip: 'Active personnel count',
      loading: true
    },
    {
      label: 'Active Events',
      value: 0,
      icon: 'pi pi-calendar',
      color: '#10B981',
      trend: 'up',
      change: '+8%',
      progress: 60,
      tooltip: 'Scheduled wine tastings and tours',
      loading: true
    },
    {
      label: 'Monthly Revenue',
      value: 0,
      icon: 'pi pi-dollar',
      color: '#F59E0B',
      trend: 'down',
      change: '-3%',
      progress: 40,
      tooltip: 'Revenue for current month',
      loading: true
    },
    {
      label: 'Pending Tasks',
      value: 0,
      icon: 'pi pi-clock',
      color: '#EF4444',
      trend: 'neutral',
      change: '0%',
      progress: 25,
      tooltip: 'Outstanding tasks requiring attention',
      loading: true
    }
  ];

  navigationItems = [
    {
      title: 'Personnel Management',
      description: 'Manage winery workers and staff',
      icon: 'pi pi-users',
      route: '/persons',
      actionLabel: 'Manage Persons',
      color: 'primary',
      badge: null
    },
    {
      title: 'Event Planning',
      description: 'Wine tastings and vineyard tours',
      icon: 'pi pi-calendar',
      route: '/events',
      actionLabel: 'View Events',
      color: 'success',
      badge: '5'
    },
    {
      title: 'Expense Categories',
      description: 'Organize and track expense types',
      icon: 'pi pi-tags',
      route: '/categories',
      actionLabel: 'Manage Categories',
      color: 'info',
      badge: null
    },
    {
      title: 'Entry Records',
      description: 'Track operations and expenses',
      icon: 'pi pi-list',
      route: '/entries',
      actionLabel: 'View Entries',
      color: 'warning',
      badge: '12'
    },
    {
      title: 'Reports & Analytics',
      description: 'Financial summaries and insights',
      icon: 'pi pi-chart-bar',
      route: '/reports',
      actionLabel: 'Generate Reports',
      color: 'secondary',
      badge: null
    }
  ];

  chartData: any;
  chartOptions: any;

  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
  ) {
    this.initializeChart();
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    
    this.loadDashboardData();
  }

  private initializeChart() {
    this.chartData = {
      labels: [],
      datasets: [
        {
          label: 'Amount Paid',
          data: [],
          fill: false,
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F6',
          tension: 0.4
        },
        {
          label: 'Amount Due',
          data: [],
          fill: false,
          borderColor: '#EF4444',
          backgroundColor: '#EF4444',
          tension: 0.4
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
  }

  private loadDashboardData() {
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const fromDate = firstDayOfMonth.toISOString().split('T')[0];
    const toDate = lastDayOfMonth.toISOString().split('T')[0];
    
    // Load each data source individually with better error handling
    this.loadPersonsCount();
    this.loadEventsCount();
    this.loadCategoriesCount();
    this.loadRecentEntries();
    this.loadMonthlyFinancials(fromDate, toDate);
  }

  private loadPersonsCount() {
    console.log('Loading persons count...');
    this.apiService.getPersons(0, 1).subscribe({
      next: (data) => {
        console.log('Persons data received:', data);
        this.quickStats[0].value = data.totalElements || 0;
        this.quickStats[0].loading = false;
      },
      error: (error) => {
        console.error('Failed to load persons count:', error);
        this.quickStats[0].value = 0;
        this.quickStats[0].loading = false;
      }
    });
  }

  private loadEventsCount() {
    this.apiService.getEvents(0, 1, 'visitDate,desc').subscribe({
      next: (data) => {
        this.quickStats[1].value = data.totalElements || 0;
        this.quickStats[1].loading = false;
      },
      error: (error) => {
        console.error('Failed to load events count:', error);
        this.quickStats[1].value = 0;
        this.quickStats[1].loading = false;
      }
    });
  }

  private loadCategoriesCount() {
    this.apiService.getCategories(0, 1).subscribe({
      next: (data) => {
        // Update navigation badge with actual count
        const categoriesNav = this.navigationItems.find(item => item.route === '/categories');
        if (categoriesNav) {
          categoriesNav.badge = (data.totalElements || 0).toString();
        }
      },
      error: (error) => {
        console.error('Failed to load categories count:', error);
      }
    });
  }

  private loadRecentEntries() {
    // Use a simpler approach - just get current month entries
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const fromDate = firstDayOfMonth.toISOString().split('T')[0];
    const toDate = lastDayOfMonth.toISOString().split('T')[0];
    
    const filters = { dateFrom: fromDate, dateTo: toDate };
    
    this.apiService.getEntries(0, 10, 'date,desc', filters).subscribe({
      next: (data) => {
        // Count this month's entries as "recent activity"
        const recentCount = data.content?.length || 0;
        this.quickStats[3].value = recentCount;
        this.quickStats[3].loading = false;

        // Update entries navigation badge
        const entriesNav = this.navigationItems.find(item => item.route === '/entries');
        if (entriesNav) {
          entriesNav.badge = (data.totalElements || 0).toString();
        }

        // Update recent activities with entry data
        this.updateRecentActivities([], data.content || []);
      },
      error: (error) => {
        console.error('Failed to load recent entries:', error);
        this.quickStats[3].value = 0;
        this.quickStats[3].loading = false;
      }
    });
  }

  private loadMonthlyFinancials(fromDate: string, toDate: string) {
    console.log('Loading monthly financials for date range:', fromDate, 'to', toDate);
    // Try to get monthly report, but use simpler approach if that fails
    this.apiService.getReportSummary(fromDate, toDate).subscribe({
      next: (report) => {
        console.log('Monthly report data received:', report);
        this.quickStats[2].value = Math.round(report.totalAmountPaid || 0);
        this.quickStats[2].loading = false;
        this.updateChartData(report);
        this.chartLoading = false;
      },
      error: (error) => {
        console.error('Failed to load monthly report, trying entries approach:', error);
        // Fallback: calculate from entries
        this.loadEntriesForFinancials(fromDate, toDate);
      }
    });
  }

  private loadEntriesForFinancials(fromDate: string, toDate: string) {
    const filters = { dateFrom: fromDate, dateTo: toDate };
    this.apiService.getEntries(0, 100, 'date,desc', filters).subscribe({
      next: (data) => {
        const totalPaid = data.content?.reduce((sum: number, entry: any) => 
          sum + (entry.amountPaid || 0), 0) || 0;
        
        this.quickStats[2].value = Math.round(totalPaid);
        this.quickStats[2].loading = false;
        
        // Simple chart data from entries
        this.updateSimpleChartData(data.content || []);
        this.chartLoading = false;
      },
      error: (error) => {
        console.error('Failed to load entries for financials:', error);
        this.quickStats[2].value = 0;
        this.quickStats[2].loading = false;
        this.chartLoading = false;
      }
    });
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

  private updateRecentActivities(auditData: any[], entryData: any[]) {
    this.recentActivities = [];
    
    // Add recent audit activities
    auditData.slice(0, 2).forEach(audit => {
      const timeAgo = this.getTimeAgo(audit.changedAt);
      let activityText = '';
      let icon = 'pi pi-info-circle';
      let color = '#3B82F6';
      
      switch (audit.action) {
        case 'INSERT':
          activityText = `New ${audit.tableName.toLowerCase()} created`;
          icon = 'pi pi-plus-circle';
          color = '#10B981';
          break;
        case 'UPDATE':
          activityText = `${audit.tableName.toLowerCase()} updated`;
          icon = 'pi pi-pencil';
          color = '#F59E0B';
          break;
        case 'DELETE':
          activityText = `${audit.tableName.toLowerCase()} deleted`;
          icon = 'pi pi-trash';
          color = '#EF4444';
          break;
      }
      
      this.recentActivities.push({
        text: activityText,
        time: timeAgo,
        icon: icon,
        color: color
      });
    });
    
    // Add recent entries as activities
    entryData.slice(0, 3).forEach(entry => {
      const timeAgo = this.getTimeAgo(entry.date);
      this.recentActivities.push({
        text: `Work entry: ${entry.description.substring(0, 50)}...`,
        time: timeAgo,
        icon: 'pi pi-list',
        color: '#8B5CF6'
      });
    });
  }
  
  private updateChartData(reportData: any) {
    // For now, show current month data as a single point
    // In a full implementation, you'd fetch data for multiple months
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
    
    this.chartData = {
      labels: [currentMonth],
      datasets: [
        {
          label: 'Amount Paid',
          data: [reportData.totalAmountPaid || 0],
          fill: false,
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F6',
          tension: 0.4
        },
        {
          label: 'Amount Due',
          data: [reportData.totalAmountDue || 0],
          fill: false,
          borderColor: '#EF4444',
          backgroundColor: '#EF4444',
          tension: 0.4
        }
      ]
    };

    console.log('Chart data updated:', this.chartData);
  }
  
  private getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Less than an hour ago';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  }


  private updateSimpleChartData(entries: any[]) {
    // Simple chart from entries data
    if (entries && entries.length > 0 && this.chartData) {
      const totalPaid = entries.reduce((sum, entry) => sum + (entry.amountPaid || 0), 0);
      const totalDue = entries.reduce((sum, entry) => sum + (entry.amountDue || 0), 0);
      
      this.chartData.labels = ['Current Month'];
      this.chartData.datasets[0].data = [totalPaid];
      this.chartData.datasets[1].data = [totalDue];
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
