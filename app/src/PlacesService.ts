/**
 * Created by Vadym Yatsyuk on 20.01.18
 */

import { Injectable } from '@angular/core';

declare let google: any;

@Injectable()
export class PlacesService {
  autocompleteService = new google.maps.places.AutocompleteService();
  detailsService = new google.maps.places.PlacesService(document.createElement("input"));

  get(search: string, countryCode?: string) {
    return new Promise((resolve, reject) => {
      this.autocompleteService.getPlacePredictions({
        input: search,
        componentRestrictions: { country: countryCode || 'de' }
      }, (result, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          resolve(result);
        } else {
          reject(status);
        }
      });
    })
  }

  getDetails(placeId) {
    return new Promise((resolve, reject) => {
      this.detailsService.getDetails({ placeId: placeId }, (result) => {
        resolve(result);
      });
    });
  }
}