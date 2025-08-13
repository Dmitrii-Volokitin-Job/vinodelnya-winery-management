import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from "@angular/forms";

import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputNumberModule } from "primeng/inputnumber";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { MultiSelectModule } from "primeng/multiselect";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { MessageService, ConfirmationService } from "primeng/api";

import { Entry, Person, Category, PageResponse } from "../models/entry.model";
import { ApiService } from "../services/api.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-entries",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    MultiSelectModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="main-container">
      <div class="card">
        <div class="header">
          <h2>Entries Management</h2>
          <p-button
            *ngIf="isAdmin"
            label="Add Entry"
            icon="pi pi-plus"
            data-testid="add-entry-button"
            (onClick)="showAddDialog()"
          >
          </p-button>
        </div>

        <div class="filters-panel">
          <div class="grid">
            <div class="col-12 md:col-3">
              <label for="dateFrom">From Date</label>
              <p-calendar
                id="dateFrom"
                [(ngModel)]="filters.dateFrom"
                (onSelect)="applyFilters()"
                dateFormat="yy-mm-dd"
                placeholder="Select from date"
                data-testid="from-date"
                class="w-full"
              >
              </p-calendar>
            </div>

            <div class="col-12 md:col-3">
              <label for="dateTo">To Date</label>
              <p-calendar
                id="dateTo"
                [(ngModel)]="filters.dateTo"
                (onSelect)="applyFilters()"
                dateFormat="yy-mm-dd"
                placeholder="Select to date"
                data-testid="to-date"
                class="w-full"
              >
              </p-calendar>
            </div>

            <div class="col-12 md:col-3">
              <label for="personsFilter">Persons</label>
              <p-multiSelect
                id="personsFilter"
                [(ngModel)]="filters.personIds"
                [options]="personOptions"
                optionLabel="name"
                optionValue="id"
                placeholder="Select persons"
                (onChange)="applyFilters()"
                class="w-full"
              >
              </p-multiSelect>
            </div>

            <div class="col-12 md:col-3">
              <label for="categoriesFilter">Categories</label>
              <p-multiSelect
                id="categoriesFilter"
                [(ngModel)]="filters.categoryIds"
                [options]="categoryOptions"
                optionLabel="name"
                optionValue="id"
                placeholder="Select categories"
                (onChange)="applyFilters()"
                class="w-full"
              >
              </p-multiSelect>
            </div>
          </div>

          <div class="filter-actions">
            <p-button
              label="Clear Filters"
              severity="secondary"
              (onClick)="clearFilters()"
            ></p-button>
            <p-button
              label="Apply Filters"
              data-testid="apply-filters-button"
              (onClick)="applyFilters()"
            ></p-button>
          </div>
        </div>

        <p-table
          *ngIf="isAuthenticated"
          [value]="entries"
          [lazy]="true"
          [paginator]="true"
          [rows]="pageSize"
          [rowsPerPageOptions]="[15, 30, 45]"
          [totalRecords]="totalElements"
          [loading]="loading"
          data-testid="entries-table"
          (onLazyLoad)="loadEntries($event)"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="date">
                Date <p-sortIcon field="date"></p-sortIcon>
              </th>
              <th>Description</th>
              <th>Person</th>
              <th>Category</th>
              <th pSortableColumn="workHours">
                Hours <p-sortIcon field="workHours"></p-sortIcon>
              </th>
              <th pSortableColumn="amountPaid">
                Paid <p-sortIcon field="amountPaid"></p-sortIcon>
              </th>
              <th pSortableColumn="amountDue">
                Due <p-sortIcon field="amountDue"></p-sortIcon>
              </th>
              <th *ngIf="isAdmin">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-entry>
            <tr>
              <td>{{ entry.date | date: "shortDate" }}</td>
              <td>{{ entry.description }}</td>
              <td>{{ entry.personName }}</td>
              <td>{{ entry.categoryName }}</td>
              <td>{{ entry.workHours || "-" }}</td>
              <td>
                {{ entry.amountPaid | currency: "EUR" : "symbol" : "1.2-2" }}
              </td>
              <td>
                {{ entry.amountDue | currency: "EUR" : "symbol" : "1.2-2" }}
              </td>
              <td *ngIf="isAdmin">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  (onClick)="editEntry(entry)"
                >
                </p-button>
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  (onClick)="deleteEntry(entry)"
                >
                </p-button>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="footer">
            <tr *ngIf="pageTotal">
              <td colspan="4"><strong>Page Total:</strong></td>
              <td>
                <strong>{{ pageTotal.workHours || 0 }}</strong>
              </td>
              <td>
                <strong>{{
                  pageTotal.amountPaid | currency: "EUR" : "symbol" : "1.2-2"
                }}</strong>
              </td>
              <td>
                <strong>{{
                  pageTotal.amountDue | currency: "EUR" : "symbol" : "1.2-2"
                }}</strong>
              </td>
              <td *ngIf="isAdmin"></td>
            </tr>
            <tr *ngIf="grandTotal">
              <td colspan="4"><strong>Grand Total:</strong></td>
              <td>
                <strong>{{ grandTotal.workHours || 0 }}</strong>
              </td>
              <td>
                <strong>{{
                  grandTotal.amountPaid | currency: "EUR" : "symbol" : "1.2-2"
                }}</strong>
              </td>
              <td>
                <strong>{{
                  grandTotal.amountDue | currency: "EUR" : "symbol" : "1.2-2"
                }}</strong>
              </td>
              <td *ngIf="isAdmin"></td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [header]="editMode ? 'Edit Entry' : 'Add Entry'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '600px' }"
      data-testid="entry-dialog"
    >
      <form [formGroup]="entryForm" (ngSubmit)="saveEntry()">
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="date">Date *</label>
              <p-calendar
                id="date"
                formControlName="date"
                dateFormat="yy-mm-dd"
                class="w-full"
              ></p-calendar>
            </div>
          </div>

          <div class="col-12">
            <div class="field">
              <label for="description">Description *</label>
              <textarea
                id="description"
                pInputTextarea
                formControlName="description"
                rows="2"
                data-testid="entry-description"
                class="w-full"
              ></textarea>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="person">Person *</label>
              <p-dropdown
                id="person"
                formControlName="personId"
                [options]="personOptions"
                optionLabel="name"
                optionValue="id"
                placeholder="Select person"
                class="w-full"
              >
              </p-dropdown>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label for="category">Category *</label>
              <p-dropdown
                id="category"
                formControlName="categoryId"
                [options]="categoryOptions"
                optionLabel="name"
                optionValue="id"
                placeholder="Select category"
                class="w-full"
              >
              </p-dropdown>
            </div>
          </div>

          <div class="col-12 md:col-4">
            <div class="field">
              <label for="workHours">Work Hours</label>
              <p-inputNumber
                id="workHours"
                formControlName="workHours"
                [min]="0"
                [step]="0.5"
                class="w-full"
              >
              </p-inputNumber>
            </div>
          </div>

          <div class="col-12 md:col-4">
            <div class="field">
              <label for="amountPaid">Amount Paid</label>
              <p-inputNumber
                id="amountPaid"
                formControlName="amountPaid"
                mode="currency"
                currency="EUR"
                [min]="0"
                data-testid="entry-amount-paid"
                class="w-full"
              >
              </p-inputNumber>
            </div>
          </div>

          <div class="col-12 md:col-4">
            <div class="field">
              <label for="amountDue">Amount Due</label>
              <p-inputNumber
                id="amountDue"
                formControlName="amountDue"
                mode="currency"
                currency="EUR"
                [min]="0"
                class="w-full"
              >
              </p-inputNumber>
            </div>
          </div>
        </div>

        <div class="dialog-buttons">
          <p-button
            label="Cancel"
            severity="secondary"
            (onClick)="hideDialog()"
          ></p-button>
          <p-button
            label="Save"
            type="submit"
            [disabled]="entryForm.invalid"
            [loading]="saving"
            data-testid="save-entry-button"
          >
          </p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [
    `
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .field {
        margin-bottom: 1rem;
      }

      .field label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 1rem;
      }

      .col-12 {
        grid-column: span 12;
      }
      .col-6 {
        grid-column: span 6;
      }
      .col-4 {
        grid-column: span 4;
      }

      @media (max-width: 768px) {
        .col-6,
        .col-4 {
          grid-column: span 12;
        }
      }

      .dialog-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;
      }

      .filters-panel {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1rem;
      }

      .filter-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;
      }

      .w-full {
        width: 100%;
      }
    `,
  ],
})
export class EntriesComponent implements OnInit {
  entries: Entry[] = [];
  personOptions: Person[] = [];
  categoryOptions: Category[] = [];
  totalElements = 0;
  pageSize = 15;
  loading = false;
  saving = false;
  showDialog = false;
  editMode = false;
  pageTotal: any;
  grandTotal: any;
  filters: any = {
    dateFrom: null,
    dateTo: null,
    personIds: [],
    categoryIds: [],
  };

