import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorService = inject(ErrorService);
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchData('http://localhost:3000/places', 'An error occurred while fetching available places');  
  }

  loadUserPlaces() {
    return this.fetchData('http://localhost:3000/user-places', 'An error occurred while fetching your favourite places')
    .pipe(
      tap({
        next: (userPlaces) => {this.userPlaces.set(userPlaces)}
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if(prevPlaces.some(p => p.id === place.id)) {
      this.userPlaces.set([...prevPlaces, place]);
    }

    this.userPlaces.update(prevPlaces => [...prevPlaces, place]);

    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id,
    }).pipe(
      catchError(error => {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('An error occurred while adding the place to your favourite places');
        return throwError(() => new Error('An error occurred while adding the place to your favourite places'));
      })
    );
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();

    if(prevPlaces.some(p => p.id === place.id)) {
      this.userPlaces.set(prevPlaces.filter(p => p.id !== place.id));
    }

    return this.httpClient.delete(`http://localhost:3000/user-places/`+place.id).pipe(
      catchError(error => {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('An error occurred while removing the place from your favourite places');
        return throwError(() => new Error('An error occurred while removing the place from your favourite places'));
      })
    );
  }

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
