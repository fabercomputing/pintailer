import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from "d3";
import { ClientProject } from '../client-project'
import { ClientProjectService } from '../client-project.service'
import { LoginService } from "../login.service"
import { GraphReportService } from "../graph-report.service"
import { Reports } from '../reports';
import { TestcaseDefinitionService } from '../testcase-definition.service';
import { TestCaseDefinition } from '../testcase-definition';
import { ModuleService } from '../module.service'
import { Module } from '../module';
import { EnvironmentService } from "../environment.service";
import { Environment } from "../environment";
import { Release } from "../release";
import { ReleaseMappingService } from '../release-mapping.service'
import { ExecutionReport } from '../reports';
import { ExecutionData } from '../reports';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import introJs from 'intro.js';
import { Router, NavigationEnd } from '@angular/router';
import { CommonService } from '../common.service'
import * as html2canvas from 'html2canvas';
import { MatDialog } from '@angular/material';
import { ModuleSelectionComponent } from '../module-selection/module-selection.component';
declare var jsPDF: any;

@Component({
  selector: 'app-graph-report',
  templateUrl: './graph-report.component.html',
  styleUrls: ['./graph-report.component.css']
})
export class GraphReportComponent implements OnInit {

  intro = introJs();
  paramintroJs: string = "";
  tourButtonInterval: any;
  tourEnd = false;

