import { Routes } from '@angular/router';

export const BUCKET_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/bucket-item-list/bucket-item-list.component')
      .then(m => m.BucketItemListComponent)
  },
  {
    path: 'add',
    loadComponent: () => import('./components/bucket-item-form/bucket-item-form.component')
      .then(m => m.BucketItemFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/bucket-item-form/bucket-item-form.component')
      .then(m => m.BucketItemFormComponent)
  }
];