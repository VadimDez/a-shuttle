/**
 * Created by Vadym Yatsyuk on 21.01.18
 */
import { AfterContentInit, AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';
import { PlacesService } from '../PlacesService';

@Component({
  templateUrl: './destination.component.html'
})
export class DestinationComponent implements AfterContentInit {

  @ViewChild('fromInput') fromRef: ElementRef;
  @ViewChild('destinationInput') destinationRef: ElementRef;


  from: string;
  destination: string;
  searchResults: any[];

  constructor(
    params: NavParams,
    public viewCtrl: ViewController,
    private placesService: PlacesService,
  ) {

  }


  ngAfterContentInit() {
    this.subscribeToTheFromChange();
    this.subscribeToTheDestinationChange();

    // this.destinationRef.nativeElement.focus();
  }

  toggleModal(data = null) {
    this.viewCtrl.dismiss(data);
  }

  selectItem(destination: any) {
    this.toggleModal(destination);
  }


  subscribeToTheFromChange() {
    if (!this.fromRef) {
      return;
    }

    Observable.from((this.fromRef as any).input)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(() => {
        if (this.from) {
          this.onSearch(this.from);
        }
      });
  }

  subscribeToTheDestinationChange() {

    if (!this.destinationRef) {
      return;
    }

    Observable.from((this.destinationRef as any).input)
      .debounceTime(300)
      .distinctUntilChanged()
      .subscribe(() => {
        if (this.destination) {
          this.onSearch(this.destination);
        }
      });
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
        this.selectItem(res);
      });
  }
}