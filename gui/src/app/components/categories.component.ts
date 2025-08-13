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
import { CheckboxModule } from "primeng/checkbox";
import { ColorPickerModule } from "primeng/colorpicker";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { MessageService, ConfirmationService } from "primeng/api";

import { Category, PageResponse } from "../models/entry.model";
import { ApiService } from "../services/api.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-categories",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    CheckboxModule,
    ColorPickerModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="main-container">
      <div class="card">
        <div class="header">
          <h2>Categories Management</h2>
          <p-button
            *ngIf="isAdmin"
            label="Add Category"
            icon="pi pi-plus"
            data-testid="add-category-button"
            (onClick)="showAddDialog()"
          >
          </p-button>
        </div>

        <p-table
          [value]="categories"
          [lazy]="true"
          [paginator]="true"
          [rows]="pageSize"
          [rowsPerPageOptions]="[15, 30, 45]"
          [totalRecords]="totalElements"
          [loading]="loading"
          data-testid="categories-table"
          (onLazyLoad)="loadCategories($event)"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">
                Name <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th>Description</th>
              <th>Color</th>
              <th pSortableColumn="active">
                Active <p-sortIcon field="active"></p-sortIcon>
              </th>
              <th pSortableColumn="createdAt">
                Created <p-sortIcon field="createdAt"></p-sortIcon>
              </th>
              <th *ngIf="isAdmin">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-category>
            <tr>
              <td>{{ category.name }}</td>
              <td>{{ category.description || "-" }}</td>
              <td>
                <div
                  class="color-preview"
                  [style.background-color]="category.color || '#ccc'"
                ></div>
                {{ category.color || "-" }}
              </td>
              <td>
                <i
                  [class]="
                    category.active
                      ? 'pi pi-check text-green-500'
                      : 'pi pi-times text-red-500'
                  "
                ></i>
              </td>
              <td>{{ category.createdAt | date: "short" }}</td>
              <td *ngIf="isAdmin">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  data-testid="edit-category-button"
                  (onClick)="editCategory(category)"
                >
                </p-button>
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  data-testid="delete-category-button"
                  (onClick)="deleteCategory(category)"
                >
                </p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [header]="editMode ? 'Edit Category' : 'Add Category'"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      data-testid="category-dialog"
    >
      <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
        <div class="field">
          <label for="name">Name *</label>
          <input
            id="name"
            type="text"
            pInputText
            formControlName="name"
            data-testid="category-name"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="description">Description</label>
          <textarea
            id="description"
            pInputTextarea
            formControlName="description"
            rows="3"
            data-testid="category-description"
            class="w-full"
          ></textarea>
        </div>

        <div class="field">
          <label for="color">Color</label>
          <p-colorPicker id="color" formControlName="color"></p-colorPicker>
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
            [disabled]="categoryForm.invalid"
            [loading]="saving"
            data-testid="save-category-button"
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

      .color-preview {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 3px;
        margin-right: 0.5rem;
        vertical-align: middle;
        border: 1px solid #ccc;
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
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  totalElements = 0;
  pageSize = 15;
  loading = false;
  saving = false;
  showDialog = false;
  editMode = false;

  categoryForm: FormGroup;
  selectedCategory: Category | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.categoryForm = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      color: ["#2E8B57"],
      active: [true],
    });
  }

  ngOnInit() {
    // Only load data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadCategories();
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadCategories(event?: any) {
    this.loading = true;
    const page = event ? event.first / event.rows : 0;
    const sort = event?.sortField
      ? `${event.sortField},${event.sortOrder === 1 ? "asc" : "desc"}`
      : "id,asc";

    this.apiService.getCategories(page, this.pageSize, sort).subscribe({
      next: (response) => {
        this.categories = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load categories",
        });
        this.loading = false;
      },
    });
  }

  showAddDialog() {
    this.editMode = false;
    this.selectedCategory = null;
    this.categoryForm.reset({ active: true, color: "#2E8B57" });
    this.showDialog = true;
  }

  editCategory(category: Category) {
    this.editMode = true;
    this.selectedCategory = category;
    this.categoryForm.patchValue(category);
    this.showDialog = true;
  }

  saveCategory() {
    if (this.categoryForm.valid) {
      this.saving = true;
      const categoryData = this.categoryForm.value;

      const request =
        this.editMode && this.selectedCategory
          ? this.apiService.updateCategory(
              this.selectedCategory.id!,
              categoryData,
            )
          : this.apiService.createCategory(categoryData);

      request.subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: `Category ${this.editMode ? "updated" : "created"} successfully`,
          });
          this.hideDialog();
          this.loadCategories();
          this.saving = false;
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to save category",
          });
          this.saving = false;
        },
      });
    }
  }

  deleteCategory(category: Category) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${category.name}?`,
      accept: () => {
        this.apiService.deleteCategory(category.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Category deleted successfully",
            });
            this.loadCategories();
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete category",
            });
          },
        });
      },
    });
  }

  hideDialog() {
    this.showDialog = false;
    this.categoryForm.reset();
  }
}
