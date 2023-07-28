import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  code:string;
  state:string;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    // this.router.navigate(['features']);
    this.route.queryParams.subscribe(params => {
      console.log(params);
    });
  }
}
