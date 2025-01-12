import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  isFetchingData = signal<boolean>(false);
  error = signal<string | null>(null);
  ngOnInit(): void {
      this.isFetchingData.set(true);
      const subscription = this.httpClient.get<any>('http://localhost:3000/places').pipe(
        map((resData) =>  resData.places),
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('An error occurred while fetching data'));
        })
      ).subscribe({
        next: (places) =>{
          this.places.set(places);
        },
        error: (error: Error) => {
          this.error.set(error.message);
        },
        complete: () => {
          this.isFetchingData.set(false);
        }
      });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
  }
}
