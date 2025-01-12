import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchData('http://localhost:3000/places', 'An error occurred while fetching available places');  }

  loadUserPlaces() {
    return this.fetchData('http://localhost:3000/user-places', 'An error occurred while fetching your favourite places');
  }

  addPlaceToUserPlaces(placeId: string) {
    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId
    })
  }

  removeUserPlace(place: Place) {}

  fetchData(url: string, errorMessage: string) {
    return this.httpClient.get<any>(url).pipe(
      map((resData) =>  resData.places),
      catchError((error) => {
        console.log(error);
        return throwError(() => new Error(errorMessage));
      })
    )
  }
}
