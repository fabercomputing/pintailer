import { Component, OnInit } from '@angular/core';

import { LoginService } from "../internalApp/login.service";
import { Router } from '@angular/router';
import { fadeInOut, EnterLeaveTop } from '../internalApp/animations';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css', './landing-page-style.css', '../common-style/bootstrap-min.css', '../common-style/font-awesome.css'],
  animations: [
    fadeInOut, EnterLeaveTop
  ]
})
export class LandingPageComponent implements OnInit {

  tryFree: string;

  constructor(private loginService: LoginService,
    private router: Router) { }

  ngOnInit() {
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      this.tryFree = "Go to Profile";
      this.router.navigate(['/dashBoard']);
    }
    else {
      this.tryFree = "Try Free!";
    }

  }

  freeTryButton() {
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      this.router.navigate(['/dashBoard']);
    }
    else {
      this.router.navigate(['/support']);
    }
  }

  scrollToTop() {
    window.scroll({
      behavior: 'smooth',
      left: 0,
      top: 0
    });
  }

}
