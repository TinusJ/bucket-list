import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  DocumentData, 
  QuerySnapshot,
  serverTimestamp
} from '@angular/fire/firestore';
import { BucketItem, BucketItemStatus } from '../models/bucket-item.model';
import { Location, LocationType } from '../models/location.model';

/**
 * Service for managing bucket list items in Firebase Firestore
 */
@Injectable({
  providedIn: 'root'
})
export class BucketListService {
  private firestore: Firestore = inject(Firestore);
  
  /**
   * Get all bucket list items for a user
   * @param userId - The ID of the current user
   * @returns Promise of bucket list items
   */
  async getBucketItems(userId: string): Promise<BucketItem[]> {
    const bucketItemsRef = collection(this.firestore, 'bucketItems');
    const q = query(bucketItemsRef, where('userId', '==', userId));
    
    try {
      const querySnapshot = await getDocs(q);
      return this.convertQuerySnapshotToItems(querySnapshot);
    } catch (error) {
      console.error('Error fetching bucket items:', error);
      return [];
    }
  }
  
  /**
   * Get bucket list items for a specific location
   * @param userId - The ID of the current user
   * @param locationId - The ID of the location
   * @param locationType - The type of location
   * @returns Promise of bucket list items for the location
   */
  async getBucketItemsByLocation(
    userId: string, 
    locationId: string, 
    locationType: LocationType
  ): Promise<BucketItem[]> {
    const bucketItemsRef = collection(this.firestore, 'bucketItems');
    
    let locationField: string;
    switch (locationType) {
      case LocationType.COUNTRY:
        locationField = 'location.id';
        break;
      case LocationType.PROVINCE:
        locationField = 'location.parentId';
        break;
      case LocationType.CITY:
        // For cities, we need to query by the parent province ID
        locationField = 'location.parentId';
        break;
      default:
        locationField = 'location.id';
    }
    
    const q = query(
      bucketItemsRef, 
      where('userId', '==', userId),
      where(locationField, '==', locationId)
    );
    
    try {
      const querySnapshot = await getDocs(q);
      return this.convertQuerySnapshotToItems(querySnapshot);
    } catch (error) {
      console.error(`Error fetching bucket items for ${locationType}:`, error);
      return [];
    }
  }
  
  /**
   * Add a new bucket list item
   * @param bucketItem - The bucket item to add (without ID)
   * @returns Promise with the ID of the created item
   */
  async addBucketItem(bucketItem: Omit<BucketItem, 'id' | 'createdAt'>): Promise<string> {
    const bucketItemsRef = collection(this.firestore, 'bucketItems');
    
    try {
      const docRef = await addDoc(bucketItemsRef, {
        ...bucketItem,
        createdAt: serverTimestamp(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding bucket item:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing bucket list item
   * @param id - The ID of the item to update
   * @param bucketItem - The updated bucket item data
   * @returns Promise that resolves when update is complete
   */
  async updateBucketItem(id: string, bucketItem: Partial<BucketItem>): Promise<void> {
    const bucketItemRef = doc(this.firestore, `bucketItems/${id}`);
    
    try {
      await updateDoc(bucketItemRef, { ...bucketItem });
    } catch (error) {
      console.error('Error updating bucket item:', error);
      throw error;
    }
  }
  
  /**
   * Mark a bucket list item as completed
   * @param id - The ID of the item to complete
   * @returns Promise that resolves when update is complete
   */
  async completeBucketItem(id: string): Promise<void> {
    const bucketItemRef = doc(this.firestore, `bucketItems/${id}`);
    
    try {
      await updateDoc(bucketItemRef, { 
        status: BucketItemStatus.COMPLETED,
        completedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error completing bucket item:', error);
      throw error;
    }
  }
  
  /**
   * Delete a bucket list item
   * @param id - The ID of the item to delete
   * @returns Promise that resolves when deletion is complete
   */
  async deleteBucketItem(id: string): Promise<void> {
    const bucketItemRef = doc(this.firestore, `bucketItems/${id}`);
    
    try {
      await deleteDoc(bucketItemRef);
    } catch (error) {
      console.error('Error deleting bucket item:', error);
      throw error;
    }
  }
  
  /**
   * Helper method to convert Firestore query snapshot to bucket items
   * @param querySnapshot - The Firestore query snapshot
   * @returns Array of bucket items
   */
  private convertQuerySnapshotToItems(querySnapshot: QuerySnapshot<DocumentData>): BucketItem[] {
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data['createdAt']?.toDate() || new Date(),
        completedAt: data['completedAt']?.toDate() || undefined
      } as BucketItem;
    });
  }
}