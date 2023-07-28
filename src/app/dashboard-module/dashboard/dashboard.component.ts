import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import { LoginService } from "../../internalApp/login.service"
import { filter, isEmpty } from "lodash";
import { Role } from "../../internalApp/role";
import { UserProfileDetail } from '../../internalApp/user'
import { GraphReportService } from "../../internalApp/graph-report.service"
import { OrgCoverageData } from '../../internalApp/reports';
import introJs from 'intro.js';
import { ActivatedRoute } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { fadeInOut, EnterLeave, EnterLeaveTop } from '../../internalApp/animations';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    fadeInOut,
    EnterLeave,
    EnterLeaveTop
  ]
})
export class DashboardComponent implements OnInit {

  userFullName = "";
  userEmails: string[] = [];
  roles: Role[];
  userProfileDetail: UserProfileDetail;
  userProfileDetailOptimized: UserProfileDetail;
  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  dataLoading = false;

  screenHeight: number;
  screenWidth: number;
  colspan: number;
  colspanGraph: number;

  tourButtonInterval: any;

  intro = introJs();
  paramintroJs: string = "";

  constructor(private loginService: LoginService, private activatedRoute: ActivatedRoute,
    private reportService: GraphReportService, public router: Router) {

    // override the route reuse strategy
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        // trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
        // if you need to scroll back to top, here is the right place
        window.scrollTo(0, 0);
      }
    });

  }

  ngOnInit() {
    this.showInfo();
    this.getOrgWiseDashboardData(this.organization);
    this.getScreenSize();

    // this.tourButtonInterval = setInterval(this.tourButtonTimer, 15000);
    if (this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro') != null) {
      document.getElementById('startTutorialComponentId').style.display = "none";
      this.paramintroJs = this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro');
    }

    // Get URL param and start Tutorial Accordingly
    if (this.paramintroJs === "ProjectSetup") {
      if (this.isAdminRights()) {
        this.tourButtonInterval = setTimeout(this.startProjectSetupTour.bind(this), 1000);
      } else {
        if (this.canShowTestCaseMenu()) {
          this.tourButtonInterval = setTimeout(this.startTestCaseDefinitionsTour.bind(this), 1000);
        } else {
          this.tourButtonInterval = setTimeout(this.startCoverageGraphTour.bind(this), 1000);
        }
      }
    } else if (this.paramintroJs === "TestCaseDefinitions") {
      this.tourButtonInterval = setTimeout(this.startTestCaseDefinitionsTour.bind(this), 1000);
    } else if (this.paramintroJs === "AutomationMapping") {
      this.tourButtonInterval = setTimeout(this.startAutomationMappingTour.bind(this), 1000);
    } else if (this.paramintroJs === "ReleaseMapping") {
      this.tourButtonInterval = setTimeout(this.startReleaseMappingTour.bind(this), 1000);
    } else if (this.paramintroJs === "CoverageGraph") {
      this.tourButtonInterval = setTimeout(this.startCoverageGraphTour.bind(this), 1000);
    }
  }


  // App Walkthrough Tutorial Start /////////////////////////////
  startProjectSetupTour() {

    let currentRouter = this.router;
    document.getElementById('introSetupButtonTitle').click();

    this.intro.setOptions({
      steps: [
        {
          element: '#introSetupButtonTitle',
          intro: 'Start with configuring the project by clicking on Setup and then Project Setup',
          position: 'left',
          tooltipclass: 'forLastStep'
        }
      ],
      showBullets: true,
      showButtons: true,
      exitOnOverlayClick: false,
      keyboardNavigation: true,
      disableInteraction: true,
      showProgress: false,
      hideNext: true,
      hidePrev: true
    });
    this.intro.setOption('doneLabel', 'Go to Project Setup').start().oncomplete(function () {
      currentRouter.navigate(['/app/projectSetup'], { queryParams: { appWalkthroughIntro: true } });
    });

  }

  startTestCaseDefinitionsTour() {

    let currentRouter = this.router;

    this.intro.setOptions({
      steps: [
        {
          element: '#TestCaseDefinitionsTitle',
          intro: 'Start your Pintailer Journey by Importing Test Cases, Test Steps and Execution Results into Pintailer.',
          position: 'left',
          tooltipclass: 'forLastStep'
        }
      ],
      showBullets: true,
      showButtons: true,
      exitOnOverlayClick: false,
      keyboardNavigation: true,
      disableInteraction: true,
      showProgress: false,
      hideNext: true,
      hidePrev: true
    });
    this.intro.setOption('doneLabel', 'Go to TestCase Definitons').start().oncomplete(function () {
      currentRouter.navigate(['/app/testCaseDefinition'], { queryParams: { appWalkthroughIntro: true } });
    });

  }

  startAutomationMappingTour() {

    let currentRouter = this.router;

    this.intro.setOptions({
      steps: [
        {
          element: '#AutomationMappingTitle',
          intro: 'After Importing Test Cases and Test Steps, establish the Relataionship between them from our Interactive Mapping UI.',
          position: 'right'
        }
      ],
      showBullets: true,
      showButtons: true,
      exitOnOverlayClick: false,
      keyboardNavigation: true,
      disableInteraction: true,
      showProgress: false,
      hideNext: true,
      hidePrev: true
    });
    this.intro.setOption('doneLabel', 'Next page').start().oncomplete(function () {
      currentRouter.navigate(['/app/testCaseMapping'], { queryParams: { appWalkthroughIntro: true } });
    });

  }

  startReleaseMappingTour() {

    let currentRouter = this.router;

    this.intro.setOptions({
      steps: [
        {
          element: '#ReleaseMappingTitle',
          intro: 'Now just Associate Test Cases to a particular Release Number.',
          position: 'right'
        }
      ],
      showBullets: true,
      showButtons: true,
      exitOnOverlayClick: false,
      keyboardNavigation: true,
      disableInteraction: true,
      showProgress: false,
      hideNext: true,
      hidePrev: true
    });
    this.intro.setOption('doneLabel', 'Next page').start().oncomplete(function () {
      currentRouter.navigate(['/app/releaseMapping'], { queryParams: { appWalkthroughIntro: true } });
    });

  }

  startCoverageGraphTour() {

    let currentRouter = this.router;

    this.intro.setOptions({
      steps: [
        {
          element: '#CoverageGraphTitle',
          intro: 'Visualize your Organization\'s Coverage and Execution Reports',
          position: 'right'
        }
      ],
      showBullets: true,
      showButtons: true,
      exitOnOverlayClick: false,
      keyboardNavigation: true,
      disableInteraction: true,
      showProgress: false,
      hideNext: true,
      hidePrev: true
    });
    this.intro.setOption('doneLabel', 'Next page').start().oncomplete(function () {
      currentRouter.navigate(['/app/graphReport'], { queryParams: { appWalkthroughIntro: true } });
    });

  }
  // App Walkthrough Tutorial End /////////////////////////////

  ngOnDestroy() {
    this.intro.exit();
  }

  graphData: OrgCoverageData[] = [];

  createDashBoardReport() {
    var svg = d3.select(".dashboardChart").select("svg"),
      margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

    svg.selectAll("*").remove();

    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var z = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    // d3.json("http://localhost:8888/index.php?r=emp/gettestCases", function (d) {

    let d = this.graphData;

    if (this.graphData.length === 0) {
      g.append("g").append("text")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("No Test Cases found for selected Organization");
    }
    else {

      var ymaxdomain = d3.max(d, function (d) { return parseInt(d.testCasesCount); });
      x.domain(d.map(function (d) { return d.project }));
      y.domain([0, ymaxdomain]);

      let divide = height / ymaxdomain;

      var x1 = d3.scaleBand().rangeRound([0, x.bandwidth()]);
      x1.domain(d.map(function (d) { return d.type; }));

      g.selectAll(".bar").style("fill", "steelblue").style("stroke", "black")
        .data(d)
        .enter().append("rect").on("mouseover", handleMouseOver).on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut)
        .attr("x", function (d, i) { return (x(d.project) + x1(d.type)); })

        .attr("y", function (d) { return (ymaxdomain - parseInt(d.testCasesCount)) * divide })
        .attr("width", x1.bandwidth())
        .attr("height", function (d) { return parseInt(d.testCasesCount) * divide })
        .attr("fill", function (d, i) { return "" + z(d.type); });

      g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("x", 0).attr("y", -10)
        // .attr("y", y(y.ticks().pop()) - 20)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Test Cases");

      // start legend chart
      var keys = ["Total", "Automatable", "Automation Done", "Automation Pending", "Non-Automatable"];

      var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(50," + i * 20 + ")"; });

      legend.append("rect")
        .attr("x", width - 42)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", function (d, i) { return "" + z(d); });

      legend.append("text")
        .attr("x", width - 50)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });

      // end legend chart

      d3.select(".tooltip-dashboard-div").remove();
    }

    d3.select(".tooltip-dashboard-div").remove();

    // define tooltip
    var tooltip = d3.select(".dashboardChart") // select element in the DOM with id 'chart'
      .append('div').attr("class", "tooltip-dashboard-div").classed('tooltip', true).style('position', 'absolute').style('background-color', 'whitesmoke') // append a div element to the element we've selected    
      .style('pointer-events', 'none').style('box-shadow', '4px 4px 10px rgba(0, 0, 0, 0.4)')
    tooltip.append('div') // add divs to the tooltip defined above 
      .attr('class', 'label'); // add class 'label' on the selection                

    function handleMouseOver(d: any) {

      // filters go in defs element
      var defs = svg.append("defs");

      // create filter with id #drop-shadow
      // height=130% so that the shadow is not clipped
      var filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");

      // SourceAlpha refers to opacity of graphic that this filter will be applied to
      // convolve that with a Gaussian with standard deviation 3 and store result
      // in blur
      filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 5)
        .attr("result", "blur");

      // translate output of Gaussian blur to the right and downwards with 2px
      // store result in offsetBlur
      filter.append("feOffset")
        .attr("in", "blur")
        .attr("result", "offsetBlur");

      // d3.select(this).style("filter", "url(#drop-shadow)")


      d3.select(this).style("stroke", "#3d5061");

      let toolText = "###########";

      tooltip.select('.label').html(d.type + ": " + d.testCasesCount); // set current label

      tooltip.style('display', 'block') // set display   

      // tooltip.style('top', (d3.event.pageX + 10) + 'px'); // always 10px below the cursor
      // tooltip.style('left', (d3.event.pageY + 10) + 'px'); // always 10px to the right of the mouse

    }

    function handleMouseOut(d) {
      d3.select(this)
        .style("transform", "scale(1)").style("stroke", "white")

      tooltip.style('display', 'none'); // hide tooltip for that element

    }

    function handleMouseMove(d) {

      tooltip.style('top', (d3.event.layerY + 65) + 'px');
      tooltip.style('left', (d3.event.layerX + 20) + 'px');
    }

  }

  canShowTestCaseMenu() {
    // this.roles =
    //   this.loginService.getUserInformationFromLocalStorage() != null
    //     ? this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles
    //     : [];
    this.roles = [];
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles.forEach(element => {
        let newRole = new Role();
        newRole.application = element.substr(0, element.indexOf('-'));
        newRole.role = element.substr(element.indexOf('-') + 1, element.length - 1);
        this.roles.push(newRole);
      });
    }

    const roleObj = filter(this.roles, function (o) {
      return (
        (o.application == "Test Case Management" && o.role == "Admin") ||
        (o.application == "Test Case Management" && o.role == "Tester")
      );
    });
    if (!isEmpty(roleObj)) {
      return true;
    }
    return false;
  }

  showInfo(): void {
    this.userProfileDetail = this.loginService.getUserInformationFromLocalStorage();
    this.userProfileDetailOptimized = this.loginService.getUserInformationFromLocalStorage();
    this.refactorUserData();

    // Modifing the user name to have first and last name in cappital letter
    let dotPos = this.userProfileDetail.userName.indexOf(".");
    let toChange = this.userProfileDetail.userName;
    let result = this.setCharAt(toChange, dotPos + 1, toChange.charAt(dotPos + 1).toUpperCase());
    result = result.replace(".", " ");
    result = result.replace(toChange.charAt(0), toChange.charAt(0).toUpperCase());
    this.userFullName = result;
  }

  setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substr(0, index) + chr + str.substr(index + 1);
  }

  refactorUserData() {
    if (this.userProfileDetailOptimized.email != null) {
      this.userEmails = this.userProfileDetailOptimized.email.split(',');
      // console.log("## " + this.userEmails)
    }

  }

  canShowReportMenuForTesters() {
    // this.roles =
    //   this.loginService.getUserInformationFromLocalStorage() != null
    //     ? this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles
    //     : [];
    this.roles = [];
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles.forEach(element => {
        let newRole = new Role();
        newRole.application = element.substr(0, element.indexOf('-'));
        newRole.role = element.substr(element.indexOf('-') + 1, element.length - 1);
        this.roles.push(newRole);
      });
    }

    const roleObj = filter(this.roles, function (o) {
      return (
        (o.application == "Test Case Management" && o.role == "Admin") ||
        (o.application == "Test Case Management" && o.role == "Tester") ||
        (o.application == "Test Case Management" && o.role == "Report Viewer")
      );
    });
    if (!isEmpty(roleObj)) {
      return true;
    }
    return false;
  }

  getOrgWiseDashboardData(orgName: string) {
    this.dataLoading = true;
    this.organization = orgName;
    this.reportService.getOrgCoverageDashboard()
      .subscribe(
        result => {
          if (result != undefined) {
            this.graphData = result;
            this.createDashBoardReport();
            this.dataLoading = false;
          } else {
            this.dataLoading = false;
          }
        })
  }

  getScreenSize() {
    this.screenHeight = screen.height;
    this.screenWidth = screen.width;
    if (this.screenWidth < 1023) {
      this.colspan = 4;
      this.colspanGraph = 4;
    } else {
      this.colspan = 1;
      this.colspanGraph = 2;
    }

  }

  isAdminRights() {
    // this.roles =
    //   this.loginService.getUserInformationFromLocalStorage() != null
    //     ? this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles
    //     : [];
    this.roles = [];
    if (this.loginService.getUserInformationFromLocalStorage() != null) {
      this.loginService.getUserInformationFromLocalStorage().userApplicationsAndRoles.forEach(element => {
        let newRole = new Role();
        newRole.application = element.substr(0, element.indexOf('-'));
        newRole.role = element.substr(element.indexOf('-') + 1, element.length - 1);
        this.roles.push(newRole);
      });
    }

    const roleObj = filter(this.roles, function (o) {
      return (
        (o.application == "Test Case Management" && o.role == "Admin")
      );
    });
    if (!isEmpty(roleObj)) {
      return true;
    }
    return false;
  }

}
