import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, MyLocation, Geocoder } from '@ionic-native/google-maps';
import { PlacesService } from '../../PlacesService';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: GoogleMap;
  location: MyLocation;
  @ViewChild('map') mapElement: ElementRef;

  from: string;
  to: string;

  constructor(
    public navCtrl: NavController,
    private googleMaps: GoogleMaps,
    private platform: Platform,
    private geocoder: Geocoder,
    private placesService: PlacesService
  ) {
    this.platform.ready().then(() => {
      this.loadMap();
    });

  }

  loadMap() {

    let mapOptions: GoogleMapOptions = {
      controls: {
        myLocationButton: true,
        zoom: true
      },
      gestures: {
        scroll: true,
        tilt: true,
        zoom: true,
        rotate: true
      },
      camera: {

        zoom: 18,
        // tilt: 30
      }
    };

    this.map = GoogleMaps.create(this.mapElement.nativeElement, mapOptions);

    // Wait the MAP_READY before using any methods.
    this.map.on(GoogleMapsEvent.MAP_READY)
      .subscribe(() => {
        console.log('Map is ready!');

        this.map.getMyLocation().then((location: MyLocation) =>{
          console.log('sucess location found');

          this.map.setCameraTarget(location.latLng)

          // this.AnimateToLoc(location);
          // this.location = location;


        })

        // Now you can use all methods safely.
        // this.map.addMarker({
        //   title: 'Ionic',
        //   icon: 'blue',
        //   animation: 'DROP',
        //   position: {
        //     lat: 43.0741904,
        //     lng: -89.3809802
        //   }
        // })
        //   .then(marker => {
        //     marker.on(GoogleMapsEvent.MARKER_CLICK)
        //       .subscribe(() => {
        //         alert('clicked');
        //       });
        //   });

      });


    this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK)
      .subscribe(() => {

      });
  }

  proceed() {
    console.log('asdasd');
    console.log(JSON.stringify(this.map.getCameraPosition().target));

  }

  onClickFrom() {
console.log('onClickFrom');
  }

  onClickTo() {
  console.log('onClickTo');

  }
}
