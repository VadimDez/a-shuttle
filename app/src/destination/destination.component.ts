/**
 * Created by Vadym Yatsyuk on 21.01.18
 */
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

@Component({
  templateUrl: './destination.component.html'
})
export class DestinationComponent {

  constructor(params: NavParams) {
    console.log('UserId', params.get('userId'));
  }

}