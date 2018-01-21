import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController, NavController, Platform, TextInput } from 'ionic-angular';
import {
  GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, MyLocation, Geocoder,
  Marker
} from '@ionic-native/google-maps';
import { PlacesService } from '../../PlacesService';
import {Observable} from 'rxjs/Rx';
import { DestinationComponent } from '../../destination/destination.component';

declare const google: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements AfterViewInit {
  map: GoogleMap;
  location: MyLocation;
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('fromInput') fromRef: ElementRef;
  @ViewChild('destinationInput') destinationRef: ElementRef;
  isEnteringDestination: boolean = false;
  isDestinationSet: boolean = false;
  directionsService: any;
  directionsDisplay: any;

  from: string;
  destination: string;
  destinationLocation: any;
  currentLocation: MyLocation;

  searchResults: any[];

  constructor(
    public navCtrl: NavController,
    private googleMaps: GoogleMaps,
    private platform: Platform,
    private geocoder: Geocoder,
    private placesService: PlacesService,
    public modalCtrl: ModalController
  ) {
    this.platform.ready().then(() => {
      this.directionsService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer({});
      console.log(JSON.stringify(google.maps.DirectionsRenderer));
      this.loadMap();
    });
  }

  ngAfterViewInit() {
    this.subscribeToTheFromChange();
    this.subscribeToTheDestinationChange();
  }

  subscribeToTheFromChange() {
    if (!this.fromRef) {
      return;
    }

    Observable.from((this.fromRef as any).input)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(() => {
        this.onSearch(this.from);
      });
  }

  subscribeToTheDestinationChange() {

    console.log(this.destinationRef.nativeElement);
    if (!this.destinationRef) {
      return;
    }

    Observable.from((this.destinationRef as any).input)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(() => {
        this.onSearch(this.destination);
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

        console.log(JSON.stringify(this.directionsDisplay));
        // this.directionsDisplay.setMap(this.map);

        this.map.getMyLocation().then((location: MyLocation) =>{
          console.log('sucess location found');
          this.currentLocation = location;

          this.map.setCameraTarget(location.latLng);
        });
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
    // this.isEnteringDestination = true;
    // this.destinationRef.nativeElement.blur();
    this.presentDestinationModal();
  }

  /**
   * Search
   * @param {string} string
   */
  onSearch(string: string) {
    this.placesService.get(string)
      .then((res: any[]) => {
        this.searchResults = res;
      });
  }

  selectItemById(id: string) {
    this.placesService.getDetails(id)
      .then((res: any) => {
        this.destination = res.formatted_address;
        this.destinationLocation = {
          lat: res.geometry.location.lat(),
          lng: res.geometry.location.lng()
        };

        this.isEnteringDestination = false;
        this.isDestinationSet = true;
        this.map.refreshLayout();

        this.mapElement.nativeElement.style.height = '100%';

        this.map.addMarker({
          title: '',
          animation: 'DROP',
          position: this.destinationLocation,
        }).then((marker: Marker) => {
        });
      });
  }

  calculateAndDisplayRoute() {
    this.directionsService.route({
      origin: this.currentLocation.latLng,
      destination: this.destinationLocation,
      travelMode: 'DRIVING'
    }, function(response, status) {
      if (status === 'OK') {
        this.directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  presentDestinationModal() {
    let profileModal = this.modalCtrl.create(DestinationComponent, { userId: 8675309 });
    profileModal.present();
  }
}
