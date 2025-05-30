import { CommonModule } from '@angular/common';
import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  OnDestroy, 
  Input, 
  Output, 
  EventEmitter, 
  signal, 
  inject, 
  OnChanges, 
  SimpleChanges 
} from '@angular/core';
import { Location, LocationType } from '../../shared/models/location.model';
import { MapInteractionService } from '../../shared/services/map-interaction.service';
import * as d3 from 'd3';

/**
 * Component for displaying and interacting with the world map SVG
 * Loads SVG from assets/world.svg and adds interactive features
 */
@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #mapContainer class="world-map"></div>
      
      <div class="map-controls">
        <button (click)="zoomIn()" class="control-button" aria-label="Zoom In">+</button>
        <button (click)="zoomOut()" class="control-button" aria-label="Zoom Out">-</button>
        <button (click)="resetView()" class="control-button" aria-label="Reset View">↺</button>
      </div>
      
      <div class="map-legend">
        <div class="legend-item">
          <span class="color-box default"></span>
          <span>No bucket list items</span>
        </div>
        <div class="legend-item">
          <span class="color-box has-items"></span>
          <span>Has bucket list items</span>
        </div>
        <div class="legend-item">
          <span class="color-box selected"></span>
          <span>Selected country</span>
        </div>
      </div>
      
      <div *ngIf="loading()" class="loading-indicator">
        <span>Loading world map...</span>
      </div>
      
      <div *ngIf="error()" class="error-indicator">
        <span>Failed to load map. Please try again.</span>
        <button (click)="loadWorldMap()">Retry</button>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 500px;
      background-color: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .world-map {
      width: 100%;
      height: 100%;
    }
    
    :host ::ng-deep svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    
    :host ::ng-deep .country {
      fill: #ccc;
      stroke: #fff;
      stroke-width: 0.5;
      transition: fill 0.3s ease;
      cursor: pointer;
      vector-effect: non-scaling-stroke;
    }
    
    :host ::ng-deep .country:hover {
      fill: #aaa;
    }
    
    :host ::ng-deep .country.has-items {
      fill: #66c2a5;
    }
    
    :host ::ng-deep .country.selected {
      fill: #fc8d62;
      stroke: #000;
      stroke-width: 1;
    }
    
    .map-controls {
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 10;
    }
    
    .control-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: white;
      border: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      font-size: 18px;
      transition: background-color 0.3s ease;
    }
    
    .control-button:hover {
      background-color: #f0f0f0;
    }
    
    .control-button:active {
      background-color: #e0e0e0;
    }
    
    .map-legend {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .legend-item:last-child {
      margin-bottom: 0;
    }
    
    .color-box {
      width: 15px;
      height: 15px;
      margin-right: 8px;
      border: 1px solid #ddd;
    }
    
    .color-box.default {
      background-color: #ccc;
    }
    
    .color-box.has-items {
      background-color: #66c2a5;
    }
    
    .color-box.selected {
      background-color: #fc8d62;
    }
    
    .loading-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(255, 255, 255, 0.9);
      padding: 15px 30px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      z-index: 20;
    }
    
    .error-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(255, 255, 255, 0.9);
      padding: 20px 30px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      text-align: center;
      color: #d32f2f;
      z-index: 20;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .error-indicator button {
      padding: 8px 16px;
      background-color: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 0 auto;
    }
    
    @media (max-width: 768px) {
      .map-legend {
        bottom: auto;
        top: 10px;
        left: 10px;
        font-size: 12px;
      }
      
      .map-controls {
        bottom: 10px;
        right: 10px;
      }
      
      .control-button {
        width: 36px;
        height: 36px;
      }
    }
  `]
})
export class WorldMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  /**
   * Reference to the map container element
   */
  @ViewChild('mapContainer', { static: true }) mapContainerRef!: ElementRef;
  
  /**
   * Input for countries with bucket list items
   * Array of country codes that have bucket list items
   */
  @Input() countriesWithItems: string[] = [];
  
  /**
   * Input for the currently selected country code
   */
  @Input() selectedCountryCode: string | null = null;
  
  /**
   * Output event emitted when a country is selected
   */
  @Output() countrySelected = new EventEmitter<Location>();
  
  /**
   * Service for managing map interactions
   */
  private mapInteractionService = inject(MapInteractionService);
  
  /**
   * D3 selections for SVG elements
   */
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private svgGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  
  /**
   * Reactive state signals
   */
  public loading = signal<boolean>(true);
  public error = signal<boolean>(false);
  
  /**
   * Initialize the map after the view is initialized
   */
  ngAfterViewInit(): void {
    this.initializeMap();
    this.loadWorldMap();
  }
  
  /**
   * Clean up resources when the component is destroyed
   */
  ngOnDestroy(): void {
    // Remove any event listeners or subscriptions if needed
    if (this.svg) {
      this.svg.on('.zoom', null);
    }
  }
  
  /**
   * Respond to input changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    // If countries with items change, update the highlights
    if (changes['countriesWithItems'] && !changes['countriesWithItems'].firstChange) {
      this.updateCountryHighlights();
    }
    
    // If selected country changes from parent, update the selection
    if (changes['selectedCountryCode'] && !changes['selectedCountryCode'].firstChange) {
      this.updateSelectedCountry();
    }
  }

  /**
   * Initialize the SVG container and zoom behavior
   */
  private initializeMap(): void {
    const element = this.mapContainerRef.nativeElement;
    
    // Create SVG element
    this.svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Create a group for map elements that will be transformed
    this.svgGroup = this.svg.append('g');
    
    // Define zoom behavior
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        if (this.svgGroup) {
          this.svgGroup.attr('transform', event.transform.toString());
          this.mapInteractionService.setZoomLevel(event.transform.k);
        }
      });
    
    // Apply zoom behavior to SVG
    this.svg.call(this.zoom);
  }
  
  /**
   * Load the world map SVG from assets
   */
  loadWorldMap(): void {
    this.loading.set(true);
    this.error.set(false);
    
    // Use D3 to load the external SVG file
    d3.xml('/assets/world.svg')
      .then((svgDocument) => {
        if (!this.svgGroup) {
          this.error.set(true);
          this.loading.set(false);
          return;
        }
        
        // Clear previous content if reloading
        this.svgGroup.selectAll('*').remove();
        
        // Get the SVG element from the loaded document
        const svgElement = svgDocument.documentElement;
        
        // Extract the viewBox attribute from the original SVG
        const viewBox = svgElement.getAttribute('viewBox');
        
        if (viewBox && this.svg) {
          this.svg.attr('viewBox', viewBox);
        }
        
        // Import and append the loaded SVG content to our SVG group
        const importedNode = document.importNode(svgElement, true);
        
        // Instead of appending the entire SVG, extract and append its children
        while (importedNode.childNodes.length > 0) {
          this.svgGroup.node()?.appendChild(importedNode.childNodes[0]);
        }
        
        // Set up country paths and interactions
        this.setupCountryInteractions();
        
        // Update country highlights based on which ones have bucket list items
        this.updateCountryHighlights();
        
        // Update selected country if one is set
        this.updateSelectedCountry();
        
        this.loading.set(false);
      })
      .catch((error) => {
        console.error('Error loading world map SVG:', error);
        this.error.set(true);
        this.loading.set(false);
      });
  }
  
  /**
   * Set up click and hover interactions for countries
   */
  private setupCountryInteractions(): void {
    if (!this.svgGroup) return;
    
    // Find all country paths in the SVG
    // Note: This depends on how your SVG is structured
    // In many world map SVGs, countries are represented as path elements with ids like "US", "CA", etc.
    this.svgGroup.selectAll('path')
      .classed('country', true)
      .on('click', (event, d) => {
        const countryElement = event.target;
        const countryId = countryElement.id || '';
        const countryName = countryElement.getAttribute('name') || countryElement.id || 'Unknown';
        
        if (countryId) {
          this.selectCountry(countryId, countryName);
        }
      });
  }
  
  /**
   * Select a country and emit the selection event
   */
  private selectCountry(countryId: string, countryName: string): void {
    if (!this.svgGroup) return;
    
    // Remove selected class from all countries
    this.svgGroup.selectAll('.country').classed('selected', false);
    
    // Add selected class to clicked country
    this.svgGroup.select(`#${countryId}`).classed('selected', true);
    
    // Create location object
    const location: Location = {
      id: countryId,
      name: countryName,
      code: countryId,
      type: LocationType.COUNTRY
    };
    
    // Update map service with selected country
    this.mapInteractionService.setSelectedCountry(location);
    
    // Emit selection event
    this.countrySelected.emit(location);
  }
  
  /**
   * Update country highlights based on which ones have bucket list items
   */
  private updateCountryHighlights(): void {
    if (!this.svgGroup || !this.countriesWithItems) return;
    
    // Remove highlight class from all countries
    this.svgGroup.selectAll('.country').classed('has-items', false);
    
    // Add highlight class to countries with bucket list items
    this.countriesWithItems.forEach(countryId => {
      this.svgGroup?.select(`#${countryId}`).classed('has-items', true);
    });
  }
  
  /**
   * Update the selected country based on input
   */
  private updateSelectedCountry(): void {
    if (!this.svgGroup || !this.selectedCountryCode) return;
    
    // Remove selected class from all countries
    this.svgGroup.selectAll('.country').classed('selected', false);
    
    // Add selected class to the selected country
    this.svgGroup.select(`#${this.selectedCountryCode}`).classed('selected', true);
  }
  
  /**
   * Zoom in on the map
   */
  zoomIn(): void {
    if (!this.svg || !this.zoom) return;
    
    this.svg.transition()
      .duration(300)
      .call(this.zoom.scaleBy, 1.5);
  }
  
  /**
   * Zoom out on the map
   */
  zoomOut(): void {
    if (!this.svg || !this.zoom) return;
    
    this.svg.transition()
      .duration(300)
      .call(this.zoom.scaleBy, 0.75);
  }
  
  /**
   * Reset the map view to the default position
   */
  resetView(): void {
    if (!this.svg || !this.zoom) return;
    
    this.svg.transition()
      .duration(500)
      .call(this.zoom.transform, d3.zoomIdentity);
    
    // Clear selected country
    if (this.svgGroup) {
      this.svgGroup.selectAll('.country').classed('selected', false);
    }
    
    this.mapInteractionService.clearSelections();
  }
}