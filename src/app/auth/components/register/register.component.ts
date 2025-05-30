import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <h1>Register</h1>
      
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" type="text" formControlName="name">
          <div class="error" *ngIf="registerForm.get('name')?.errors?.['required'] && registerForm.get('name')?.touched">
            Name is required.
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email">
          <div class="error" *ngIf="registerForm.get('email')?.errors?.['required'] && registerForm.get('email')?.touched">
            Email is required.
          </div>
          <div class="error" *ngIf="registerForm.get('email')?.errors?.['email'] && registerForm.get('email')?.touched">
            Please enter a valid email.
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password">
          <div class="error" *ngIf="registerForm.get('password')?.errors?.['required'] && registerForm.get('password')?.touched">
            Password is required.
          </div>
          <div class="error" *ngIf="registerForm.get('password')?.errors?.['minlength'] && registerForm.get('password')?.touched">
            Password must be at least 6 characters.
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" [disabled]="registerForm.invalid">Register</button>
        </div>
      </form>
      
      <div class="auth-links">
        <a routerLink="/auth/login">Already have an account? Login</a>
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
export class RegisterComponent {
  registerForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) return;
    
    // In a real implementation, you would register the user
    console.log('Register form submitted');
    this.router.navigate(['/auth/login']);
  }
}