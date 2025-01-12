import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

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

  private destroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);
    
    ngOnInit(): void {
        this.isFetchingData.set(true);
        const subscription = this.placesService.loadUserPlaces().subscribe({
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
      const subscription = this.placesService.addPlaceToUserPlaces(selectedPlace.id).subscribe({
        next: (resData) => {
          console.log(resData);
        }
      }); 

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
    }
}
