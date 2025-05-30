import { LocationType, Location } from './location.model';

/**
 * Enum representing the priority levels of bucket list items
 */
export enum BucketItemPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * Enum representing the status of bucket list items
 */
export enum BucketItemStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

/**
 * Interface representing a bucket list item
 */
export interface BucketItem {
  id: string;
  title: string;
  description: string;
  location: Location;
  priority: BucketItemPriority;
  status: BucketItemStatus;
  userId: string;
  createdAt: Date;
  completedAt?: Date;
  imageUrl?: string;
  notes?: string;
}