import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";

import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { CardModule } from "primeng/card";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";

import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="login-container">
      <p-card header="Vinodelnja Login" class="login-card">
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              pInputText
              formControlName="username"
              placeholder="Enter username"
              data-testid="username"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <p-password
              formControlName="password"
              placeholder="Enter password"
              [feedback]="false"
              [toggleMask]="true"
              data-testid="password"
              styleClass="w-full"
            >
            </p-password>
          </div>

          <p-button
            type="submit"
            label="Login"
            [loading]="loading"
            [disabled]="loginForm.invalid"
            data-testid="login-button"
            styleClass="w-full"
          >
          </p-button>
        </form>

        <div class="demo-credentials">
          <small>Demo credentials: admin/admin or user/user</small>
        </div>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .login-card {
        width: 400px;
        max-width: 90vw;
      }

      .field {
        margin-bottom: 1rem;
      }

      .field label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .demo-credentials {
        text-align: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #dee2e6;
      }

      .w-full {
        width: 100%;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {
    this.loginForm = this.fb.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(["/"]);
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            summary: "Login Failed",
            detail: "Invalid credentials",
          });
          this.loading = false;
        },
      });
    }
  }
}
