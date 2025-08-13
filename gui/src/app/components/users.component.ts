import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";

import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TagModule } from "primeng/tag";
import { PasswordModule } from "primeng/password";
import { TooltipModule } from "primeng/tooltip";

import { MessageService, ConfirmationService } from "primeng/api";
import { ApiService } from "../services/api.service";
import { I18nService } from "../services/i18n.service";

interface User {
  id?: number;
  username: string;
  password?: string;
  role: "ADMIN" | "USER";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: "app-users",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    PasswordModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <div class="card-header">
        <div class="flex justify-content-between align-items-center">
          <h2>{{ i18n.translate("USERS.TITLE") }}</h2>
          <p-button
            [label]="i18n.translate('ACTIONS.ADD')"
            icon="pi pi-plus"
            (onClick)="showAddDialog()"
            data-testid="add-user-button"
            styleClass="p-button-primary"
          >
          </p-button>
        </div>
      </div>

      <p-table
        [value]="users"
        [loading]="loading"
        [paginator]="true"
        [rows]="15"
        [rowsPerPageOptions]="[15, 30, 45]"
        [totalRecords]="totalRecords"
        [lazy]="true"
        (onLazyLoad)="loadUsers($event)"
        dataKey="id"
        data-testid="users-table"
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="header">
          <tr>
            <th [pSortableColumn]="'id'">
              {{ i18n.translate("COMMON.ID") }}
              <p-sortIcon field="id"></p-sortIcon>
            </th>
            <th [pSortableColumn]="'username'">
              {{ i18n.translate("USERS.USERNAME") }}
              <p-sortIcon field="username"></p-sortIcon>
            </th>
            <th [pSortableColumn]="'role'">
              {{ i18n.translate("USERS.ROLE") }}
              <p-sortIcon field="role"></p-sortIcon>
            </th>
            <th [pSortableColumn]="'active'">
              {{ i18n.translate("USERS.STATUS") }}
              <p-sortIcon field="active"></p-sortIcon>
            </th>
            <th [pSortableColumn]="'createdAt'">
              {{ i18n.translate("COMMON.CREATED_AT") }}
              <p-sortIcon field="createdAt"></p-sortIcon>
            </th>
            <th>{{ i18n.translate("COMMON.ACTIONS") }}</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>
              <p-tag
                [value]="i18n.translate('USERS.ROLE_' + user.role)"
                [severity]="user.role === 'ADMIN' ? 'success' : 'info'"
              >
              </p-tag>
            </td>
            <td>
              <p-tag
                [value]="
                  i18n.translate(
                    user.active ? 'COMMON.ACTIVE' : 'COMMON.INACTIVE'
                  )
                "
                [severity]="user.active ? 'success' : 'warning'"
              >
              </p-tag>
            </td>
            <td>{{ user.createdAt | date: "short" }}</td>
            <td>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-pencil"
                  size="small"
                  [pTooltip]="i18n.translate('ACTIONS.EDIT')"
                  data-testid="edit-user-button"
                  (onClick)="showEditDialog(user)"
                >
                </p-button>

                <p-button
                  *ngIf="user.active"
                  icon="pi pi-ban"
                  size="small"
                  severity="warning"
                  [pTooltip]="i18n.translate('ACTIONS.DEACTIVATE')"
                  data-testid="toggle-user-status-button"
                  (onClick)="deactivateUser(user)"
                >
                </p-button>

                <p-button
                  *ngIf="!user.active"
                  icon="pi pi-check"
                  size="small"
                  severity="success"
                  [pTooltip]="i18n.translate('ACTIONS.ACTIVATE')"
                  data-testid="toggle-user-status-button"
                  (onClick)="activateUser(user)"
                >
                </p-button>

