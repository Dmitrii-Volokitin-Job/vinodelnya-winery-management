import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";

import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputNumberModule } from "primeng/inputnumber";
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from "primeng/checkbox";
import { TabViewModule } from "primeng/tabview";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { MessageService, ConfirmationService } from "primeng/api";

import { Event, PageResponse } from "../models/entry.model";
import { ApiService } from "../services/api.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-events",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    CalendarModule,
    CheckboxModule,
    TabViewModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="main-container">
      <div class="card">
        <div class="header">
          <h2>Events Management</h2>
          <p-button
            *ngIf="isAdmin"
            label="Add Event"
            icon="pi pi-plus"
            data-testid="add-event-button"
            (onClick)="showAddDialog()"
          >
          </p-button>
        </div>

        <p-table
          *ngIf="isAuthenticated"
          [value]="events"
          [lazy]="true"
          [paginator]="true"
          [rows]="pageSize"
          [rowsPerPageOptions]="[15, 30, 45]"
          [totalRecords]="totalElements"
          [loading]="loading"
          data-testid="events-table"
          (onLazyLoad)="loadEvents($event)"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="visitDate">
                Visit Date <p-sortIcon field="visitDate"></p-sortIcon>
              </th>
              <th pSortableColumn="visitTime">
                Time <p-sortIcon field="visitTime"></p-sortIcon>
              </th>
              <th pSortableColumn="company">
                Company <p-sortIcon field="company"></p-sortIcon>
              </th>
              <th>Contact</th>
              <th>Lunch Guests</th>
              <th>Tasting Guests</th>
              <th pSortableColumn="grandTotal">
                Grand Total <p-sortIcon field="grandTotal"></p-sortIcon>
              </th>
              <th>Status</th>
              <th *ngIf="isAdmin">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-event>
            <tr>
              <td>{{ event.visitDate | date: "shortDate" }}</td>
              <td>{{ event.visitTime }}</td>
              <td>{{ event.company || "-" }}</td>
              <td>{{ event.contactName }}</td>
              <td>{{ event.adultLunchGuests + event.childrenGuests }}</td>
              <td>{{ event.adultTastingGuests }}</td>
              <td>
                {{ event.grandTotal | currency: "EUR" : "symbol" : "1.2-2" }}
              </td>
              <td>
                <span
                  class="status-badge"
                  [class.masterclass]="event.masterclass"
                >
                  {{ event.masterclass ? "Masterclass" : "Standard" }}
                </span>
                <span
                  class="status-badge"
                  [class.invoiced]="event.invoiceIssued"
                >
                  {{ event.invoiceIssued ? "Invoiced" : "Pending" }}
                </span>
              </td>
              <td *ngIf="isAdmin">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  data-testid="edit-event-button"
                  (onClick)="editEvent(event)"
                >
                </p-button>
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  (onClick)="deleteEvent(event)"
                >
                </p-button>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="footer">
            <tr *ngIf="grandTotal">
              <td colspan="6"><strong>Grand Total:</strong></td>
              <td data-testid="event-grand-total">
                <strong>{{
                  grandTotal.grandTotal | currency: "EUR" : "symbol" : "1.2-2"
                }}</strong>
              </td>
              <td></td>
              <td *ngIf="isAdmin"></td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [header]="editMode ? 'Edit Event' : 'Add Event'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '800px', height: '600px' }"
      [maximizable]="true"
      data-testid="event-dialog"
    >
      <form [formGroup]="eventForm" (ngSubmit)="saveEvent()">
        <p-tabView>
          <p-tabPanel header="General Info">
            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="field">
                  <label for="visitDate">Visit Date *</label>
                  <p-calendar
                    id="visitDate"
                    formControlName="visitDate"
                    dateFormat="yy-mm-dd"
                    class="w-full"
                  ></p-calendar>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label for="visitTime">Visit Time *</label>
                  <p-calendar
                    id="visitTime"
                    formControlName="visitTime"
                    [timeOnly]="true"
                    hourFormat="24"
                    class="w-full"
                  >
                  </p-calendar>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label for="company">Company</label>
                  <input
                    id="company"
                    type="text"
                    pInputText
                    formControlName="company"
                    data-testid="event-company"
                    class="w-full"
                  />
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label for="contactName">Contact Name *</label>
                  <input
                    id="contactName"
                    type="text"
                    pInputText
                    formControlName="contactName"
                    data-testid="event-contact-name"
                    class="w-full"
                  />
                </div>
              </div>

              <div class="col-12">
                <div class="field">
                  <label for="contactPhone">Contact Phone</label>
                  <input
                    id="contactPhone"
                    type="text"
                    pInputText
                    formControlName="contactPhone"
                    data-testid="event-contact-phone"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </p-tabPanel>

          <p-tabPanel header="Guests & Pricing">
            <div class="grid">
              <div class="col-12 md:col-3">
                <div class="field">
                  <label for="adultLunchGuests">Adult Lunch Guests</label>
                  <p-inputNumber
                    id="adultLunchGuests"
                    formControlName="adultLunchGuests"
                    [min]="0"
                    data-testid="event-adult-lunch"
                    class="w-full"
                  ></p-inputNumber>
                </div>
              </div>

              <div class="col-12 md:col-3">
                <div class="field">
                  <label for="adultTastingGuests">Adult Tasting Guests</label>
                  <p-inputNumber
                    id="adultTastingGuests"
                    formControlName="adultTastingGuests"
                    [min]="0"
                    data-testid="event-adult-tasting"
                    class="w-full"
                  ></p-inputNumber>
                </div>
              </div>

              <div class="col-12 md:col-3">
                <div class="field">
                  <label for="childrenGuests">Children Guests</label>
                  <p-inputNumber
                    id="childrenGuests"
                    formControlName="childrenGuests"
                    [min]="0"
                    class="w-full"
                  ></p-inputNumber>
                </div>
              </div>

              <div class="col-12 md:col-3">
                <div class="field">
                  <label for="extraGuests">Extra Guests</label>
                  <p-inputNumber
                    id="extraGuests"
                    formControlName="extraGuests"
                    [min]="0"
                    class="w-full"
                  ></p-inputNumber>
                </div>
              </div>

              <div class="col-12">
                <div class="field">
                  <p-checkbox
                    formControlName="masterclass"
                    [binary]="true"
                    label="Masterclass Event"
                  ></p-checkbox>
                </div>
              </div>

              <div class="col-12">
                <div class="field">
                  <p-checkbox
                    formControlName="specialPriceEnabled"
                    [binary]="true"
                    label="Special Pricing"
                  ></p-checkbox>
                </div>
              </div>
            </div>
          </p-tabPanel>

          <p-tabPanel header="Pricing Details">
            <div class="grid">
              <div class="col-12 md:col-4">
                <div class="field">
                  <label for="lunchRate">Lunch Rate (per person)</label>
                  <p-inputNumber
                    id="lunchRate"
                    formControlName="lunchRate"
                    mode="currency"
                    currency="EUR"
                    [min]="0"
                    class="w-full"
                  ></p-inputNumber>
                </div>
              </div>

              <div class="col-12 md:col-4">
                <div class="field">
                  <label for="tastingRate">Tasting Rate (per person)</label>
                  <p-inputNumber
                    id="tastingRate"
                    formControlName="tastingRate"
                    mode="currency"
                    currency="EUR"
                    [min]="0"
                    class="w-full"
                  ></p-inputNumber>
                </div>
              </div>

              <div class="col-12 md:col-4">
                <div class="field">
                  <label for="addedWinesValue">Added Wines Value</label>
                  <p-inputNumber
                    id="addedWinesValue"
                    formControlName="addedWinesValue"
                    mode="currency"
                    currency="EUR"
                    [min]="0"
                    class="w-full"
                  ></p-inputNumber>
                </div>
              </div>

              <div class="col-12">
                <div class="field">
                  <label for="extraChargeComment">Extra Charge Comment</label>
                  <textarea
                    id="extraChargeComment"
                    pInputTextarea
                    formControlName="extraChargeComment"
                    rows="2"
                    class="w-full"
                  ></textarea>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <label for="extraChargeAmount">Extra Charge Amount</label>
                  <p-inputNumber
                    id="extraChargeAmount"
                    formControlName="extraChargeAmount"
                    mode="currency"
                    currency="EUR"
                    [min]="0"
                    class="w-full"
                  ></p-inputNumber>
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="field">
                  <p-checkbox
                    formControlName="invoiceIssued"
                    [binary]="true"
                    label="Invoice Issued"
                  ></p-checkbox>
                </div>
              </div>
            </div>
          </p-tabPanel>
        </p-tabView>

        <div class="dialog-buttons">
          <p-button
            label="Cancel"
            severity="secondary"
            (onClick)="hideDialog()"
          ></p-button>
          <p-button
            label="Save"
            type="submit"
            [disabled]="eventForm.invalid"
            [loading]="saving"
            data-testid="save-event-button"
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
      .col-3 {
        grid-column: span 3;
      }

      @media (max-width: 768px) {
        .col-6,
        .col-4,
        .col-3 {
          grid-column: span 12;
        }
      }

      .status-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        margin-right: 0.25rem;
        background: #e9ecef;
        color: #495057;
      }

      .status-badge.masterclass {
        background: #d4edda;
        color: #155724;
      }

      .status-badge.invoiced {
        background: #cce5ff;
        color: #004085;
      }

      .dialog-buttons {
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
export class EventsComponent implements OnInit {
  events: Event[] = [];
  totalElements = 0;
  pageSize = 15;
  loading = false;
  saving = false;
  showDialog = false;
  editMode = false;
  pageTotal: any;
  grandTotal: any;

  eventForm: FormGroup;
  selectedEvent: Event | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.eventForm = this.fb.group({
      visitDate: [new Date(), Validators.required],
      visitTime: [new Date(), Validators.required],
      company: [""],
      contactName: ["", Validators.required],
      contactPhone: [""],
      adultLunchGuests: [0],
      adultTastingGuests: [0],
      childrenGuests: [0],
      extraGuests: [0],
      masterclass: [false],
      specialPriceEnabled: [false],
      lunchRate: [25],
      tastingRate: [15],
      addedWinesValue: [0],
      extraChargeComment: [""],
      extraChargeAmount: [0],
      invoiceIssued: [false],
    });
  }

  ngOnInit() {
    // Only load data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadEvents();
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadEvents(event?: any) {
    this.loading = true;
    const page = event ? event.first / event.rows : 0;
    const sort = event?.sortField
      ? `${event.sortField},${event.sortOrder === 1 ? "asc" : "desc"}`
      : "visitDate,desc";

    this.apiService.getEvents(page, this.pageSize, sort).subscribe({
      next: (response) => {
        this.events = response.content;
        this.totalElements = response.totalElements;
        this.pageTotal = response.pageTotal;
        this.grandTotal = response.grandTotal;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load events",
        });
        this.loading = false;
      },
    });
  }

  showAddDialog() {
    this.editMode = false;
    this.selectedEvent = null;
    this.eventForm.reset({
      visitDate: new Date(),
      visitTime: new Date(),
      adultLunchGuests: 0,
      adultTastingGuests: 0,
      childrenGuests: 0,
      extraGuests: 0,
      masterclass: false,
      specialPriceEnabled: false,
      lunchRate: 25,
      tastingRate: 15,
      addedWinesValue: 0,
      extraChargeAmount: 0,
      invoiceIssued: false,
    });
    this.showDialog = true;
  }

  editEvent(event: Event) {
    this.editMode = true;
    this.selectedEvent = event;
    this.eventForm.patchValue({
      ...event,
      visitDate: new Date(event.visitDate),
      visitTime: new Date(`2000-01-01T${event.visitTime}`),
    });
    this.showDialog = true;
  }

  saveEvent() {
    if (this.eventForm.valid) {
      this.saving = true;
      const eventData = {
        ...this.eventForm.value,
        visitDate: this.eventForm.value.visitDate.toISOString().split("T")[0],
        visitTime: this.eventForm.value.visitTime
          .toTimeString()
          .split(" ")[0]
          .substring(0, 5),
      };

      const request =
        this.editMode && this.selectedEvent
          ? this.apiService.updateEvent(this.selectedEvent.id!, eventData)
          : this.apiService.createEvent(eventData);

      request.subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: `Event ${this.editMode ? "updated" : "created"} successfully`,
          });
          this.hideDialog();
          this.loadEvents();
          this.saving = false;
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to save event",
          });
          this.saving = false;
        },
      });
    }
  }

  deleteEvent(event: Event) {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this event?",
      accept: () => {
        this.apiService.deleteEvent(event.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Event deleted successfully",
            });
            this.loadEvents();
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete event",
            });
          },
        });
      },
    });
  }

  hideDialog() {
    this.showDialog = false;
    this.eventForm.reset();
  }
}
