import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController, NavController, Platform, TextInput } from 'ionic-angular';
import {
  GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, MyLocation, Geocoder,
  Marker, Polyline, LatLngBounds, LatLng
} from '@ionic-native/google-maps';
import { PlacesService } from '../../PlacesService';
import {Observable} from 'rxjs/Rx';
import { DestinationComponent } from '../../destination/destination.component';

declare const google: any;
declare const plugin: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
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

        zoom: 18,
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

        this.map.getMyLocation().then((location: MyLocation) =>{
          this.currentLocation = location;

          this.map.setCameraTarget(location.latLng);
        });


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
    console.log('asdasd');
    console.log(JSON.stringify(this.map.getCameraPosition().target));

  }

  onClickFrom() {
    this.isEnteringDestination = true;
  }

  onClickDestination() {
    this.presentDestinationModal();
  }

  calculateAndDisplayRoute() {
    this.directionsService.route({
      origin: this.currentLocation.latLng,
      destination: this.destinationLocation,
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (response.status === 'OK') {
        let points = [];
        response.routes.forEach(route => {
          Array.prototype.push.apply(points, route.overview_path);
          // console.log(JSON.stringify(route));
          // route.legs.forEach(leg => {
          //   points.push(leg.start_location);
          //   points.push(leg.end_location);
          // });
        });

        // console.log(JSON.stringify(points));


        let p = this.drawPolyline([
          this.currentLocation.latLng,
          this.destinationLocation
        ]).then((polyline: Polyline) => {
          var latLngBounds: LatLngBounds = new plugin.google.maps.LatLngBounds();
          latLngBounds.extend(this.currentLocation.latLng);
          latLngBounds.extend(this.destinationLocation);

          console.log('fitBonds');
          console.log((this.map as any).fitBonds);

          // console.log(JSON.stringify(this.map.getCameraPosition()));
          // console.log(JSON.stringify(this.map.getCameraBearing()));
          this.map.setCameraTarget(latLngBounds.getCenter());

          // this.map.setCameraBearing({
          //   "target": latLngBounds.getCenter(),
          //   "southwest": latLngBounds.southwest,
          //   "northeast": latLngBounds.northeast
          // });

          this.map.setCameraZoom(12);
        });
        // this.map.setBounds()
      } else {
        alert('Directions request failed due to ' + status);
        console.log('Directions request failed due to ' + status);
      }
    });
  }

  drawPolyline(points) {
    return this.map.addPolyline({
      points,
      color : '#210a36',
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
    }).then((marker: Marker) => {
    });
  }
}
