import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { WorldMapComponent } from '../components/world-map/world-map.component';
import { BucketListService } from '../shared/services/bucket-list.service';
import { MapInteractionService } from '../shared/services/map-interaction.service';
import { Location, LocationType } from '../shared/models/location.model';
import { BucketItem, BucketItemPriority, BucketItemStatus } from '../shared/models/bucket-item.model';

/**
 * Dashboard component that hosts the interactive world map
 * and displays bucket list items for selected locations
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, WorldMapComponent],
  template: `
    <div class="dashboard-container">
      <h1>Bucket List Explorer</h1>
      
      <div class="dashboard-content">
        <div class="map-section">
          <app-world-map 
            [countriesWithItems]="countriesWithItems()"
            [selectedCountryCode]="selectedCountryCode()"
            (countrySelected)="onCountrySelected($event)">
          </app-world-map>
        </div>
        
        <div class="sidebar" *ngIf="selectedLocation()">
          <div class="location-header">
            <h2>{{ selectedLocation()?.name }}</h2>
            <button class="add-button" (click)="addBucketItem()">
              + Add Bucket List Item
            </button>
          </div>
          
          <div *ngIf="loading()" class="loading">
            Loading bucket list items...
          </div>
          
          <div *ngIf="!loading() && bucketItems().length === 0" class="no-items">
            No bucket list items for this location yet.
          </div>
          
          <ul class="bucket-items" *ngIf="!loading() && bucketItems().length > 0">
            <li *ngFor="let item of bucketItems()" class="bucket-item">
              <div class="item-header">
                <h3>{{ item.title }}</h3>
                <span class="status {{ item.status.toLowerCase() }}">
                  {{ item.status === BucketItemStatus.IN_PROGRESS ? 'In Progress' : item.status }}
                </span>
              </div>
              <p>{{ item.description }}</p>
              <div class="item-actions">
                <button (click)="completeItem(item.id)" 
                  *ngIf="item.status !== BucketItemStatus.COMPLETED">
                  Complete
                </button>
                <button (click)="editItem(item.id)">Edit</button>
                <button (click)="deleteItem(item.id)">Delete</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      height: 100%;
    }
    
    h1 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .dashboard-content {
      display: flex;
      gap: 20px;
      height: calc(100vh - 160px);
      min-height: 500px;
    }
    
    .map-section {
      flex: 1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .sidebar {
      width: 300px;
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
    }
    
    .location-header {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .location-header h2 {
      margin: 0;
      color: #333;
    }
    
    .add-button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 8px 10px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .add-button:hover {
      background-color: #43a047;
    }
    
    .loading, .no-items {
      padding: 20px 0;
      text-align: center;
      color: #666;
    }
    
    .bucket-items {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .bucket-item {
      background-color: #fff;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .item-header h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .status {
      font-size: 12px;
      padding: 3px 8px;
      border-radius: 10px;
    }
    
    .status.planned {
      background-color: #e0e0e0;
    }
    
    .status.in_progress {
      background-color: #64B5F6;
      color: white;
    }
    
    .status.completed {
      background-color: #4CAF50;
      color: white;
    }
    
    .item-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .item-actions button {
      padding: 5px 10px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      background-color: #f0f0f0;
    }
    
    .item-actions button:first-child {
      background-color: #4CAF50;
      color: white;
    }
    
    @media (max-width: 768px) {
      .dashboard-content {
        flex-direction: column;
      }
      
      .sidebar {
        width: 100%;
      }
      
      .map-section {
        height: 400px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  // Services
  private bucketListService = inject(BucketListService);
  private mapInteractionService = inject(MapInteractionService);
  private router = inject(Router);
  
  // Expose enum to template
  BucketItemStatus = BucketItemStatus;
  
  // Reactive signals
  public loading = signal<boolean>(false);
  public bucketItems = signal<BucketItem[]>([]);
  public selectedLocation = signal<Location | null>(null);
  public countriesWithItems = signal<string[]>([]);
  public selectedCountryCode = signal<string | null>(null);
  
  // User ID (in a real app, this would come from auth service)
  private userId = 'test-user';
  
  /**
   * Initialize the dashboard
   */
  ngOnInit(): void {
    // Load all bucket items to determine which countries have items
    this.loadAllBucketItems();
  }
  
  /**
   * Handle country selection from the map
   * @param location - The selected country
   */
  onCountrySelected(location: Location): void {
    this.selectedLocation.set(location);
    this.selectedCountryCode.set(location.code);
    this.loadBucketItemsForLocation(location);
  }
  
  /**
   * Load all bucket items for the current user
   */
  private async loadAllBucketItems() {
    try {
      // For development purposes, create some sample data
      const sampleItems: BucketItem[] = [
        {
          id: '1',
          title: 'Visit Eiffel Tower',
          description: 'See the iconic Eiffel Tower in Paris',
          location: {
            id: 'FR',
            name: 'France',
            code: 'FR',
            type: LocationType.COUNTRY
          },
          priority: BucketItemPriority.HIGH,
          status: BucketItemStatus.PLANNED,
          userId: this.userId,
          createdAt: new Date()
        },
        {
          id: '2',
          title: 'Safari in Kruger National Park',
          description: 'Experience wildlife in South Africa',
          location: {
            id: 'ZA',
            name: 'South Africa',
            code: 'ZA',
            type: LocationType.COUNTRY
          },
          priority: BucketItemPriority.MEDIUM,
          status: BucketItemStatus.PLANNED,
          userId: this.userId,
          createdAt: new Date()
        },
        {
          id: '3',
          title: 'Visit Grand Canyon',
          description: 'See one of the seven natural wonders of the world',
          location: {
            id: 'US',
            name: 'United States',
            code: 'US',
            type: LocationType.COUNTRY
          },
          priority: BucketItemPriority.HIGH,
          status: BucketItemStatus.PLANNED,
          userId: this.userId,
          createdAt: new Date()
        }
      ];
      
      // Extract unique country codes
      const countryIds = [...new Set(sampleItems.map(item => {
        if (item.location.type === LocationType.COUNTRY) {
          return item.location.code;
        } else {
          // For provinces/cities, we need to get the parent country code
          return item.location.code.split('-')[0];
        }
      }))];
      
      this.countriesWithItems.set(countryIds);
      
      // In a real app, you would use this.bucketListService.getBucketItems(this.userId)
      // const items = await this.bucketListService.getBucketItems(this.userId);
      // const countryIds = [...new Set(items.map(item => item.location.code))];
      // this.countriesWithItems.set(countryIds);
    } catch (error) {
      console.error('Error loading bucket items:', error);
    }
  }
  
  /**
   * Load bucket items for a specific location
   * @param location - The location to load items for
   */
  private async loadBucketItemsForLocation(location: Location) {
    this.loading.set(true);
    
    try {
      // For development purposes, use sample data
      setTimeout(() => {
        const sampleItems: BucketItem[] = [
          {
            id: '1',
            title: 'Visit Eiffel Tower',
            description: 'See the iconic Eiffel Tower in Paris',
            location: {
              id: 'FR',
              name: 'France',
              code: 'FR',
              type: LocationType.COUNTRY
            },
            priority: BucketItemPriority.HIGH,
            status: BucketItemStatus.PLANNED,
            userId: this.userId,
            createdAt: new Date()
          },
          {
            id: '2',
            title: 'Visit Louvre Museum',
            description: 'See the Mona Lisa and other famous artworks',
            location: {
              id: 'FR',
              name: 'France',
              code: 'FR',
              type: LocationType.COUNTRY
            },
            priority: BucketItemPriority.MEDIUM,
            status: BucketItemStatus.PLANNED,
            userId: this.userId,
            createdAt: new Date()
          }
        ];
        
        // Filter items for the selected location
        const filteredItems = sampleItems.filter(item => 
          item.location.code === location.code
        );
        
        this.bucketItems.set(location.code === 'FR' ? filteredItems : []);
        this.loading.set(false);
      }, 1000);
      
      // In a real app, you would use:
      // const items = await this.bucketListService.getBucketItemsByLocation(
      //   this.userId,
      //   location.id,
      //   location.type
      // );
      // this.bucketItems.set(items);
    } catch (error) {
      console.error('Error loading bucket items for location:', error);
      this.loading.set(false);
    }
  }
  
  /**
   * Navigate to add a new bucket list item
   */
  addBucketItem(): void {
    const location = this.selectedLocation();
    if (location) {
      this.router.navigate(['/bucket-list/add'], { 
        queryParams: { 
          locationId: location.id,
          locationType: location.type
        } 
      });
    }
  }
  
  /**
   * Mark a bucket list item as completed
   * @param itemId - ID of the item to complete
   */
  async completeItem(itemId: string): Promise<void> {
    try {
      // In a real app, you would call the service
      // await this.bucketListService.completeBucketItem(itemId);
      
      // Update the local list
      const items = this.bucketItems();
      const updatedItems = items.map(item => {
        if (item.id === itemId) {
          return { 
            ...item, 
            status: BucketItemStatus.COMPLETED,
            completedAt: new Date()
          };
        }
        return item;
      });
      
      this.bucketItems.set(updatedItems);
    } catch (error) {
      console.error('Error completing bucket item:', error);
    }
  }
  
  /**
   * Navigate to edit a bucket list item
   * @param itemId - ID of the item to edit
   */
  editItem(itemId: string): void {
    this.router.navigate(['/bucket-list/edit', itemId]);
  }
  
  /**
   * Delete a bucket list item
   * @param itemId - ID of the item to delete
   */
  async deleteItem(itemId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this bucket list item?')) {
      try {
        // In a real app, you would call the service
        // await this.bucketListService.deleteBucketItem(itemId);
        
        // Update the local list
        const items = this.bucketItems();
        const updatedItems = items.filter(item => item.id !== itemId);
        this.bucketItems.set(updatedItems);
      } catch (error) {
        console.error('Error deleting bucket item:', error);
      }
    }
  }
}