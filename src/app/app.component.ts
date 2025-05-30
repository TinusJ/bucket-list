import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="logo">
          <h1>Bucket List Explorer</h1>
        </div>
        <nav class="main-nav">
          <ul>
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Map</a></li>
            <li><a routerLink="/bucket-list" routerLinkActive="active">My Bucket List</a></li>
            <li><a routerLink="/auth" routerLinkActive="active">Account</a></li>
          </ul>
        </nav>
      </header>
      
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer">
        <p>&copy; 2025 Bucket List Explorer</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .app-header {
      background-color: #333;
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .main-nav ul {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .main-nav li {
      margin-left: 1.5rem;
    }
    
    .main-nav a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 0;
    }
    
    .main-nav a.active {
      border-bottom: 2px solid white;
    }
    
    .main-nav a:hover {
      color: #ddd;
    }
    
    .app-content {
      flex: 1;
      padding: 1rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }
    
    .app-footer {
      background-color: #f5f5f5;
      padding: 1rem;
      text-align: center;
      color: #666;
    }
  `]
})
export class AppComponent {
  title = 'Bucket List Explorer';
}