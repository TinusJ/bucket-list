/**
 * Enum representing different types of locations in the bucket list app
 */
export enum LocationType {
  COUNTRY = 'COUNTRY',
  PROVINCE = 'PROVINCE',
  CITY = 'CITY'
}

/**
 * Interface representing a geographic location
 */
export interface Location {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  parentId?: string; // For provinces/cities to reference their parent location
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}