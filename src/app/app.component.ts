import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Pintailer';

  ngOnInit() {
    // on load remove the loader
    document.onreadystatechange = function () {
      document.getElementById('loading-image').style.visibility = "hidden";
    }
    // Message on console
    var cssRule =
      "color: #7e99b0;" +
      "font-size: 15px;" +
      "font-weight: bold;";
    setTimeout(console.log.bind(console, '%c   ▀▄   ▄▀\n  ▄█▀███▀█▄\n █▀███████▀█\n █ █▀▀▀▀▀█ █\n    ▀▀ ▀▀\n┌───────────────────────────────────────────────────────────────────────┐\n│ Found a security issue/bug? Please report it to support@pintailer.com │\n┴───────────────────────────────────────────────────────────────────────┴', cssRule), 0);
  }
}