import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-walkthrough',
  templateUrl: './app-walkthrough.component.html',
  styleUrls: ['./app-walkthrough.component.css']
})
export class AppWalkthroughComponent implements OnInit {

  tourButtonInterval: any;

  constructor(public router: Router) { }

  ngOnInit() {

    let cookie = this.getCookie('appWalkthroughCookie');
    if (cookie === null) {
      this.tourButtonInterval = setTimeout(this.tourButtonTimer, 2000);
    }
  }

  tourButtonTimer() {
    if (document.getElementById('startTutorialButton').style.display === "block") {
      document.getElementById('startTutorialButton').style.display = "none";
    } else {
      document.getElementById('startTutorialButton').style.display = "block";
    }
  }

  endTourButton() {
    this.setCookie("appWalkthroughCookie", "tutorialTaken", 500);
    document.getElementById('startTutorialButton').style.display = "none";
    clearInterval(this.tourButtonInterval);
  }

  startTour() {

    this.endTourButton();
    document.getElementById('startTutorialButton').style.display = "none";
    this.router.navigate(['/dashBoard'], { queryParams: { appWalkthroughIntro: "ProjectSetup" } });
  }

  setCookie(name: string, value: string, days: number) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  getCookie(name: string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  eraseCookie(name: string) {
    document.cookie = name + '=; Max-Age=-99999999;';
  }

}
