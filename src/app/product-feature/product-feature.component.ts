import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { EnterLeaveTop, fadeInOut } from '../internalApp/animations';
import { LoginService } from "../internalApp/login.service";
import { SupportPopupComponent } from '../support-popup/support-popup.component';


@Component({
  selector: 'app-product-feature',
  templateUrl: './product-feature.component.html',
  styleUrls: ['./product-feature.component.css', '../common-style/bootstrap-min.css', '../common-style/font-awesome.css', '../common-style/scroll-animation.css'],
  animations: [
    fadeInOut, EnterLeaveTop
  ]
})
export class ProductFeatureComponent implements OnInit {

  tryFree: string;

  constructor(public dialog: MatDialog, private loginService: LoginService,
    private router: Router) { }

  ngOnInit() {
    // if (this.loginService.getUserInformationFromLocalStorage() != null) {
    //   this.tryFree = "Go to Profile";
    //   this.router.navigate(['/dashBoard']);
    // }
    // else {
    //   this.tryFree = "Try Free!";
    // }



    // Trigger CSS animations on scroll.

    $(function ($) {

      // Function which adds the 'animated' class to any '.animatable' in view
      var doAnimations = function () {

        // Calc current offset and get all animatables
        var offset = $(window).scrollTop() + $(window).height(),
          $animatables = $('.animatable');

        // Unbind scroll handler if we have no animatables
        if ($animatables.length == 0) {
          $(window).off('scroll', doAnimations);
        }

        // Check all animatables and animate them if necessary
        $animatables.each(function (i) {
          var $animatable = $(this);
          if (($animatable.offset().top + $animatable.height() - 20) < offset) {
            $animatable.removeClass('animatable').addClass('animated');
          }
        });

      };

      // Hook doAnimations on scroll, and trigger a scroll
      $(window).on('scroll', doAnimations);
      $(window).trigger('scroll');

    });

    if (Math.random() >= 0.6) {
      setTimeout(() => {
        this.openSupportPopup();
      }, 15000);
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

  openSupportPopup() {
    const dialogRef = this.dialog.open(SupportPopupComponent, {
      width: '70%'
      // data: {
      //   testCaseId,
      //   modifiedBy: this.loginService.getUserInformationFromLocalStorage().userName,
      //   clientProject: this.clientProjectId,
      //   clientOrg: this.organization
      // }
    });
  }

}
