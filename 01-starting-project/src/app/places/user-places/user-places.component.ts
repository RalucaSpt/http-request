import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Place } from '../place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit{
  isFetchingData = signal<boolean>(false);
  error = signal<string | null>(null);
  places = signal<Place[] | undefined>(undefined);

  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
    
    ngOnInit(): void {
        this.isFetchingData.set(true);
        const subscription = this.httpClient.get<any>('http://localhost:3000/user-places').pipe(
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
  
    onSelectPlace(selectedPlace: Place) {
      this.httpClient.put('http://localhost:3000/user-places', {
        placeId: selectedPlace.id
      }).subscribe({
        next: (resData) => {
          console.log(resData);
        }
      });
    }
}
