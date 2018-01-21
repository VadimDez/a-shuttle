/**
 * Created by Vadym Yatsyuk on 21.01.18
 */

import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  templateUrl: './success-modal.component.html'
})
export class SuccessModalComponent {
  constructor(
    params: NavParams,
    public viewCtrl: ViewController
  ) {}

  dismiss() {
    this.viewCtrl.dismiss();
  }
}