import { Component, OnInit } from "@angular/core";
import { fadeInOut, EnterLeaveTop } from '../internalApp/animations';
import { Router } from "@angular/router";

@Component({
  selector: "app-pricing",
  templateUrl: "./pricing.componentNew.html",
  styleUrls: ["./pricing.componentNew.css", '../common-style/bootstrap-min.css', '../common-style/font-awesome.css'],
  animations: [
    fadeInOut, EnterLeaveTop
  ]
})
export class PricingComponent implements OnInit {
  numOfUsers: number;

  value = 0;

  constructor(public router: Router) { }

  ngOnInit() { }

  userNumEdited(event: any) {
    let number = 0;
    number = event.target.value;
    event.target.value = Math.ceil(number);
    this.numOfUsers = Math.ceil(number);
  }

}
