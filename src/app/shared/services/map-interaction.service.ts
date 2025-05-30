import { Injectable, signal } from '@angular/core';
import { Location, LocationType } from '../models/location.model';

/**
 * Service for handling map interaction state and behaviors
 */
@Injectable({
  providedIn: 'root'
})
export class MapInteractionService {
  // Signals for reactive state management
  private selectedCountry = signal<Location | null>(null);
  private selectedProvince = signal<Location | null>(null);
  private selectedCity = signal<Location | null>(null);
  private zoomLevel = signal<number>(1);
  
  /**
   * Get the currently selected country
   * @returns The selected country or null
   */
  getSelectedCountry(): Location | null {
    return this.selectedCountry();
  }
  
  /**
   * Get the currently selected province
   * @returns The selected province or null
   */
  getSelectedProvince(): Location | null {
    return this.selectedProvince();
  }
  
  /**
   * Get the currently selected city
   * @returns The selected city or null
   */
  getSelectedCity(): Location | null {
    return this.selectedCity();
  }
  
  /**
   * Get the current zoom level
   * @returns The current zoom level
   */
  getZoomLevel(): number {
    return this.zoomLevel();
  }
  
  /**
   * Set the selected country
   * @param country - Country location data
   */
  setSelectedCountry(country: Location | null): void {
    this.selectedCountry.set(country);
    // Reset province and city when a new country is selected
    if (country === null || this.selectedProvince()?.parentId !== country.id) {
      this.selectedProvince.set(null);
      this.selectedCity.set(null);
    }
  }
  
  /**
   * Set the selected province
   * @param province - Province location data
   */
  setSelectedProvince(province: Location | null): void {
    this.selectedProvince.set(province);
    // Reset city when a new province is selected
    if (province === null || this.selectedCity()?.parentId !== province.id) {
      this.selectedCity.set(null);
    }
  }
  
  /**
   * Set the selected city
   * @param city - City location data
   */
  setSelectedCity(city: Location | null): void {
    this.selectedCity.set(city);
  }
  
  /**
   * Set the zoom level
   * @param level - New zoom level
   */
  setZoomLevel(level: number): void {
    this.zoomLevel.set(Math.max(1, Math.min(8, level))); // Clamp between 1 and 8
  }
  
  /**
   * Get the most specific selected location (city, province, or country)
   * @returns The most specific selected location or null
   */
  getMostSpecificLocation(): Location | null {
    return this.selectedCity() || this.selectedProvince() || this.selectedCountry();
  }
  
  /**
   * Clear all selections
   */
  clearSelections(): void {
    this.selectedCountry.set(null);
    this.selectedProvince.set(null);
    this.selectedCity.set(null);
  }
}