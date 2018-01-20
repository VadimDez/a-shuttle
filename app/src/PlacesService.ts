/**
 * Created by Vadym Yatsyuk on 20.01.18
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PlacesService {
  static URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/output?parameters';
  static key = 'AIzaSyBSZ0zfL_F4_th4VHQTTrpj5Sr4G8lj4kk';

  constructor(private http: HttpClient) {}

  get(search: string) {
    this.http.get(`${ PlacesService.URL }?input=${ search }&key=${ PlacesService.key }`);
  }
}