  constructor(
    private dialog: MatDialog,
    private commonService: CommonService,
    private clientProjectService: ClientProjectService,
    private moduleService: ModuleService,
    private loginService: LoginService,
    private reportService: GraphReportService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private releaseMappingService: ReleaseMappingService,
    private environmentService: EnvironmentService,
    private testcaseDefinitionService: TestcaseDefinitionService
  ) {
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

  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;

  paramProject: string = "";
  executionParam: string = "";
  tagParam: string = "";
  envParam: string = "";
  releaseParam: string = "";
  moduleParam: string = "";
  moduleNameParam: string = "";

  ngOnInit() {
    if (this.activatedRoute.snapshot.queryParamMap.get('project') != null) {
      this.paramProject = this.activatedRoute.snapshot.queryParamMap.get('project');
    }
    if (this.activatedRoute.snapshot.queryParamMap.get('execution') != null) {
      this.executionParam = this.activatedRoute.snapshot.queryParamMap.get('execution');
    }
    if (this.activatedRoute.snapshot.queryParamMap.get('tag') != null) {
      this.tagParam = this.activatedRoute.snapshot.queryParamMap.get('tag');
    }
    if (this.activatedRoute.snapshot.queryParamMap.get('env') != null) {
      this.envParam = this.activatedRoute.snapshot.queryParamMap.get('env');
    }
    if (this.activatedRoute.snapshot.queryParamMap.get('release') != null) {
      this.releaseParam = this.activatedRoute.snapshot.queryParamMap.get('release');
    }
    if (this.activatedRoute.snapshot.queryParamMap.get('module') != null) {
      this.moduleParam = this.activatedRoute.snapshot.queryParamMap.get('module');
    }
    if (this.activatedRoute.snapshot.queryParamMap.get('moduleName') != null) {
      this.moduleNameParam = this.activatedRoute.snapshot.queryParamMap.get('moduleName');
    }

    if (this.executionParam === "true") {
      this.executionReportMode = true;
    } else {
      this.executionReportMode = false;
    }

    if (this.tagParam != "") {
      this.selectedtag = this.tagParam;
    } else {
      this.selectedtag = "ALL";
    }
    if (this.envParam != "") {
      this.selectedEnvironment = parseInt(this.envParam);
    } else {
      this.selectedEnvironment = 0;
    }

    if (this.releaseParam != "") {
      this.selectedRelease = parseInt(this.releaseParam);
    } else {
      this.selectedEnvironment = 0;
    }

    if (this.moduleParam != "") {
      this.selectedModule = parseInt(this.moduleParam);
    } else {
      this.selectedModule = 0;
    }

    if (this.moduleNameParam != "") {
      this.selectedModuleName = this.moduleNameParam;
    } else {
      this.selectedModuleName = "No Module Selected";
    }

    this.getProjectsByOrganizationName(this.moduleNameParam);
    this.generateCoverageGraph()
    this.generateCoverageTable()
    this.getAllTagsList();
    this.getAllEnvInfo();
    // this.getModuleHierarchy();
    d3.select("#current-page-header").text("Automation Coverage Report")

    // this.tourButtonInterval = setInterval(this.tourButtonTimer, 15000);
    if (this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro') != null) {
      this.paramintroJs = this.activatedRoute.snapshot.queryParamMap.get('appWalkthroughIntro');
    }

    if (this.paramintroJs === "true") {
      this.tourButtonInterval = setTimeout(this.startCoverageTour.bind(this), 1000);
    } else if (this.paramintroJs === "executionTour") {
      this.tourButtonInterval = setTimeout(this.startExecutionTour.bind(this), 1000);
      this.executionReportMode = true;
    }

  }

  startCoverageTour() {

    let currentRouter = this.router;
    let currentTourEnd = this.tourEnd;

    this.intro.setOptions({
      steps: [
        {
          element: '#introProjectTitle',
          intro: 'Select a Project to work with',
          position: 'left',
          tooltipclass: 'forLastStep'
        },
        {
          element: '#introTagTitle',
          intro: 'To narrow report results select a Tag from the dropdown',
          position: 'right'
        },
        {
          element: '#introFiletModuleTitle',
          intro: 'Enable the Module hierarchy selection by clicking on the button',
          position: 'right'
        },
        {
          element: '#introExecutionTableTitle',
          intro: 'The table shows the coverage information of the Test Cases in detail',
          position: 'right'
        },
        {
          element: '#introCoverageGraphTitle',
          intro: 'Use the interactive report and drill in/out by clicking on the graph',
          position: 'right'
        },
        {
          element: '#introShareTitle',
          intro: 'Clicking on the button would copy the link of the current report in the clipboard which can be used to share with others',
          position: 'right'
        },
        {
          element: '#introReportOptionTitle',
          intro: 'Select the Type of the Test Cases to download',
          position: 'right'
        },
        {
          element: '#introDownloadTestCaseTitle',
          intro: ' Click on the button to start downloading the Test Case CSV file',
          position: 'right'
        },
        {
          element: '#introExecutionReportTitle',
          intro: 'Navigate to Execution Report directly from coverage report with the current selections',
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
    this.intro.setOption('doneLabel', 'Next page').start().onexit(function () {
      if (!currentTourEnd) {
        currentRouter.navigate(['/app/testCaseDefinition']);
      }
    }).oncomplete(function () {
      currentTourEnd = true;
      currentRouter.navigate(['/app/graphReport'], { queryParams: { appWalkthroughIntro: "executionTour" } });
      // currentRouter.navigate(['/dashBoard']);
    });

  }

  startExecutionTour() {

    let currentRouter = this.router;
    let currentTourEnd = this.tourEnd;

    this.intro.setOptions({
      steps: [
        {
          element: '#introEnvironmentTitle',
          intro: 'Select the environment for which you want to view the test results',
          position: 'right'
        },
        {
          element: '#introReleaseTitle',
          intro: 'Select a Release for which you want to view the Test Results',
          position: 'right'
        },
        {
          element: '#introExecutionTableTitle',
          intro: 'View the overall information of the Test Execution Results in the table and use the table to navigate to the detailed information by clicking on the respective status link',
          position: 'right'
        },
        {
          element: '#introCoverageGraphTitle',
          intro: 'Use the interactive report and drill in/out by clicking on the graph',
          position: 'right'
        },
        {
          element: '#introDownloadNonAutomatedTitle',
          intro: 'Download the remaining non-executed manual Test Cases',
          position: 'right'
        },
        {
          element: '#introDownloadExeReportTitle',
          intro: 'Click on the button to download the Module wise Test execution report in CSV format',
          position: 'right'
        },
        {
          element: '#introExecutionStatusTitle',
          intro: 'Select an Execution status for which you want to view the detailed information',
          position: 'right'
        },
        {
          element: '#introExeTableTitle',
          intro: 'View the Test scenarios with the selected status and click on the Fetch Test steps to view detailed execution information',
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
    this.intro.setOption('doneLabel', 'End Tutorial').start().onexit(function () {
      if (!currentTourEnd) {
        currentRouter.navigate(['/app/testCaseDefinition']);
      }
    }).oncomplete(function () {
      currentTourEnd = true;
      // currentRouter.navigate(['/app/graphReport'], { queryParams: { appWalkthroughIntro: "executionTour" } });
      currentRouter.navigate(['/dashBoard']);
    });

  }

  ngOnDestroy() {
    d3.select("#current-page-header").text("");
    this.intro.exit();
  }

  @ViewChild("paginatorOne") paginatorOne: MatPaginator;
  @ViewChild("sortOne") sortOne: MatSort;

  testCaseArr: TestCaseDefinition[] = [];
  selectedExecutionState = "";
  selectedExecutionStateType = "All";
  selectedEnvironment = 0;
  environmentInfoArr: Environment[] = [];
  selectedRelease = 0;
  releaseAllArr: Release[] = [];
  executionReportArr: ExecutionReport;
  executionDataArr: ExecutionData[];
  graphReportData: Reports;
  executionReportMode: boolean = false;


  clientProjects: ClientProject[] = [];
  clientProjectId: number;

  allTagsArr: TestCaseDefinition[] = [];
  moduleHierarchyArr: Module[] = [];
  moduleHierarchyArr2: Module[] = [];

  selectedOrg: string;
  selectedModule: number = 0;
  selectedProject: number = 0;
  selectedtag: string = "ALL";

  selectedModuleName = "No Module Selected";

  showExecutionsBool: boolean = false;
  disableSelect: boolean = true;

  totalNum: number = 50;
  statusExecution: string[] = ["Pass", "Fail", "Skip", "Block", "Remaining"]
  statusExecutionType: string[] = ["All", "Automation Done", "Automation Pending", "Non-Automatable"]
  coverageReportOptions: string[] = ["Total", "Automatable", "Automation Done", "Automation Pending", "Non-Automatable"]
  selectedcoverageReportOption = "Total";

  remainingFileName = "Test_Cases";
  isLoaded = false;

  coverageData = {

    "name": "Coverage Report",
    "value": 100,
    "actual": 50,
    "children": [

      {
        "name": "Automatable",
        "value": 60,
        "actual": 30,
        "children": [{
          "name": "Automation Done",
          "size": 70,
          "value": 70,
          "actual": 20,
        },
        {
          "name": "Automation Pending",
          "size": 30,
          "value": 30,
          "actual": 10,
        }
        ]
      },
      {
        "name": "Non-Automatable",

        "size": 40,
        "value": 40,
        "actual": 20,

      }

    ]

  };

  coverageExecutionData = {

    "name": "Total",
    "value": 100,
    "actual": 100,
    "children": [

      {

        "name": "Total Test Case",
        "value": 100,
        "actual": 100,
        "children": [

          {
            "name": "Total Executed",
            "value": 95,
            "actual": 95,
            "children": [
              {
                "name": "Pass",
                "value": 20,
                "actual": 20,
                "children": [
                  {
                    "name": "Automation Done",
                    "size": 10,
                    "value": 10,
                    "actual": 10,
                    "childOf": "Pass"
                  },
                  {
                    "name": "Automation Pending",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Pass"
                  },
                  {
                    "name": "Non-Automatable",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Pass"
                  }
                ]
              },
              {
                "name": "Fail",

                "value": 20,
                "actual": 20,
                "children": [
                  {
                    "name": "Automation Done",
                    "size": 10,
                    "value": 10,
                    "actual": 10,
                    "childOf": "Fail"
                  },
                  {
                    "name": "Automation Pending",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Fail"
                  },
                  {
                    "name": "Non-Automatable",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Fail"
                  }
                ]
              },
              // },
              // {
              //   "name": "pending",

              //   "value": 15,
              //   "actual": 15,
              //   "children": [
              //     {
              //       "name": "Automation Done",
              //       "size": 5,
              //       "value": 5,
              //       "actual": 5
              //     },
              //     {
              //       "name": "Automation Pending",
              //       "size": 5,
              //       "value": 5,
              //       "actual": 5
              //     },
              //     {
              //       "name": "Non-Automatable",
              //       "size": 5,
              //       "value": 5,
              //       "actual": 5
              //     }
              //   ]
              // },
              {
                "name": "Skip",

                "value": 15,
                "actual": 15,
                "children": [
                  {
                    "name": "Automation Done",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Skip"
                  },
                  {
                    "name": "Automation Pending",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Skip"
                  },
                  {
                    "name": "Non-Automatable",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Skip"
                  }
                ]
              },
              {
                "name": "Block",

                "value": 15,
                "actual": 15,
                "children": [
                  {
                    "name": "Automation Done",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Block"
                  },
                  {
                    "name": "Automation Pending",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Block"
                  },
                  {
                    "name": "Non-Automatable",
                    "size": 5,
                    "value": 5,
                    "actual": 5,
                    "childOf": "Block"
                  }
                ]
              }
            ]
          },
          {
            "name": "Remaining",
            "value": 5,
            "actual": 5,
            "children": [
              {
                "name": "Automation Done",
                "size": 3,
                "value": 3,
                "actual": 3,
                "childOf": "Remaining"
              },
              {
                "name": "Automation Pending",
                "size": 2,
                "value": 2,
                "actual": 2,
                "childOf": "Remaining"
              },
              {
                "name": "Non-Automatable",
                "size": 1,
                "value": 1,
                "actual": 1,
                "childOf": "Remaining"
              }
            ]

          }

        ]
      }
    ]
  };

  generateCoverageGraph(): void {

    d3.select(".sampleReport").style("background", "linear-gradient(to bottom, #ff4000 0%, #800000 100%)")
      .style("-webkit-background-clip", "text").style("-webkit-text-fill-color", "transparent")
      .style("font-size", "medium").style("font", "bold").style("font-family", "bold");

    var totalNumIn = this.totalNum;

    d3.select(".coverageGraph").selectAll("*").remove();

    var width = 550,
      height = 510;
    var radius = 0;
    if (screen.width < 1023) {
      radius = (Math.min(width, height) / 2) - 100;
    } else {
      radius = (Math.min(width, height) / 2) - 20;
    }



    // var formatNumber = d3.format(",d");

    var x = d3.scaleLinear()
      .range([0, 2 * Math.PI]);

    var y = d3.scaleSqrt()
      .range([0, radius]);

    var color = d3.scaleOrdinal(d3.schemeSet2);

    var partition = d3.partition();

    var arc = d3.arc()
      .startAngle(function (d: any) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
      .endAngle(function (d: any) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
      .innerRadius(function (d: any) { return Math.max(0, y(d.y0)); })
      .outerRadius(function (d: any) { return Math.max(0, y(d.y1)); });


    var svg = d3.select(".coverageGraph").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + radius * 1.2 + "," + (height / 2) + ")");

    var root;
    if (!this.executionReportMode) {
      root = d3.hierarchy(this.coverageData);
      root.sum(function (d: any) { return d.size; });
      svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path").attr("id", function (d) {
          return d.data["name"].trim().replace(/\s+/g, '_')
        }).attr("class", "pie")
        .attr("d", <any>arc)
        .style("fill", function (d: any) {
          if (d.data["name"] === "Coverage Report") {
            return "white";
          } else if (d.data["name"] === "Automation Pending") {
            return "rgb(198, 219, 239,.9)";
          } else if (d.data["name"] === "Automation Done") {
            return "rgb(158, 202, 225)";
          } else if (d.data["name"] === "Automatable") {
            return "rgb(49, 130, 189,.8)";
          } else if (d.data["name"] === "Non-Automatable") {
            return "rgb(253, 141, 60,.8)";
          } else {
            return color((d).data["name"]);
          }
        })
        .on("click", click).on("mouseover", handleMouseOver).on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut).style("stroke", "white")
      // .append("title")
      // .text(function (d) {
      //   if ((d.data["name"] != "Total") && (d.data["name"] != "Automation Done") && (d.data["name"] != "Remaining")) {
      //     return d.data["name"] + "\n[" + d.data["value"] + "%], Actual: " + d.data["actual"];
      //   } else if ((d.data["name"] != "Total")) {
      //     return d.data["name"] + "\n[" + d.data["value"] + "%], Actual: " + d.data["actual"] + ", Total:[" + (+((d.data["actual"] / totalNumIn)) * 100).toFixed(2) + "%]";
      //   } else {
      //   }
      // });

    } else {
      root = d3.hierarchy(this.coverageExecutionData);
      root.sum(function (d: any) { return d.size; });
      svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path").attr("id", function (d) {

          // Setting Ids for Automation done, pending, non-automable as they are child of pass, fail etc... to set uniques IDs in graph
          if (d.data["childOf"] === "Pass") {
            return "Pass-" + d.data["name"].trim().replace(/\s+/g, '_');
          } else if (d.data["childOf"] === "Fail") {
            return "Fail-" + d.data["name"].trim().replace(/\s+/g, '_');
          } else if (d.data["childOf"] === "Skip") {
            return "Skip-" + d.data["name"].trim().replace(/\s+/g, '_');
          } else if (d.data["childOf"] === "Block") {
            return "Block-" + d.data["name"].trim().replace(/\s+/g, '_');
          } else if (d.data["childOf"] === "Remaining") {
            return "Remaining-" + d.data["name"].trim().replace(/\s+/g, '_');
          } else {
            return d.data["name"].trim().replace(/\s+/g, '_');
          }

        })
        .attr("class", "pie")
        .attr("d", <any>arc)
        .style("fill", function (d: any) {
          if (d.data["name"] === "Total") {
            return "white";
          } else if (d.data["name"] === "Total Test Case") {
            return "rgb(148, 103, 189,.7)";
          } else if (d.data["name"] === "Total Executed") {
            return "rgb(44, 160, 44,.8)";
          } else if (d.data["name"] === "Remaining") {
            return "rgb(255, 255, 51,.8)";
          } else if (d.data["name"] === "Pass") {
            return "rgb(179, 222, 105,.8)";
          } else if (d.data["name"] === "Fail") {
            return "rgb(214, 39, 40,.8)";
          } else if (d.data["name"] === "Skip") {
            return "rgb(255, 217, 47)";
          } else if (d.data["name"] === "Block") {
            return "rgb(227, 26, 28,.8)";
          } else {
            if (d.data["childOf"] === "Pass") {
              return "rgb(179, 222, 105,.8)";
            } else if (d.data["childOf"] === "Fail") {
              return "rgb(214, 39, 40,.8)";
            } else if (d.data["childOf"] === "Skip") {
              return "rgb(255, 217, 47)";
            } else if (d.data["childOf"] === "Block") {
              return "rgb(227, 26, 28,.8)";
            } else if (d.data["childOf"] === "Remaining") {
              return "rgb(255, 255, 51,.8)";
            } else {
              return "rgb(196, 255, 221)";
            }
          }
        })
        .on("click", click)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut).on("mousemove", handleMouseMove)
        .style("stroke", "white")
      // .append("title")
      // .text(function (d) {
      //   if ((d.data["name"] != "Total")) {
      //     return d.data["name"] + ": [" + d.data["actual"] + "]";
      //   } else {
      //   }
      // })
    }


    // Appends text to pie charts
    // d3.selectAll(".pie").each(function (d: any) {

    //   var text = svg.append("text")
    //     .attr("x", 50)
    //     .attr("dy", 20).attr("font-style", "italic").attr("font-family", "Helvetica");

    //   text.append("textPath")
    //     .attr("xlink:href", "#" + d3.select(this).attr("id"))
    //     .text(d3.select(this).select("title").text());

    // });

    function click(d) {
      svg.transition()
        .duration(750)
        .tween("scale", function () {
          var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [d.y0, 1]),
            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
          return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
        })
        .selectAll("path")
        .attrTween("d", function (d: any) { return function () { return arc(d); }; });

      d3.selectAll("text").remove();

      // setTimeout(function () {
      //   d3.selectAll(".pie").each(function (d: any) {

      //     if ((d3.select(this).node() as any).getTotalLength() > 600) {

      //       var text = svg.append("text")
      //         .attr("x", 50)
      //         .attr("dy", 20).attr("font-style", "italic").attr("font-family", "Helvetica");

      //       text.append("textPath")
      //         .attr("xlink:href", "#" + d3.select(this).attr("id"))
      //         .text(d3.select(this).select("title").text());
      //     } else {

      //     }

      //   });
      // }, 750);
    }

    let internalExecutionReportMode = this.executionReportMode;
    let previousTableRowColor = "";

    function handleMouseOver(d: any) {
      d3.select(this)
        .style("transform", "scale(1.009)")

      // Replace spaces with _ to match the IDs
      let idOfElement = d3.select(this).attr("id").trim().replace(/\s+/g, '_');

      // Filtering operation only to be applied on table rows as both table rows and graph pies have the same IDs
      d3.selectAll("#" + idOfElement).each(function (d, i) {
        if (d3.select(this).attr("class") === "tableRows" || d3.select(this).attr("class") === "tableColumns") {
          previousTableRowColor = d3.select(this).style("background-color");
          d3.select(this).style("background-color", "#85a2b880");
        }
      });

      // var elem = d3.select(this);
      // let prevColor: any;
      // console.log("currColor " + elem.style("fill"))
      // prevColor = d3.color(elem.style("fill")).darker();
      // console.log("prevColor " + prevColor)
      // elem.style("fill", prevColor)

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

      let toolText = "";
      if (internalExecutionReportMode) {

        if ((d.data["name"] != "Total")) {
          toolText = d.data["name"] + ": [" + d.data["actual"] + "]";
        } else {

        }
      } else {

        if ((d.data["name"] != "Total") && (d.data["name"] != "Automation Done") && (d.data["name"] != "Automation Pending") && (d.data["name"] != "Non-Automatable") && (d.data["name"] != "Automatable")) {
          toolText = d.data["name"]
        } else if ((d.data["name"] != "Total")) {
          toolText = d.data["name"] + "\n[" + d.data["value"] + "%]";
        } else {
        }
      }

      tooltip.select('.label').html(toolText); // set current label           

      tooltip.style('display', 'block') // set display   

      // tooltip.style('top', (d3.event.pageX + 10) + 'px'); // always 10px below the cursor
      // tooltip.style('left', (d3.event.pageY + 10) + 'px'); // always 10px to the right of the mouse

    }

    function handleMouseOut(d) {
      d3.select(this)
        .style("transform", "scale(1)").style("stroke", "white")

      tooltip.style('display', 'none'); // hide tooltip for that element

      // Replace spaces with _ to match the IDs
      let idOfElement = d3.select(this).attr("id").trim().replace(/\s+/g, '_');

      // Filtering operation only to be applied on table rows as both table rows and graph pies have the same IDs
      d3.selectAll("#" + idOfElement).each(function (d, i) {
        if (d3.select(this).attr("class") === "tableRows" || d3.select(this).attr("class") === "tableColumns") {
          d3.select(this).style("background-color", previousTableRowColor);
        }
      });

    }

    function handleMouseMove(d) {

      tooltip.style('top', (d3.event.layerY + 15) + 'px'); // always 10px below the cursor
      tooltip.style('left', (d3.event.layerX + 15) + 'px'); // always 10px to the right of the mouse

    }

    d3.select(self.frameElement).style("height", height + "px");

    // Animation when graph refreshed

    if (!this.executionReportMode) {
      // var event = document.createEvent("HTMLEvents");
      // event.initEvent("click", true, true);
      // var button = document.getElementById('Coverage_Report');
      // button.dispatchEvent(event);
    } else {
      var event = document.createEvent("HTMLEvents");
      event.initEvent("click", true, true);
      var button = document.getElementById('Total_Test_Case');
      button.dispatchEvent(event);
    }

    // define tooltip
    var tooltip = d3.select(".coverageGraph") // select element in the DOM with id 'chart'
      .append('div').classed('tooltip', true).style('position', 'absolute').style('background-color', 'whitesmoke') // append a div element to the element we've selected    
      .style('pointer-events', 'none').style('box-shadow', '4px 4px 10px rgba(0, 0, 0, 0.4)')
    tooltip.append('div') // add divs to the tooltip defined above 
      .attr('class', 'label'); // add class 'label' on the selection                
    // tooltip.append('div') // add divs to the tooltip defined above             
    //   .attr('class', 'count'); // add class 'count' on the selection
    // tooltip.append('div') // add divs to the tooltip defined above
    //   .attr('class', 'percent'); // add class 'percent' on the selection

  }

  // create coverage tableData
  tableData = [
    { nameCoverage: "Total", Total: 50, color: "white", "% out of Total": "100%" },
    { nameCoverage: "Automatable", Total: 30, color: "rgb(49, 130, 189,.8)", "% out of Total": "60%" },
    { nameCoverage: "  Automation Done", Total: 20, color: "rgb(158, 202, 225)", "% out of Total": "40%" },
    { nameCoverage: "  Automation Pending", Total: 10, color: "rgb(198, 219, 239,.9)", "% out of Total": "20%" },
    { nameCoverage: "Non-Automatable", Total: 20, color: "rgb(253, 141, 60,.8)", "% out of Total": "40%" }
  ];

  // create execution tableData
  executionTableData = [
    { nameExe: "Total", Total: 100, color: "rgb(148, 103, 189,.7)" },
    { nameExe: "Executed", Total: 95, "Time (seconds)": 300, color: "rgb(44, 160, 44,.8)" },
    { nameExe: "  Pass", Total: 20, "Time (seconds)": 250, color: "rgb(179, 222, 105,.8)", "Automation Done": 10, "Automation Pending": 10, "Non-Automatable": 5 },
    { nameExe: "  Fail", Total: 20, "Time (seconds)": 50, color: "rgb(214, 39, 40,.8)", "Automation Done": 10, "Automation Pending": 10, "Non-Automatable": 5 },
    // { nameExe: " Pending", Total: 15, color: "rgb(141, 160, 203)" },
    { nameExe: "  Skip", Total: 15, color: "rgb(255, 217, 47)", "Automation Done": 5, "Automation Pending": 5, "Non-Automatable": 5 },
    { nameExe: "  Block", Total: 15, color: "rgba(227, 26, 28, 0.8)", "Automation Done": 5, "Automation Pending": 5, "Non-Automatable": 5 },
    { nameExe: "Remaining", Total: 5, color: "rgb(255, 255, 51,.8)", "Automation Done": 2, "Automation Pending": 2, "Non-Automatable": 1 },
  ];

  generateCoverageTable(): void {

    let outerScopeThis = this;

    d3.select(".coverageTable").selectAll("*").remove();
    let screenWidth = screen.width;
    function tabulate(data, columns) {

      var table = d3.select(".coverageTable").append("table").style("float", function () {
        if (screenWidth < 1023) {
          return "left";
        } else {
          return "right";
        }
      })
        .style("border-collapse", "collapse").style("font-family", "arial, sans-serif").style("overflow-y", "auto"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

      // append the header row
      thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th").style("border", "1px solid #dddddd").style("text-align", "left").style("padding", "8px")
        .text(function (column: any) {

          if (column != "color") {
            // console.log("%%%%%%% " + column)
            return column;
          }
        });

      // create a row for each object in the data
      var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr").style("background-color", function (d: any, i: any) { return i % 2 ? "white" : "#f2f2f2" }).attr("class", "tableRows")
        .attr("id", function (d: any) {
          if (d.nameCoverage) {
            if (d.nameCoverage.trim().replace(/\s+/g, '_') === "Total") {
              return "Coverage_Report";
            }
            return d.nameCoverage.trim().replace(/\s+/g, '_');
          }
          else if (d.nameExe) {
            if (d.nameExe.trim().replace(/\s+/g, '_') === "Total") {
              return "Total_Test_Case";
            } else if (d.nameExe.trim().replace(/\s+/g, '_') === "Executed") {
              return "Total_Executed";
            }
            return d.nameExe.trim().replace(/\s+/g, '_');
          }

        });

      // create a cell in each row for each column
      var cells = rows.selectAll("td")
        .data(function (row) {
          return columns.map(function (column) {
            return { column: column, value: row[column], rowName: row["nameExe"] };
          });
        })
        .enter()
        .append("td").style("border", "1px solid #dddddd").style("text-align", "left").style("white-space", "pre").style("padding", "8px")
        .attr("id", function (d: any) {
          if (d.column) {
            if (d.rowName) {

              if (d.rowName.trim() === "Pass") {
                return "Pass-" + d.column.trim().replace(/\s+/g, '_');
              } else if (d.rowName.trim() === "Fail") {
                return "Fail-" + d.column.trim().replace(/\s+/g, '_');
              } else if (d.rowName.trim() === "Skip") {
                return "Skip-" + d.column.trim().replace(/\s+/g, '_');
              } else if (d.rowName.trim() === "Block") {
                return "Block-" + d.column.trim().replace(/\s+/g, '_');
              } else if (d.rowName.trim() === "Remaining") {
                return "Remaining-" + d.column.trim().replace(/\s+/g, '_');
              } else if (d.rowName.trim() === "Executed") {
                return "Executed-" + d.column.trim().replace(/\s+/g, '_');
              } else {
                return d.column.trim().replace(/\s+/g, '_');
              }
            }
          }

        }).attr("class", "tableColumns")
        .text(function (d: any) {
          let columnList = ["color"];
          if (!columnList.includes(d.column)) {
            let columnValueList = ["Pass", "Fail", "Skip", "Block", "Remaining"];
            let value = "";
            if (d.value != undefined) {
              value = d.value.toString();
              if (!columnValueList.includes(value.trim())) {
                // console.log("@@@@@@@@@@@@@@@@@@@@" + value.trim())
                return value;
              }
              else {
                d3.select(this).style("cursor", "pointer")
                return value;
              }
            }
          }

        }).on("click", function () {
          let columnValueList = ["Pass", "Fail", "Skip", "Block", "Remaining"];
          if (columnValueList.includes(d3.select(this).text().trim())) {
            outerScopeThis.selectedExecutionState = d3.select(this).text().trim();
            outerScopeThis.getTestCaseByIds();
          }
        })
        .style("background-color", function (d: any, i: any) {
          if (d.column === "color") {
            return d.value;
          }
          return "";
        });

      return table;
    }

    if (!this.executionReportMode) {

      // render the table
      var coverageTable = tabulate(this.tableData, ["color", "nameCoverage", "Total", "% out of Total"]);
    } else {
      var coverageTable = tabulate(this.executionTableData, ["color", "nameExe", "Total", "Time (seconds)", "Automation Done", "Automation Pending", "Non-Automatable"]);
    }

    // uppercase the column headers
    coverageTable.selectAll("thead th")
      .text(function (column: any) {

        if (column === "nameCoverage") {
          return "Test Case Type";
        } else if (column === "nameExe") {
          return "Status";
        }
        else if (column != "color") {
          return column.charAt(0).toUpperCase() + column.substr(1);
        } else {
          return ""
        }
      });

  }

  getProjectsByOrganizationName(name: string) {
    this.disableSelect = false;
    this.selectedOrg = name;
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          if (result != undefined)
            this.clientProjects = result;
          if (this.clientProjects.length > 0) {
            if (this.paramProject != "") {
              this.selectedProject = parseInt(this.paramProject);
            } else {
              this.selectedProject = this.clientProjects[0].clientProjectId;
            }
          } else {
            this.selectedProject = 0;
          }
          // this.selectedtag = "ALL";
          // this.selectedModule = 0;
          // this.getCoverageData();

          this.getAllRelease();
          this.fetchGraphData();
          this.getModuleHierarchyByProjectName();
          this.getAllTagsList();
        });
  }

  getCoverageData() {

    this.isLoaded = true;

    this.reportService.getCoverageReportForID(this.selectedProject, this.selectedtag, this.selectedModule)
      .subscribe(
        result => {

          this.graphReportData = result

          if (this.graphReportData.automatablePercentage.toString() != "NaN") {
            this.coverageData.actual = + this.graphReportData.totalTestCaseIds.length;
            this.totalNum = + this.graphReportData.totalTestCaseIds.length;

            this.coverageData.children[0].value = + this.graphReportData.automatablePercentage.toFixed(2);
            this.coverageData.children[0].actual = + this.graphReportData.totalAutomatableTestCaseIds.length;

            this.coverageData.children[0].children[0].value = + this.graphReportData.automatedPercentage.toFixed(2);
            this.coverageData.children[0].children[0].size = + this.graphReportData.automatedPercentage.toFixed(2);
            this.coverageData.children[0].children[0].actual = + this.graphReportData.automatedTestCaseIds.length.toFixed(2);

            this.coverageData.children[0].children[1].value = + this.graphReportData.pendingAutomatedPercentage.toFixed(2);
            this.coverageData.children[0].children[1].size = + this.graphReportData.pendingAutomatedPercentage.toFixed(2);
            this.coverageData.children[0].children[1].actual = + this.graphReportData.pendingAutomatedTestCaseIds.length.toFixed(2);

            this.coverageData.children[1].value = + (100 - this.graphReportData.automatablePercentage).toFixed(2);
            this.coverageData.children[1].actual = this.graphReportData.totalManualTestCaseIds.length;
            this.coverageData.children[1].size = + (100 - this.graphReportData.automatablePercentage).toFixed(2);

            d3.select(".sampleReport").text("Automation coverage report for the selected filters. Click on an arc to expand").style("background", "linear-gradient(to bottom, #ff9900 0%, #800000 100%)")
              .style("-webkit-background-clip", "text").style("-webkit-text-fill-color", "transparent")
              .style("font-size", "medium").style("font", "bold").style("font-family", "bold");

            if (this.graphReportData.totalTestCaseIds.length != 0) {
              this.generateCoverageGraph()
            } else {
              d3.select(".coverageGraph").select("svg").selectAll("*").remove();
              this.commonService.openNotificationBar("No data available for the selected filters", "error", "normal");
            }

            // Changes in table

            this.tableData[0].Total = this.graphReportData.totalTestCaseIds.length;
            if (this.graphReportData.totalTestCaseIds.length != 0) {
              this.tableData[0]["% out of Total"] = "100%";
            }
            else {
              this.tableData[0]["% out of Total"] = "0%";
            }

            this.tableData[1].Total = this.graphReportData.totalAutomatableTestCaseIds.length;
            if (this.graphReportData.totalTestCaseIds.length != 0) {
              this.tableData[1]["% out of Total"] = ((this.graphReportData.totalAutomatableTestCaseIds.length / this.graphReportData.totalTestCaseIds.length) * 100).toFixed(2) + "%";
            }
            else {
              this.tableData[1]["% out of Total"] = "0%";
            }

            this.tableData[2].Total = this.graphReportData.automatedTestCaseIds.length;
            if (this.graphReportData.totalTestCaseIds.length != 0) {
              this.tableData[2]["% out of Total"] = ((this.graphReportData.automatedTestCaseIds.length / this.graphReportData.totalTestCaseIds.length) * 100).toFixed(2) + "%";
            }
            else {
              this.tableData[2]["% out of Total"] = "0%";
            }

            this.tableData[3].Total = this.graphReportData.pendingAutomatedTestCaseIds.length;
            if (this.graphReportData.totalTestCaseIds.length != 0) {
              this.tableData[3]["% out of Total"] = ((this.graphReportData.pendingAutomatedTestCaseIds.length / this.graphReportData.totalTestCaseIds.length) * 100).toFixed(2) + "%";
            }
            else {
              this.tableData[3]["% out of Total"] = "0%";
            }

            this.tableData[4].Total = this.graphReportData.totalTestCaseIds.length - this.graphReportData.totalAutomatableTestCaseIds.length;
            if (this.graphReportData.totalTestCaseIds.length != 0) {
              this.tableData[4]["% out of Total"] = (((this.graphReportData.totalTestCaseIds.length - this.graphReportData.totalAutomatableTestCaseIds.length) / this.graphReportData.totalTestCaseIds.length) * 100).toFixed(2) + "%";
            }
            else {
              this.tableData[4]["% out of Total"] = "0%";
            }

            this.generateCoverageTable();

          } else {
            d3.select(".sampleReport").text("Graph is not available for selected filters. Please select some other filters").style("background", "linear-gradient(to bottom, #ff9900 0%, #800000 100%)")
              .style("-webkit-background-clip", "text").style("-webkit-text-fill-color", "transparent")
              .style("font-size", "medium").style("font", "bold").style("font-family", "bold");
            d3.select(".coverageGraph").selectAll("*").remove();
            d3.select(".coverageTable").selectAll("*").remove();
          }
          this.isLoaded = false;
        });
  }

  getAllTagsList(): void {

    this.testcaseDefinitionService.getTagsList(this.selectedProject).subscribe(result => {
      this.allTagsArr = result;
      this.allTagsArr.forEach(element => {

      });
    });

  }

  // getModuleHierarchy(): void {
  //   this.moduleHierarchyArr.length = 0;
  //   this.moduleService.getModuleHierarchy().subscribe(result => {
  //     if (this.selectedProject != "0") {
  //       result.forEach(element => {
  //         if (element.clientProjectsId === parseInt(this.selectedProject)) {
  //           this.moduleHierarchyArr.push(element)
  //         }
  //       });
  //     } else {
  //       this.clientProjects.forEach(elementClient => {
  //         result.forEach(element => {
  //           if (element.clientProjectsId === elementClient.clientProjectId) {
  //             this.moduleHierarchyArr.push(element)
  //           }
  //         });
  //       });
  //     }
  //   });
  // }

  filterByModule: false;

  getModuleHierarchyByProjectName(): void {

    if (this.filterByModule) {
      document.getElementById('loading-image-graph').style.visibility = "visible";
      this.moduleService.getModulesTree(this.selectedProject).subscribe(result => {
        this.moduleHierarchyArr2 = result;
        setTimeout(function () {
          document.getElementById('loading-image-graph').style.visibility = "hidden";
        }, 3000)

      })
    }
  }

  selectModuleName(moduleId: number, nameModule: string) {
    this.selectedModuleName = "Selected Module: " + nameModule;
    this.selectedModule = moduleId;
  }

  // selectedRelease(value: string): void {
  //   if (value === "None") {
  //     this.showExecutionsBool = false;
  //   } else {
  //     this.showExecutionsBool = true;
  //   }

  //   this.generateCoverageGraph();

  // }

  getAllEnvInfo() {
    this.environmentService.getAllEnvironmentInfo()
      .subscribe(
        result => {
          this.environmentInfoArr = result;
          if(this.environmentInfoArr && Array.isArray(this.environmentInfoArr) && this.environmentInfoArr.length > 0){
            this.selectedEnvironment = this.environmentInfoArr[0].executionEnvId;
          }
        });
  }

  getAllRelease(): void {
    this.releaseAllArr = [];
    this.releaseMappingService.getAllReleaseInfo(this.selectedProject, "true").subscribe(result => {
      this.releaseAllArr = result;
      if(this.releaseAllArr && Array.isArray(this.releaseAllArr) && this.releaseAllArr.length > 0){
        this.selectedRelease = this.releaseAllArr[0].releaseId;
      }
    });

  }

  getExecutionData() {

    this.isLoaded = true;

    this.reportService.getExecutionReport(this.selectedProject, this.selectedModule, +this.selectedRelease, +this.selectedEnvironment)
      .subscribe(
        result => {

          this.executionReportArr = result;

          d3.select(".coverageGraph").selectAll("*").remove();

          this.coverageExecutionData.children[0].value = + this.executionReportArr.totalTestCaseCount
          this.coverageExecutionData.children[0].actual = + this.executionReportArr.totalTestCaseCount

          this.coverageExecutionData.children[0].children[0].value = + this.executionReportArr.totalExecutedTestCaseCount
          this.coverageExecutionData.children[0].children[0].actual = + this.executionReportArr.totalExecutedTestCaseCount

          this.coverageExecutionData.children[0].children[0].children[0].value = + this.executionReportArr.testCaseExecutionStatusInfo.pass.length;
          this.coverageExecutionData.children[0].children[0].children[0].actual = + this.executionReportArr.testCaseExecutionStatusInfo.pass.length;

          this.coverageExecutionData.children[0].children[0].children[1].value = + this.executionReportArr.testCaseExecutionStatusInfo.fail.length;
          this.coverageExecutionData.children[0].children[0].children[1].actual = + this.executionReportArr.testCaseExecutionStatusInfo.fail.length;

          // this.coverageExecutionData.children[0].children[0].children[2].value = + this.executionReportArr.testCaseExecutionStatusInfo.pending.length;
          // this.coverageExecutionData.children[0].children[0].children[2].actual = + this.executionReportArr.testCaseExecutionStatusInfo.pending.length;

          this.coverageExecutionData.children[0].children[0].children[2].value = + this.executionReportArr.testCaseExecutionStatusInfo.skip.length;
          this.coverageExecutionData.children[0].children[0].children[2].actual = + this.executionReportArr.testCaseExecutionStatusInfo.skip.length;

          this.coverageExecutionData.children[0].children[0].children[3].value = + this.executionReportArr.testCaseExecutionStatusInfo.block.length;
          this.coverageExecutionData.children[0].children[0].children[3].actual = + this.executionReportArr.testCaseExecutionStatusInfo.block.length;


          // Pass Automation Done
          var passMFilter = [];
          var passDFilter = [];
          var passRFilter = [];

          this.executionReportArr.testCaseExecutionStatusInfo.pass.forEach(function (element) {
            if (element.includes("M")) {

              passMFilter.push(element);
            }
            else if (element.includes("D")) {

              passDFilter.push(element);
            }
            else if (element.includes("R")) {

              passRFilter.push(element);
            }
          });

          this.coverageExecutionData.children[0].children[0].children[0]["children"][0]["size"] = + passDFilter.length;
          this.coverageExecutionData.children[0].children[0].children[0]["children"][0]["value"] = + passDFilter.length;
          this.coverageExecutionData.children[0].children[0].children[0]["children"][0]["actual"] = + passDFilter.length;

          this.coverageExecutionData.children[0].children[0].children[0]["children"][1]["size"] = + passRFilter.length;
          this.coverageExecutionData.children[0].children[0].children[0]["children"][1]["value"] = + passRFilter.length;
          this.coverageExecutionData.children[0].children[0].children[0]["children"][1]["actual"] = + passRFilter.length;

          this.coverageExecutionData.children[0].children[0].children[0]["children"][2]["size"] = + passMFilter.length;
          this.coverageExecutionData.children[0].children[0].children[0]["children"][2]["value"] = + passMFilter.length;
          this.coverageExecutionData.children[0].children[0].children[0]["children"][2]["actual"] = + passMFilter.length;

          this.executionTableData[2]["Automation Done"] = + passDFilter.length;
          this.executionTableData[2]["Automation Pending"] = + passRFilter.length;
          this.executionTableData[2]["Non-Automatable"] = + passMFilter.length;

          // Fail Automation Done
          var failMFilter = [];
          var failDFilter = [];
          var failRFilter = [];

          this.executionReportArr.testCaseExecutionStatusInfo.fail.forEach(function (element) {
            if (element.includes("M")) {

              failMFilter.push(element);
            }
            else if (element.includes("D")) {

              failDFilter.push(element);
            }
            else if (element.includes("R")) {

              failRFilter.push(element);
            }
          });


          this.coverageExecutionData.children[0].children[0].children[1]["children"][0]["size"] = + failDFilter.length;
          this.coverageExecutionData.children[0].children[0].children[1]["children"][0]["value"] = + failDFilter.length;
          this.coverageExecutionData.children[0].children[0].children[1]["children"][0]["actual"] = + failDFilter.length;

          this.coverageExecutionData.children[0].children[0].children[1]["children"][1]["size"] = + failRFilter.length;
          this.coverageExecutionData.children[0].children[0].children[1]["children"][1]["value"] = + failRFilter.length;
          this.coverageExecutionData.children[0].children[0].children[1]["children"][1]["actual"] = + failRFilter.length;

          this.coverageExecutionData.children[0].children[0].children[1]["children"][2]["size"] = + failMFilter.length;
          this.coverageExecutionData.children[0].children[0].children[1]["children"][2]["value"] = + failMFilter.length;
          this.coverageExecutionData.children[0].children[0].children[1]["children"][2]["actual"] = + failMFilter.length;

          this.executionTableData[3]["Automation Done"] = + failDFilter.length;
          this.executionTableData[3]["Automation Pending"] = + failRFilter.length;
          this.executionTableData[3]["Non-Automatable"] = + failMFilter.length;

          // pending Automation Done
          // var pendingMFilter = [];
          // var pendingDFilter = [];
          // var pendingRFilter = [];

          // this.executionReportArr.testCaseExecutionStatusInfo.pending.forEach(function (element) {
          //   if (element.includes("M")) {

          //     pendingMFilter.push(element);
          //   }
          //   else if (element.includes("D")) {

          //     pendingDFilter.push(element);
          //   }
          //   else if (element.includes("R")) {

          //     pendingRFilter.push(element);
          //   }
          // });


          // this.coverageExecutionData.children[0].children[0].children[2]["children"][0]["size"] = + pendingDFilter.length;
          // this.coverageExecutionData.children[0].children[0].children[2]["children"][0]["value"] = + pendingDFilter.length;
          // this.coverageExecutionData.children[0].children[0].children[2]["children"][0]["actual"] = + pendingDFilter.length;

          // this.coverageExecutionData.children[0].children[0].children[2]["children"][1]["size"] = + pendingRFilter.length;
          // this.coverageExecutionData.children[0].children[0].children[2]["children"][1]["value"] = + pendingRFilter.length;
          // this.coverageExecutionData.children[0].children[0].children[2]["children"][1]["actual"] = + pendingRFilter.length;

          // this.coverageExecutionData.children[0].children[0].children[2]["children"][2]["size"] = + pendingMFilter.length;
          // this.coverageExecutionData.children[0].children[0].children[2]["children"][2]["value"] = + pendingMFilter.length;
          // this.coverageExecutionData.children[0].children[0].children[2]["children"][2]["actual"] = + pendingMFilter.length;

          // skip Automation Done
          var skipMFilter = [];
          var skipDFilter = [];
          var skipRFilter = [];

          this.executionReportArr.testCaseExecutionStatusInfo.skip.forEach(function (element) {
            if (element.includes("M")) {

              skipMFilter.push(element);
            }
            else if (element.includes("D")) {

              skipDFilter.push(element);
            }
            else if (element.includes("R")) {

              skipRFilter.push(element);
            }
          });

          this.coverageExecutionData.children[0].children[0].children[2]["children"][0]["size"] = + skipDFilter.length;
          this.coverageExecutionData.children[0].children[0].children[2]["children"][0]["value"] = + skipDFilter.length;
          this.coverageExecutionData.children[0].children[0].children[2]["children"][0]["actual"] = + skipDFilter.length;

          this.coverageExecutionData.children[0].children[0].children[2]["children"][1]["size"] = + skipRFilter.length;
          this.coverageExecutionData.children[0].children[0].children[2]["children"][1]["value"] = + skipRFilter.length;
          this.coverageExecutionData.children[0].children[0].children[2]["children"][1]["actual"] = + skipRFilter.length;

          this.coverageExecutionData.children[0].children[0].children[2]["children"][2]["size"] = + skipMFilter.length;
          this.coverageExecutionData.children[0].children[0].children[2]["children"][2]["value"] = + skipMFilter.length;
          this.coverageExecutionData.children[0].children[0].children[2]["children"][2]["actual"] = + skipMFilter.length;

          this.executionTableData[4]["Automation Done"] = + skipDFilter.length;
          this.executionTableData[4]["Automation Pending"] = + skipRFilter.length;
          this.executionTableData[4]["Non-Automatable"] = + skipMFilter.length;

          // block Automation Done
          var blockMFilter = [];
          var blockDFilter = [];
          var blockRFilter = [];

          this.executionReportArr.testCaseExecutionStatusInfo.block.forEach(function (element) {
            if (element.includes("M")) {

              blockMFilter.push(element);
            }
            else if (element.includes("D")) {

              blockDFilter.push(element);
            }
            else if (element.includes("R")) {

              blockRFilter.push(element);
            }
          });

          this.coverageExecutionData.children[0].children[0].children[3]["children"][0]["size"] = + blockDFilter.length;
          this.coverageExecutionData.children[0].children[0].children[3]["children"][0]["value"] = + blockDFilter.length;
          this.coverageExecutionData.children[0].children[0].children[3]["children"][0]["actual"] = + blockDFilter.length;

          this.coverageExecutionData.children[0].children[0].children[3]["children"][1]["size"] = + blockRFilter.length;
          this.coverageExecutionData.children[0].children[0].children[3]["children"][1]["value"] = + blockRFilter.length;
          this.coverageExecutionData.children[0].children[0].children[3]["children"][1]["actual"] = + blockRFilter.length;

          this.coverageExecutionData.children[0].children[0].children[3]["children"][2]["size"] = + blockMFilter.length;
          this.coverageExecutionData.children[0].children[0].children[3]["children"][2]["value"] = + blockMFilter.length;
          this.coverageExecutionData.children[0].children[0].children[3]["children"][2]["actual"] = + blockMFilter.length;

          this.executionTableData[5]["Automation Done"] = + blockDFilter.length;
          this.executionTableData[5]["Automation Pending"] = + blockRFilter.length;
          this.executionTableData[5]["Non-Automatable"] = + blockMFilter.length;


          // Remaining Execution Done
          var ReMFilter = [];
          var ReDFilter = [];
          var ReRFilter = [];

          this.executionReportArr.testCaseExecutionStatusInfo.executionRemaining.forEach(function (element) {
            if (element.includes("M")) {

              ReMFilter.push(element);
            }
            else if (element.includes("D")) {

              ReDFilter.push(element);
            }
            else if (element.includes("R")) {

              ReRFilter.push(element);
            }
          });

          this.coverageExecutionData.children[0].children[1].value = + this.executionReportArr.testCaseExecutionStatusInfo.executionRemaining.length;
          this.coverageExecutionData.children[0].children[1].actual = + this.executionReportArr.testCaseExecutionStatusInfo.executionRemaining.length;

          this.coverageExecutionData.children[0].children[1]["children"][0]["size"] = + ReDFilter.length;
          this.coverageExecutionData.children[0].children[1]["children"][0]["value"] = + ReDFilter.length;
          this.coverageExecutionData.children[0].children[1]["children"][0]["actual"] = + ReDFilter.length;

          this.coverageExecutionData.children[0].children[1]["children"][1]["size"] = + ReRFilter.length;
          this.coverageExecutionData.children[0].children[1]["children"][1]["value"] = + ReRFilter.length;
          this.coverageExecutionData.children[0].children[1]["children"][1]["actual"] = + ReRFilter.length;

          this.coverageExecutionData.children[0].children[1]["children"][2]["size"] = + ReMFilter.length;
          this.coverageExecutionData.children[0].children[1]["children"][2]["value"] = + ReMFilter.length;
          this.coverageExecutionData.children[0].children[1]["children"][2]["actual"] = + ReMFilter.length;

          this.executionTableData[6]["Automation Done"] = + ReDFilter.length;
          this.executionTableData[6]["Automation Pending"] = + ReRFilter.length;
          this.executionTableData[6]["Non-Automatable"] = + ReMFilter.length;

          d3.select(".sampleReport").text("Automation coverage report for the selected filters. Click on an arc to expand").style("background", "linear-gradient(to bottom, #ff9900 0%, #800000 100%)")
            .style("-webkit-background-clip", "text").style("-webkit-text-fill-color", "transparent")
            .style("font-size", "medium").style("font", "bold").style("font-family", "bold");

          this.generateCoverageGraph()

          // Changes in table

          this.executionTableData[0].Total = this.executionReportArr.totalTestCaseCount
          this.executionTableData[1].Total = this.executionReportArr.totalExecutedTestCaseCount
          this.executionTableData[2].Total = this.executionReportArr.testCaseExecutionStatusInfo.pass.length;
          this.executionTableData[3].Total = this.executionReportArr.testCaseExecutionStatusInfo.fail.length;
          // this.executionTableData[4].Total = this.executionReportArr.testCaseExecutionStatusInfo.pending.length;
          this.executionTableData[4].Total = this.executionReportArr.testCaseExecutionStatusInfo.skip.length;
          this.executionTableData[5].Total = this.executionReportArr.testCaseExecutionStatusInfo.block.length;
          this.executionTableData[6].Total = (this.executionReportArr.totalTestCaseCount - this.executionReportArr.totalExecutedTestCaseCount)

          this.executionTableData[1]["Time (seconds)"] = this.executionReportArr.durationInfo.pass + this.executionReportArr.durationInfo.fail;
          this.executionTableData[2]["Time (seconds)"] = this.executionReportArr.durationInfo.pass;
          this.executionTableData[3]["Time (seconds)"] = this.executionReportArr.durationInfo.fail;

          this.generateCoverageTable();

          this.dataSource = new MatTableDataSource([]);

          this.isLoaded = false;

          this.selectedExecutionState = "";
          this.selectedExecutionStateType = "All";

        });
  }

  swichExecution(value: string) {
    if (value === "Execution") {
      this.executionReportMode = true;
      d3.select("#current-page-header").text("Execution Report");
    } else {
      this.executionReportMode = false;
      d3.select("#current-page-header").text("Automation Coverage Report")
    }
    this.generateCoverageGraph();
    this.generateCoverageTable();
  }

  downloadReport() {

    if (window.confirm("Popup should be allowed on this website to download the File")) {
      // path where the report will be generated
      let path = "%2Fdownload_report";

      if (window.location.hostname === "pintailer.com") {
        path = "%2Fdownload_report";
      }
      this.commonService.openNotificationBar("Download will start in few seconds", "notification_important", "normal");
      this.reportService.downloadExecutionReport(this.selectedProject, +this.selectedRelease, +this.selectedEnvironment, "xlsx", path)
        .subscribe(
          result => {

            // var myJsonString = JSON.stringify(data);
            // var blob = new Blob([myJsonString], {
            //   type: "application/vnd.ms-excel;charset=charset=utf-8"
            // });
            // saveAs(blob, "Report.xls");

            let link = document.createElement('a');
            link.setAttribute('type', 'hidden');
            link.href = "./assets/downloads/" + result;
            link.download = result.toString();
            document.body.appendChild(link);
            link.click();
            link.remove();

            // window.open("./assets/downloads/" + result, 'Download')

          })

    }
  }

  downloadRemainingData() {

    // path where the report will be generated
    let path = "%2Fdownload_report";

    if (window.location.hostname === "pintailer.com") {
      path = "%2Fdownload_report";
    }

    var testCaseIds = [];

    this.executionReportArr.testCaseExecutionStatusInfo.executionRemaining.forEach(function (element) {
      if (element.includes("M")) {
        testCaseIds.push(element);
      }
    });

    testCaseIds.forEach(function (part, index, theArray) {
      if (part.includes("-")) {
        part = part.substring(2, part.length);
        theArray[index] = part;
      }
    });

    if (testCaseIds.length > 0) {
      if (this.remainingFileName != "") {
        this.commonService.openNotificationBar("Download will start in few seconds", "notification_important", "normal");
        this.reportService.downloadRemainingData("csv", this.remainingFileName, path, testCaseIds)
          .subscribe(
            result => {

              // var myJsonString = JSON.stringify(data);
              // var blob = new Blob([myJsonString], {
              //   type: "application/vnd.ms-excel;charset=charset=utf-8"
              // });
              // saveAs(blob, "Report.xls");

              let link = document.createElement('a');
              link.setAttribute('type', 'hidden');
              link.href = "./assets/downloads/" + result;
              link.download = result.toString();
              document.body.appendChild(link);
              link.click();
              link.remove();

              // window.open("./assets/downloads/" + result, 'Download')

            })
      } else {
        this.commonService.openNotificationBar("Please enter a file name first", "error", "normal");
      }
    }
    else {
      this.commonService.openNotificationBar("No data available to download for selected filters", "error", "normal");
    }
  }

  getTestCaseByIds(): void {

    var toPassIds: string[];
    if (this.selectedExecutionState === "Pass") {
      toPassIds = this.executionReportArr.testCaseExecutionStatusInfo.pass;
    }
    else if (this.selectedExecutionState === "Fail") {
      toPassIds = this.executionReportArr.testCaseExecutionStatusInfo.fail;
    }
    else if (this.selectedExecutionState === "Skip") {
      toPassIds = this.executionReportArr.testCaseExecutionStatusInfo.skip;
    }
    else if (this.selectedExecutionState === "Pending") {
      toPassIds = this.executionReportArr.testCaseExecutionStatusInfo.pending;
    }
    else if (this.selectedExecutionState === "Block") {
      toPassIds = this.executionReportArr.testCaseExecutionStatusInfo.block;
    }
    else if (this.selectedExecutionState === "Remaining") {
      toPassIds = this.executionReportArr.testCaseExecutionStatusInfo.executionRemaining;
    }

    let tcIds = JSON.parse(JSON.stringify(toPassIds));

    let testCaseIds: string[] = [];
    let selectedStatusType = "";
    if (this.selectedExecutionStateType === "All") {
      selectedStatusType = "";
    }
    else if (this.selectedExecutionStateType === "Automation Done") {
      selectedStatusType = "D";
    }
    else if (this.selectedExecutionStateType === "Automation Pending") {
      selectedStatusType = "R";
    }
    else if (this.selectedExecutionStateType === "Non-Automatable") {
      selectedStatusType = "M";
    }

    tcIds.forEach(function (element) {
      if (element.includes(selectedStatusType)) {
        testCaseIds.push(element);
      }
    });

    testCaseIds.forEach(function (part, index, theArray) {
      if (part.includes("-")) {
        part = part.substring(2, part.length);
        theArray[index] = part;
      }
    });

    if (testCaseIds.length > 0) {
      this.testcaseDefinitionService.getTestCaseForIds(this.selectedProject, "all", testCaseIds)
        .subscribe(
          testCaseDefinitions => {
            testCaseDefinitions.forEach(function (part, index, theArray) {
              part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/@#/g, '\n⇓\n');
              part.modulesNameHierarchy = part.modulesNameHierarchy.replace(/\\"/g, '"');
              theArray[index].modulesNameHierarchy = part.modulesNameHierarchy;
            });
            this.testCaseArr = testCaseDefinitions;
            this.dataSource = new MatTableDataSource(testCaseDefinitions);
            this.dataSource.paginator = this.paginatorOne;
            this.dataSource.sort = this.sortOne;
          });
      this.getModuleHierarchy();
      window.scroll({
        behavior: 'smooth',
        left: 0,
        top: document.getElementById('firstBoxId').offsetTop
      });
    } else {
      this.dataSource = null;
      this.commonService.openNotificationBar("No Test Case found for particular selection", "error", "normal");
    }

  }

  displayedColumns: string[] = ['ModuleName', 'testSummary', 'expectedResult'];

  dataSource: MatTableDataSource<TestCaseDefinition>;

  selection = new SelectionModel<TestCaseDefinition>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getModuleHierarchy(): void {
    this.moduleService.getModuleHierarchy(this.selectedProject).subscribe(result => {
      this.moduleHierarchyArr = result;
      this.moduleHierarchyArr.forEach((item, index) => {
        item.hierarchy = item.hierarchy.replace(/[^a-zA-Z,,]/g, ' ');
        item.hierarchy = item.hierarchy.replace(/,/g, '\n⇑\n');
      });

    });
  }

  testStepsArr: ReadonlyArray<{}>;
  passStepData: string;
  failStepData: string;
  skipStepData: string;
  blockStepData: string;
  pendingStepData: string;
  toOpenPanel: string;

  fetchTestSteps(caseID: string) {

    this.toOpenPanel = caseID;

    this.passStepData = JSON.stringify(this.executionReportArr.testStepsStatus[caseID].pass);
    this.failStepData = JSON.stringify(this.executionReportArr.testStepsStatus[caseID].fail);
    this.skipStepData = JSON.stringify(this.executionReportArr.testStepsStatus[caseID].skip);
    this.pendingStepData = JSON.stringify(this.executionReportArr.testStepsStatus[caseID].pending);
    this.blockStepData = JSON.stringify(this.executionReportArr.testStepsStatus[caseID].block);

    this.passStepData = this.modifyText("Pass:", this.passStepData);
    this.failStepData = this.modifyText("Fail:", this.failStepData);
    this.skipStepData = this.modifyText("Skip:", this.skipStepData);
    this.pendingStepData = this.modifyText("Pending:", this.pendingStepData);
    this.blockStepData = this.modifyText("Block:", this.blockStepData);

    setTimeout(this.beutifyAllScenarioSteps, 1000);

  }

  modifyText(value: string, text: string) {

    if (text != undefined) {

      text = text.replace("[\"", value)

      text = text.replace("\"]", "")
      text = text.replace("\\\"]", "\"")

      text = text.replace(/","/g, "<br/>");
      text = text.replace(/\n/g, "<br/>");
      text = text.replace(/And /g, '<br/><span class="specialChar">And </span>');
      text = text.replace(/When /g, '<br/><span class="specialChar">When </span>');
      text = text.replace(/Then /g, '<br/><span class="specialChar">Then </span>');
      text = text.replace(/But /g, '<br/><span class="specialChar">But </span>');
      text = text.replace(/Given /g, '<br/><span class="specialChar">Given </span>');

    }

    return text;
  }

  fetchGraphData() {
    if (!this.executionReportMode) {
      this.getCoverageData();
    }
    else {
      this.getExecutionData();
    }
  }

  beutifyAllScenarioSteps(): void {
    d3.selectAll(".specialChar").each(function (d: any) {
      d3.select(this).style("background", "linear-gradient(to bottom, #ff9900 0%, #800000 100%)")
        .style("-webkit-background-clip", "text").style("-webkit-text-fill-color", "transparent")
        .style("font-size", "medium").style("font", "bold").style("font-family", "\"Comic Sans MS\", cursive, sans-serif");
    })
  }

  downloadCoverageReportData() {

    // path where the report will be generated
    let path = "%2Fdownload_report";

    if (window.location.hostname === "pintailer.com") {
      path = "%2Fdownload_report";
    }

    let toDownloadOption = "";

    if (this.selectedcoverageReportOption === "Total") {
      toDownloadOption = "totalTestCaseIds";
    } else if (this.selectedcoverageReportOption === "Automatable") {
      toDownloadOption = "totalAutomatableTestCaseIds";
    } else if (this.selectedcoverageReportOption === "Automation Done") {
      toDownloadOption = "automatedTestCaseIds";
    } else if (this.selectedcoverageReportOption === "Automation Pending") {
      toDownloadOption = "pendingAutomatedTestCaseIds";
    } else if (this.selectedcoverageReportOption === "Non-Automatable") {
      toDownloadOption = "totalManualTestCaseIds";
    }

    let fileName = this.selectedcoverageReportOption.replace(/\s+/g, '_')

    if (this.graphReportData[toDownloadOption].length > 0) {
      this.commonService.openNotificationBar("Download will start in few seconds", "notification_important", "normal");
      this.reportService.downloadTestCases("xlsx", fileName, path, this.graphReportData[toDownloadOption])
        .subscribe(
          result => {

            let link = document.createElement('a');
            link.setAttribute('type', 'hidden');
            link.href = "./assets/downloads/" + result;
            link.download = result.toString();
            document.body.appendChild(link);
            link.click();
            link.remove();

            // window.open("./assets/downloads/" + result, 'Download')

          })

    }
    else {
      this.commonService.openNotificationBar("No data available to download for selected filters", "error", "normal");
    }
  }

  copyLink() {
    let url = "";
    if (window.location.hostname === "localhost") {
      url = "http://" + window.location.hostname + ":4200/app/graphReport";  // URL to web api
    } else {
      url = "http://" + window.location.hostname + "/app/graphReport";  // URL to web api
    }

    url = url + "?project=" + this.selectedProject + "&execution=" + this.executionReportMode + "&tag=" + this.selectedtag + "&env=" + this.selectedEnvironment + "&release=" + this.selectedRelease;
    var textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      // console.log('Copying text command was ' + msg);
      this.commonService.openNotificationBar("Link has been copied", "notification_important", "normal");
    } catch (err) {
      // console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);

  }

  @ViewChild('screen') screen: ElementRef;
  @ViewChild('selections') selections: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;

  saveAsPdf() {
    if (document.getElementById("coverageReportDownloadOptions")) {
      document.getElementById("coverageReportDownloadOptions").style.display = "none";
    }

    html2canvas(this.screen.nativeElement).then(canvas => {

      var imgData = canvas.toDataURL('image/jpeg');
      var doc = new jsPDF("l", "mm", "a4");
      var width = this.screen.nativeElement.width;
      var height = this.screen.nativeElement.height;

      let url = "";
      if (window.location.hostname === "localhost") {
        url = "http://" + window.location.hostname + ":4200/app/graphReport";  // URL to web api
      } else {
        url = "http://" + window.location.hostname + "/app/graphReport";  // URL to web api
      }

      url = url + "?project=" + this.selectedProject + "&execution=" + this.executionReportMode + "&tag=" + this.selectedtag + "&env=" + this.selectedEnvironment + "&release=" + this.selectedRelease + "&module=" + this.selectedModule + "&moduleName=" + this.selectedModuleName;

      doc.setFontSize(12);
      // doc.text(url, 35, 25);

      let projectName = "";
      this.clientProjects.forEach(element => {
        if (element.clientProjectId === this.selectedProject) {
          projectName = element.name;
        }
      });

      let selectedtag = this.selectedtag;

      let envName = "";
      this.environmentInfoArr.forEach(element => {
        if (element.executionEnvId === this.selectedEnvironment) {
          envName = element.executionEnvName;
        }
      });

      let relName = "";
      this.releaseAllArr.forEach(element => {
        if (element.releaseId === this.selectedRelease) {
          relName = element.releaseNumber;
        }
      });

      let moduleName = this.selectedModuleName;
      if (moduleName === "No Module Selected") {
        moduleName = "All Module Selected";
      }

      if (this.executionReportMode) {
        doc.textWithLink('Click Here to open Execution Report in Pintailer with:', 30, 20, { url: url });
        doc.text(30, 25, "Project: " + projectName);
        if (envName != "") {
          doc.text(30, 30, "Environment: " + envName);
        } else {
          doc.text(30, 30, "Environment: " + "Not Selected");
        }
        if (relName != "") {
          doc.text(30, 35, "Release: " + relName);
        } else {
          doc.text(30, 35, "Release: " + "Not Selected");
        }
        doc.text(30, 40, "Module: " + moduleName);
      }
      else {
        doc.textWithLink('Click Here to open Coverage Report in Pintailer with:', 30, 20, { url: url });
        doc.text(30, 25, "Project: " + projectName);
        if (selectedtag != "") {
          doc.text(30, 30, "Tag: " + selectedtag);
        } else {
          doc.text(30, 30, "Tag: " + "Not Selected");
        }
        doc.text(30, 35, "Module: " + moduleName);
      }

      doc.addImage(imgData, 'JPEG', 15, 45, width, height);
      doc.save('Pintailer_graph_data.pdf')

      if (document.getElementById("coverageReportDownloadOptions")) {
        document.getElementById("coverageReportDownloadOptions").style.display = "block";
      }
    });
  }

  saveAsImage() {
    let imageName = "";
    if (this.executionReportMode) {
      imageName = "execution-report-graph.png";
    } else {
      imageName = "coverage-report-graph.png";
    }

    html2canvas(this.screen.nativeElement).then(canvas => {
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
      this.downloadLink.nativeElement.download = imageName;
      this.downloadLink.nativeElement.click();

    });
  }

  openModuleSelection() {
    this.openModuleSelectionPopup("all", this.selectedProject);
  }

  openModuleSelectionPopup(message: string, projectId: number) {

    let dialogRef = this.dialog.open(ModuleSelectionComponent, {
      data: {
        moduleDataReceived: message,
        moduleProjectReceived: projectId
      },
      disableClose: true,
      panelClass: 'module-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != "cancel") {
        this.selectModuleName(result.nodeId, result.nodeName);
        this.fetchGraphData();
      }
    });

  }

}