  entryForm: FormGroup;
  selectedEntry: Entry | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.entryForm = this.fb.group({
      date: [new Date(), Validators.required],
      description: ["", Validators.required],
      personId: [null, Validators.required],
      categoryId: [null, Validators.required],
      workHours: [0],
      amountPaid: [0],
      amountDue: [0],
    });
  }

  ngOnInit() {
    // Only load data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.initializeCurrentMonthFilters();
      this.loadEntries();
      this.loadDropdownData();
    }
  }

  private initializeCurrentMonthFilters() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.filters.dateFrom = firstDayOfMonth;
    this.filters.dateTo = lastDayOfMonth;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadEntries(event?: any) {
    this.loading = true;
    const page = event ? event.first / event.rows : 0;
    const sort = event?.sortField
      ? `${event.sortField},${event.sortOrder === 1 ? "asc" : "desc"}`
      : "date,desc";

    const apiFilters = this.buildApiFilters();

    this.apiService
      .getEntries(page, this.pageSize, sort, apiFilters)
      .subscribe({
        next: (response) => {
          this.entries = response.content;
          this.totalElements = response.totalElements;
          this.pageTotal = response.pageTotal;
          this.grandTotal = response.grandTotal;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load entries",
          });
          this.loading = false;
        },
      });
  }

  loadDropdownData() {
    this.apiService.getPersons(0, 100).subscribe((response) => {
      this.personOptions = response.content;
    });

    this.apiService.getCategories(0, 100).subscribe((response) => {
      this.categoryOptions = response.content;
    });
  }

  showAddDialog() {
    this.editMode = false;
    this.selectedEntry = null;
    this.entryForm.reset({
      date: new Date(),
      workHours: 0,
      amountPaid: 0,
      amountDue: 0,
    });
    this.showDialog = true;
  }

  editEntry(entry: Entry) {
    this.editMode = true;
    this.selectedEntry = entry;
    this.entryForm.patchValue({
      ...entry,
      date: new Date(entry.date),
    });
    this.showDialog = true;
  }

  saveEntry() {
    if (this.entryForm.valid) {
      this.saving = true;
      const entryData = {
        ...this.entryForm.value,
        date: this.entryForm.value.date.toISOString().split("T")[0],
      };

      const request =
        this.editMode && this.selectedEntry
          ? this.apiService.updateEntry(this.selectedEntry.id!, entryData)
          : this.apiService.createEntry(entryData);

      request.subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: `Entry ${this.editMode ? "updated" : "created"} successfully`,
          });
          this.hideDialog();
          this.loadEntries();
          this.saving = false;
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to save entry",
          });
          this.saving = false;
        },
      });
    }
  }

  deleteEntry(entry: Entry) {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this entry?",
      accept: () => {
        this.apiService.deleteEntry(entry.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Entry deleted successfully",
            });
            this.loadEntries();
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete entry",
            });
          },
        });
      },
    });
  }

  hideDialog() {
    this.showDialog = false;
    this.entryForm.reset();
  }

  applyFilters() {
    this.loadEntries();
  }

  clearFilters() {
    this.filters = {
      dateFrom: null,
      dateTo: null,
      personIds: [],
      categoryIds: [],
    };
    this.loadEntries();
  }

  buildApiFilters(): any {
    const apiFilters: any = {};

    if (this.filters.dateFrom) {
      apiFilters.dateFrom = this.filters.dateFrom.toISOString().split("T")[0];
    }
    if (this.filters.dateTo) {
      apiFilters.dateTo = this.filters.dateTo.toISOString().split("T")[0];
    }
    if (this.filters.personIds && this.filters.personIds.length > 0) {
      apiFilters["person.in"] = this.filters.personIds.join(",");
    }
    if (this.filters.categoryIds && this.filters.categoryIds.length > 0) {
      apiFilters["category.in"] = this.filters.categoryIds.join(",");
    }

    return apiFilters;
  }
}
