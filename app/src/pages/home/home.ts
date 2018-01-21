import { Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController, NavController, Platform } from 'ionic-angular';
import {
  GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, MyLocation,
  Marker, Polyline, LatLngBounds, LatLng
} from '@ionic-native/google-maps';
import { DestinationComponent } from '../../destination/destination.component';
import { SuccessModalComponent } from '../../success/success-modal.component';

declare const google: any;
declare const plugin: any;

type RouteResponse = {
  geocoded_waypoints: any,
  routes: {
    0: {
      bounds: {
        "south": number,
        "west": number,
        "north": number,
        "east": number
      },
      copyrights: any,
      legs: any,
      overview_polyline: any,
      summary: any,
      warnings: any,
      waypoint_order: any,
      overview_path: any
    }
  },
  status: any,
  request: any
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  static DEFAULT_ZOOM = 18;

  map: GoogleMap;
  location: MyLocation;
  @ViewChild('map') mapElement: ElementRef;
  isEnteringDestination: boolean = false;
  isDestinationSet: boolean = false;
  directionsService: any;
  directionsDisplay: any;

  from: string;
  destination: string;
  destinationLocation: any;
  currentLocation: MyLocation;

  constructor(
    public navCtrl: NavController,
    private googleMaps: GoogleMaps,
    private platform: Platform,
    public modalCtrl: ModalController
  ) {
    this.platform.ready().then(() => {
      this.directionsService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer({});
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
        zoom: HomePage.DEFAULT_ZOOM,
        // tilt: 30
      },
      'styles': [
        {
          featureType: "all",
          stylers: [
            { saturation: -80 }
          ]
        },{
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [
            { hue: "#00ffee" },
            { saturation: 50 }
          ]
        },{
          featureType: "poi.business",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        }
      ],
    };

    this.map = GoogleMaps.create(this.mapElement.nativeElement, mapOptions);


    // Wait the MAP_READY before using any methods.
    this.map.on(GoogleMapsEvent.MAP_READY)
      .subscribe(() => {
        // this.directionsDisplay.setMap(this.map);

        this.setMapToCurrentLocation();


        // {"lat":48.135101318359375,"lng":11.581999778747559}
        // {"lat":48.2187997,"lng":11.624707199999989}

        // this.drawPolyline([
        //   {"lat":48.135101318359375,"lng":11.581999778747559},
        //   {"lat":48.2187997,"lng":11.624707199999989}
        // ])
      });


    this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK)
      .subscribe(() => {

      });
  }

  proceed() {
    let successModal = this.modalCtrl.create(SuccessModalComponent);
    successModal.present();

    successModal.onDidDismiss(() => {
      this.reset();
    });
  }

  reset() {
    this.map.clear();
    this.isEnteringDestination = false;
    this.isDestinationSet = false;

    this.resetMap();
  }

  onClickFrom() {
    this.isEnteringDestination = true;
  }

  onClickDestination() {
    this.presentDestinationModal();
  }

  calculateAndDisplayRoute() {
    this.getRoute()
      .then((response: RouteResponse) => {
        let points = [
          this.currentLocation.latLng,
          ...response.routes[0].overview_path.map(v => new LatLng(v.lat(), v.lng()))
        ];


        this.drawPolyline(points).then((polyline: Polyline) => {
          this.map.moveCamera({
            target: points,
            padding: 200
          });
        });
      });
  }

  getRoute() {
    return new Promise((resolve, reject) => {
      this.directionsService.route({
        origin: this.currentLocation.latLng,
        destination: this.destinationLocation,
        travelMode: 'DRIVING'
      }, (response, status) => {
        if (response.status === 'OK') {
          resolve(response);
        } else {
          console.log('Directions request failed due to ' + status);
          reject(response);
        }
      });
    });
  }

  drawPolyline(points) {
    return this.map.addPolyline({
      points,
      color : '#F20030',
      width: 10,
      geodesic: true
    });
  }

  presentDestinationModal() {
    let profileModal = this.modalCtrl.create(DestinationComponent, {});
    profileModal.present();

    profileModal.onDidDismiss((res) => {
      if (res) {
        this.onSelectItem(res);
      }
    })
  }

  onSelectItem(res) {
    this.destination = res.formatted_address;
    this.destinationLocation = {
      lat: res.geometry.location.lat(),
      lng: res.geometry.location.lng()
    };

    this.isEnteringDestination = false;
    this.isDestinationSet = true;

    this.fixHeight();

    this.addDestinationMarker();

    this.calculateAndDisplayRoute();
  }

  /**
   * Fix height due to keyboard
   */
  fixHeight() {
    this.map.refreshLayout();
    this.mapElement.nativeElement.style.height = '100%';
  }

  addDestinationMarker() {
    this.map.addMarker({
      title: '',
      icon: 'red',
      animation: 'DROP',
      position: this.destinationLocation,
    });
  }

  resetMap() {
    this.setMapToCurrentLocation();
    this.map.setCameraZoom(HomePage.DEFAULT_ZOOM);
  }

  setMapToCurrentLocation() {
    this.map.getMyLocation().then((location: MyLocation) =>{
      this.currentLocation = location;

      this.map.setCameraTarget(location.latLng);
    });
  }
}
