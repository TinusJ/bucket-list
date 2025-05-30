import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BucketItemPriority, BucketItemStatus } from '../../../shared/models/bucket-item.model';
import { LocationType } from '../../../shared/models/location.model';
import { BucketListService } from '../../../shared/services/bucket-list.service';

@Component({
  selector: 'app-bucket-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h1>{{ isEditMode() ? 'Edit' : 'Add' }} Bucket List Item</h1>
      
      <form [formGroup]="bucketForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Title</label>
          <input id="title" type="text" formControlName="title">
          <div class="error" *ngIf="bucketForm.get('title')?.errors?.['required'] && bucketForm.get('title')?.touched">
            Title is required.
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description" rows="4"></textarea>
          <div class="error" *ngIf="bucketForm.get('description')?.errors?.['required'] && bucketForm.get('description')?.touched">
            Description is required.
          </div>
        </div>
        
        <div class="form-group">
          <label for="priority">Priority</label>
          <select id="priority" formControlName="priority">
            <option [value]="BucketItemPriority.LOW">Low</option>
            <option [value]="BucketItemPriority.MEDIUM">Medium</option>
            <option [value]="BucketItemPriority.HIGH">High</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" formControlName="status">
            <option [value]="BucketItemStatus.PLANNED">Planned</option>
            <option [value]="BucketItemStatus.IN_PROGRESS">In Progress</option>
            <option [value]="BucketItemStatus.COMPLETED">Completed</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="button" (click)="cancel()">Cancel</button>
          <button type="submit" [disabled]="bucketForm.invalid">{{ isEditMode() ? 'Update' : 'Create' }}</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1 {
      margin-bottom: 20px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    input, textarea, select {
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
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button[type="button"] {
      background-color: #f0f0f0;
    }
    
    button[type="submit"] {
      background-color: #4CAF50;
      color: white;
    }
    
    button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class BucketItemFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bucketListService = inject(BucketListService);
  
  // Exposing enums to template
  BucketItemPriority = BucketItemPriority;
  BucketItemStatus = BucketItemStatus;
  
  // Form state
  bucketForm: FormGroup;
  isEditMode = signal<boolean>(false);
  itemId = signal<string | null>(null);
  
  constructor() {
    this.bucketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: [BucketItemPriority.MEDIUM],
      status: [BucketItemStatus.PLANNED]
    });
    
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.itemId.set(id);
      // In a real implementation, you would load the item data
    }
  }
  
  onSubmit(): void {
    if (this.bucketForm.invalid) return;
    
    // In a real implementation, you would save the data
    console.log('Form data:', this.bucketForm.value);
    this.router.navigate(['/bucket-list']);
  }
  
  cancel(): void {
    this.router.navigate(['/bucket-list']);
  }
}