import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BucketItem } from '../../../shared/models/bucket-item.model';
import { BucketListService } from '../../../shared/services/bucket-list.service';

@Component({
  selector: 'app-bucket-item-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bucket-list-container">
      <h1>My Bucket List</h1>
      <button class="add-button" routerLink="/bucket-list/add">+ Add New Item</button>
      
      <div *ngIf="loading" class="loading">Loading your bucket list...</div>
      
      <div *ngIf="!loading && bucketItems.length === 0" class="empty-list">
        <p>Your bucket list is empty. Add some items to get started!</p>
      </div>
      
      <ul class="bucket-items">
        <li *ngFor="let item of bucketItems" class="bucket-item">
          <div class="item-header">
            <h3>{{ item.title }}</h3>
            <span class="location">{{ item.location?.name }}</span>
          </div>
          <p>{{ item.description }}</p>
          <div class="item-actions">
            <button routerLink="/bucket-list/edit/{{ item.id }}">Edit</button>
            <button (click)="deleteItem(item.id)">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .bucket-list-container {
      padding: 20px;
    }
    
    h1 {
      margin-bottom: 20px;
    }
    
    .add-button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      margin-bottom: 20px;
    }
    
    .loading, .empty-list {
      padding: 20px;
      text-align: center;
      color: #666;
    }
    
    .bucket-items {
      list-style: none;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .bucket-item {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    
    .item-header h3 {
      margin: 0;
    }
    
    .location {
      background-color: #f0f0f0;
      padding: 3px 8px;
      border-radius: 10px;
      font-size: 12px;
    }
    
    .item-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    
    .item-actions button {
      padding: 5px 10px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }
  `]
})
export class BucketItemListComponent {
  private bucketListService = inject(BucketListService);

  // Since this is a placeholder implementation
  bucketItems: BucketItem[] = [];
  loading = true;

  ngOnInit(): void {
    // In a real implementation, you would load bucket items from the service
    // This is just a placeholder
    this.loading = false;
  }

  deleteItem(id: string): void {
    if (confirm('Are you sure you want to delete this item?')) {
      // In a real implementation, you would call the service
      console.log(`Delete item with ID: ${id}`);
    }
  }
}