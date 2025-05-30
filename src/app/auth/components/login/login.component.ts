import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <h1>Login</h1>
      
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email">
          <div class="error" *ngIf="loginForm.get('email')?.errors?.['required'] && loginForm.get('email')?.touched">
            Email is required.
          </div>
          <div class="error" *ngIf="loginForm.get('email')?.errors?.['email'] && loginForm.get('email')?.touched">
            Please enter a valid email.
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password">
          <div class="error" *ngIf="loginForm.get('password')?.errors?.['required'] && loginForm.get('password')?.touched">
            Password is required.
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" [disabled]="loginForm.invalid">Login</button>
        </div>
      </form>
      
      <div class="auth-links">
        <a routerLink="/auth/register">Need an account? Register</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      max-width: 400px;
      margin: 40px auto;
      padding: 20px;
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      margin-bottom: 20px;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    .error {
      color: red;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background-color: #4CAF50;
      color: white;
      font-size: 16px;
      cursor: pointer;
      width: 100%;
    }
    
    button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .auth-links {
      margin-top: 20px;
      text-align: center;
    }
    
    .auth-links a {
      color: #2196F3;
      text-decoration: none;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) return;
    
    // In a real implementation, you would handle authentication
    console.log('Login form submitted');
    this.router.navigate(['/']);
  }
}