                <p-button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  [pTooltip]="i18n.translate('ACTIONS.DELETE')"
                  (onClick)="deleteUser(user)"
                  [disabled]="!canDeleteUser(user)"
                >
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog
      [header]="
        isEditMode
          ? i18n.translate('USERS.EDIT_USER')
          : i18n.translate('USERS.ADD_USER')
      "
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '450px' }"
      [closable]="true"
      data-testid="user-dialog"
    >
      <form [formGroup]="userForm" (ngSubmit)="saveUser()">
        <div class="flex flex-column gap-3">
          <div class="field">
            <label for="username"
              >{{ i18n.translate("USERS.USERNAME") }} *</label
            >
            <input
              pInputText
              id="username"
              formControlName="username"
              [placeholder]="i18n.translate('USERS.USERNAME_PLACEHOLDER')"
              data-testid="user-username"
              class="w-full"
            />
            <small
              class="p-error"
              *ngIf="
                userForm.get('username')?.errors &&
                userForm.get('username')?.touched
              "
            >
              {{ i18n.translate("USERS.USERNAME_REQUIRED") }}
            </small>
          </div>

          <div class="field">
            <label for="password">
              {{ i18n.translate("USERS.PASSWORD") }}
              <span *ngIf="!isEditMode">*</span>
              <span *ngIf="isEditMode"
                >({{ i18n.translate("USERS.LEAVE_EMPTY_NO_CHANGE") }})</span
              >
            </label>
            <p-password
              id="password"
              formControlName="password"
              [placeholder]="i18n.translate('USERS.PASSWORD_PLACEHOLDER')"
              styleClass="w-full"
              [toggleMask]="true"
              [feedback]="false"
              data-testid="user-password"
            >
            </p-password>
            <small
              class="p-error"
              *ngIf="
                userForm.get('password')?.errors &&
                userForm.get('password')?.touched
              "
            >
              {{ i18n.translate("USERS.PASSWORD_REQUIRED") }}
            </small>
          </div>

          <div class="field">
            <label for="role">{{ i18n.translate("USERS.ROLE") }} *</label>
            <p-dropdown
              id="role"
              formControlName="role"
              [options]="roleOptions"
              optionLabel="label"
              optionValue="value"
              [placeholder]="i18n.translate('USERS.SELECT_ROLE')"
              data-testid="user-role"
              styleClass="w-full"
            >
            </p-dropdown>
          </div>

          <div class="field">
            <label for="active">{{ i18n.translate("USERS.STATUS") }} *</label>
            <p-dropdown
              id="active"
              formControlName="active"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              [placeholder]="i18n.translate('USERS.SELECT_STATUS')"
              styleClass="w-full"
            >
            </p-dropdown>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
          <p-button
            [label]="i18n.translate('ACTIONS.CANCEL')"
            icon="pi pi-times"
            type="button"
            severity="secondary"
            (onClick)="hideDialog()"
          >
          </p-button>
          <p-button
            [label]="i18n.translate('ACTIONS.SAVE')"
            icon="pi pi-check"
            type="submit"
            [disabled]="!userForm.valid"
            data-testid="save-user-button"
          >
          </p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog data-testid="confirm-action-button"></p-confirmDialog>
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

      .field {
        margin-bottom: 1rem;
      }

      .field label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .p-error {
        color: #e24c4c;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  totalRecords = 0;
  displayDialog = false;
  isEditMode = false;
  userForm!: FormGroup;
  selectedUser: User | null = null;

  roleOptions = [
    { label: "Administrator", value: "ADMIN" },
    { label: "User", value: "USER" },
  ];

  statusOptions = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    public i18n: I18nService,
  ) {}

  ngOnInit() {
    this.initForm();
    this.updateTranslations();

    // Update translations when language changes
    this.i18n.language$.subscribe(() => {
      this.updateTranslations();
    });
  }

  private updateTranslations() {
    this.roleOptions = [
      { label: this.i18n.translate("USERS.ROLE_ADMIN"), value: "ADMIN" },
      { label: this.i18n.translate("USERS.ROLE_USER"), value: "USER" },
    ];

    this.statusOptions = [
      { label: this.i18n.translate("COMMON.ACTIVE"), value: true },
      { label: this.i18n.translate("COMMON.INACTIVE"), value: false },
    ];
  }

  initForm() {
    this.userForm = this.fb.group({
      username: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      password: [""],
      role: ["USER", Validators.required],
      active: [true, Validators.required],
    });
  }

  loadUsers(event: any) {
    this.loading = true;
    const page = event.first / event.rows;
    const size = event.rows;
    const sortBy = event.sortField || "username";
    const sortDir = event.sortOrder === 1 ? "asc" : "desc";

    this.apiService.getUsers(page, size, sortBy, sortDir).subscribe({
      next: (response) => {
        this.users = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: this.i18n.translate("COMMON.ERROR"),
          detail: this.i18n.translate("USERS.LOAD_ERROR"),
        });
        this.loading = false;
      },
    });
  }

  showAddDialog() {
    this.isEditMode = false;
    this.selectedUser = null;
    this.userForm.reset({ role: "USER", active: true });
    this.userForm
      .get("password")
      ?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get("password")?.updateValueAndValidity();
    this.displayDialog = true;
  }

  showEditDialog(user: User) {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm.patchValue({
      username: user.username,
      role: user.role,
      active: user.active,
    });
    this.userForm.get("password")?.clearValidators();
    this.userForm.get("password")?.updateValueAndValidity();
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.userForm.reset();
  }

  saveUser() {
    if (!this.userForm.valid) return;

    const formData = this.userForm.value;

    // Remove password if empty in edit mode
    if (
      this.isEditMode &&
      (!formData.password || formData.password.trim() === "")
    ) {
      delete formData.password;
    }

    if (this.isEditMode && this.selectedUser) {
      this.apiService.updateUser(this.selectedUser.id!, formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: this.i18n.translate("COMMON.SUCCESS"),
            detail: this.i18n.translate("USERS.UPDATE_SUCCESS"),
          });
          this.hideDialog();
          this.loadUsers({ first: 0, rows: 10 });
        },
        error: (error) => {
          this.messageService.add({
            severity: "error",
            summary: this.i18n.translate("COMMON.ERROR"),
            detail:
              error.error?.message || this.i18n.translate("USERS.UPDATE_ERROR"),
          });
        },
      });
    } else {
      this.apiService.createUser(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: this.i18n.translate("COMMON.SUCCESS"),
            detail: this.i18n.translate("USERS.CREATE_SUCCESS"),
          });
          this.hideDialog();
          this.loadUsers({ first: 0, rows: 10 });
        },
        error: (error) => {
          this.messageService.add({
            severity: "error",
            summary: this.i18n.translate("COMMON.ERROR"),
            detail:
              error.error?.message || this.i18n.translate("USERS.CREATE_ERROR"),
          });
        },
      });
    }
  }

  activateUser(user: User) {
    this.confirmationService.confirm({
      message: this.i18n.translate("USERS.ACTIVATE_CONFIRM", {
        username: user.username,
      }),
      header: this.i18n.translate("USERS.ACTIVATE_USER"),
      icon: "pi pi-check",
      accept: () => {
        this.apiService.activateUser(user.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: this.i18n.translate("COMMON.SUCCESS"),
              detail: this.i18n.translate("USERS.ACTIVATE_SUCCESS"),
            });
            this.loadUsers({ first: 0, rows: 10 });
          },
          error: (error) => {
            this.messageService.add({
              severity: "error",
              summary: this.i18n.translate("COMMON.ERROR"),
              detail:
                error.error?.message ||
                this.i18n.translate("USERS.ACTIVATE_ERROR"),
            });
          },
        });
      },
    });
  }

  deactivateUser(user: User) {
    this.confirmationService.confirm({
      message: this.i18n.translate("USERS.DEACTIVATE_CONFIRM", {
        username: user.username,
      }),
      header: this.i18n.translate("USERS.DEACTIVATE_USER"),
      icon: "pi pi-ban",
      accept: () => {
        this.apiService.deactivateUser(user.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: this.i18n.translate("COMMON.SUCCESS"),
              detail: this.i18n.translate("USERS.DEACTIVATE_SUCCESS"),
            });
            this.loadUsers({ first: 0, rows: 10 });
          },
          error: (error) => {
            this.messageService.add({
              severity: "error",
              summary: this.i18n.translate("COMMON.ERROR"),
              detail:
                error.error?.message ||
                this.i18n.translate("USERS.DEACTIVATE_ERROR"),
            });
          },
        });
      },
    });
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: this.i18n.translate("USERS.DELETE_CONFIRM", {
        username: user.username,
      }),
      header: this.i18n.translate("USERS.DELETE_USER"),
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.apiService.deleteUser(user.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: this.i18n.translate("COMMON.SUCCESS"),
              detail: this.i18n.translate("USERS.DELETE_SUCCESS"),
            });
            this.loadUsers({ first: 0, rows: 10 });
          },
          error: (error) => {
            this.messageService.add({
              severity: "error",
              summary: this.i18n.translate("COMMON.ERROR"),
              detail:
                error.error?.message ||
                this.i18n.translate("USERS.DELETE_ERROR"),
            });
          },
        });
      },
    });
  }

  canDeleteUser(user: User): boolean {
    // Can't delete if it's the last admin user
    if (user.role === "ADMIN") {
      const activeAdmins = this.users.filter(
        (u) => u.role === "ADMIN" && u.active,
      ).length;
      return activeAdmins > 1;
    }
    return true;
  }
}
