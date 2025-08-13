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
import { CheckboxModule } from "primeng/checkbox";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DropdownModule } from "primeng/dropdown";
import { TagModule } from "primeng/tag";
import { CalendarModule } from "primeng/calendar";
import { TooltipModule } from "primeng/tooltip";
import { MessageService, ConfirmationService } from "primeng/api";

import { Person, PageResponse } from "../models/entry.model";
import { ApiService } from "../services/api.service";
import { AuthService } from "../services/auth.service";
import { HelpModalComponent } from "./help-modal.component";

@Component({
  selector: "app-persons",
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
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    DropdownModule,
    TagModule,
    CalendarModule,
    TooltipModule,
    HelpModalComponent,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="main-container">
      <div class="card">
        <div class="header">
          <h2>Persons Management</h2>
          <p-button
            *ngIf="isAdmin"
            label="Add Person"
            icon="pi pi-plus"
            data-testid="add-person-button"
            (onClick)="showAddDialog()"
          >
          </p-button>
        </div>

        <p-table 
          [value]="persons" 
          [loading]="loading" 
          dataKey="id"
          [paginator]="true"
          [rows]="pageSize"
          [totalRecords]="totalElements"
          [showCurrentPageReport]="true"
          [rowsPerPageOptions]="[15, 30, 45]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          [lazy]="true"
          (onLazyLoad)="loadPersons($event)"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Note</th>
              <th>Status</th>
              <th>Created Date</th>
              <th *ngIf="isAdmin">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-person>
            <tr>
              <td>{{ person.name }}</td>
              <td>{{ person.note || "-" }}</td>
              <td>
                <p-tag
                  [value]="person.active ? 'Active' : 'Inactive'"
                  [severity]="getStatusSeverity(person.active)"
                />
              </td>
              <td>{{ person.createdAt | date: "MM/dd/yyyy" }}</td>
              <td *ngIf="isAdmin">
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-pencil"
                    [text]="true"
                    severity="info"
                    pTooltip="Edit"
                    (onClick)="editPerson(person)"
                  >
                  </p-button>
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [text]="true"
                    pTooltip="Delete"
                    (onClick)="deletePerson(person)"
                  >
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [header]="editMode ? 'Edit Person' : 'Add Person'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      data-testid="person-dialog"
    >
      <form [formGroup]="personForm" (ngSubmit)="savePerson()">
        <div class="field">
          <label for="name">Name *</label>
          <input
            id="name"
            type="text"
            pInputText
            formControlName="name"
            data-testid="person-name"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="note">Note</label>
          <textarea
            id="note"
            pInputTextarea
            formControlName="note"
            rows="3"
            data-testid="person-note"
            class="w-full"
          ></textarea>
        </div>

        <div class="field">
          <p-checkbox
            formControlName="active"
            [binary]="true"
            label="Active"
          ></p-checkbox>
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
            [disabled]="personForm.invalid"
            [loading]="saving"
            data-testid="save-person-button"
          >
          </p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog data-testid="confirm-delete-button"></p-confirmDialog>
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

      .dialog-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;
      }

      .w-full {
        width: 100%;
      }

      .search-container {
        margin-left: auto;
      }

      .ml-auto {
        margin-left: auto;
      }
    `,
  ],
})
export class PersonsComponent implements OnInit {
  persons: Person[] = [];
  totalElements = 0;
  pageSize = 15;
  currentPage = 0;
  loading = false;
  saving = false;
  showDialog = false;
  editMode = false;

  personForm: FormGroup;
  selectedPerson: Person | null = null;

  statusOptions = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.personForm = this.fb.group({
      name: ["", Validators.required],
      note: [""],
      active: [true],
    });
  }

  ngOnInit() {
    // Only load data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadPersons();
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  clear(table: any) {
    table.clear();
  }

  getStatusSeverity(active: boolean): 'success' | 'danger' {
    return active ? 'success' : 'danger';
  }

  loadPersons(event?: any) {
    this.loading = true;
    
    // Handle pagination from PrimeNG lazy loading event
    let page = 0;
    let size = this.pageSize;
    
    if (event) {
      page = event.first / event.rows;
      size = event.rows;
      this.pageSize = size; // Update pageSize when user changes it
      this.currentPage = page;
    }
    
    const sort = event?.sortField
      ? `${event.sortField},${event.sortOrder === 1 ? "asc" : "desc"}`
      : "id,asc";

    console.log(`🔄 Loading persons - Page: ${page}, Size: ${size}, Sort: ${sort}`);

    this.apiService.getPersons(page, size, sort).subscribe({
      next: (response) => {
        console.log('✅ Persons loaded successfully:', response);
        console.log('📊 Data assignment - persons.length:', response.content?.length);
        this.persons = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
        console.log('🎯 Component persons array length:', this.persons?.length);
        console.log('🏷️ Component loading state:', this.loading);
      },
      error: (error) => {
        console.error('❌ Failed to load persons:', error);
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load persons",
        });
        this.loading = false;
      },
    });
  }

  showAddDialog() {
    this.editMode = false;
    this.selectedPerson = null;
    this.personForm.reset({ active: true });
    this.showDialog = true;
  }

  editPerson(person: Person) {
    this.editMode = true;
    this.selectedPerson = person;
    this.personForm.patchValue(person);
    this.showDialog = true;
  }

  savePerson() {
    if (this.personForm.valid) {
      this.saving = true;
      const personData = this.personForm.value;

      const request =
        this.editMode && this.selectedPerson
          ? this.apiService.updatePerson(this.selectedPerson.id!, personData)
          : this.apiService.createPerson(personData);

      request.subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: `Person ${this.editMode ? "updated" : "created"} successfully`,
          });
          this.hideDialog();
          this.loadPersons();
          this.saving = false;
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to save person",
          });
          this.saving = false;
        },
      });
    }
  }

  deletePerson(person: Person) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${person.name}?`,
      accept: () => {
        this.apiService.deletePerson(person.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Person deleted successfully",
            });
            this.loadPersons();
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete person",
            });
          },
        });
      },
    });
  }

  hideDialog() {
    this.showDialog = false;
    this.personForm.reset();
  }
}
