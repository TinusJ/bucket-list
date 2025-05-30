import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <h1>User Profile</h1>
      
      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" type="text" formControlName="name">
          <div class="error" *ngIf="profileForm.get('name')?.errors?.['required'] && profileForm.get('name')?.touched">
            Name is required.
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" readonly>
        </div>
        
        <div class="form-group">
          <label for="bio">Bio</label>
          <textarea id="bio" formControlName="bio" rows="4"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" [disabled]="profileForm.invalid">Save Changes</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 600px;
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
    
    input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    textarea {
      resize: vertical;
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
      min-width: 150px;
    }
    
    button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ProfileComponent {
  profileForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    // In a real app, you would load user data from a service
    this.profileForm = this.fb.group({
      name: ['John Doe', Validators.required],
      email: ['john.doe@example.com'],
      bio: ['Travel enthusiast and adventure seeker']
    });
  }
  
  onSubmit(): void {
    if (this.profileForm.invalid) return;
    
    // In a real implementation, you would update user profile
    console.log('Profile updated:', this.profileForm.value);
    alert('Profile updated successfully!');
  }
}