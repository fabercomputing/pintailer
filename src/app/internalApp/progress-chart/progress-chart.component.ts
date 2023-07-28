import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { ClientProject } from '../client-project';
import { ClientProjectService } from '../client-project.service';
import { EnvironmentService } from '../environment.service';
import { GraphReportService } from '../graph-report.service';
import { LoginService } from '../login.service';
import { ModuleService } from '../module.service';
import { ReleaseMappingService } from '../release-mapping.service';
import { TestCaseDefinition } from '../testcase-definition';
import { TestcaseDefinitionService } from '../testcase-definition.service';

export class UserCountJson {
    User: string;
    Value: number;
}

@Component({
    selector: 'app-progress-chart',
    templateUrl: './progress-chart.component.html',
    styleUrls: ['./progress-chart.component.css']
})

export class ProgressChartComponent implements OnInit {

    // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
    organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
    selectedOrg: string;
    clientProjects: ClientProject[] = [];
    selectedProject = 0;
    clientProjectId: number;
    data: TestCaseDefinition[];
    isLoaded = false;

    inputStartDate = new Date();
    inputEndDate = new Date();

    totalDataLength = 0;
    currentDate: Date;

    constructor(private clientProjectService: ClientProjectService, private moduleService: ModuleService,
        private loginService: LoginService, private reportService: GraphReportService,
        private releaseMappingService: ReleaseMappingService,
        private environmentService: EnvironmentService,
        private testcaseDefinitionService: TestcaseDefinitionService) { }

    ngOnInit() {
        this.currentDate = new Date();
        this.getProjectsByOrganizationName(this.organization);
        // this.drawLineChart();
    }

    getProjectsByOrganizationName(name: string) {

        this.selectedOrg = name;
        this.clientProjectService.getClientProjects()
            .subscribe(
                result => {
                    if (result != undefined) {
                        this.clientProjects = result;
                        if (this.clientProjects.length > 0) {
                            this.clientProjectId = this.clientProjects[0].clientProjectId;
                        }
                        // this.getCoverageData();
                    }
                });
    }

    getTestCaseDefinitions(): void {
        const allProjectTempId = this.clientProjectId === undefined ? 0 : this.clientProjectId;
        d3.select('#TopLineChartDiv').selectAll('*').remove();
        d3.select('#userNameBar').selectAll('*').remove();

        this.isLoaded = true;
        this.testcaseDefinitionService.getTestCaseDefinitions(this.selectedOrg, allProjectTempId, 'all', null, null, null, 0, 0)
            .subscribe(
                testCaseDefinitions => {
                    this.data = testCaseDefinitions;

                    const startTime = this.inputStartDate;
                    const endTime = this.inputEndDate;

                    this.data = this.data.filter(function (el) {
                        // console.log(startTime.getTime() + " WWWWWWWWWWW " + el.createdDate)
                        if (el.createdDate > startTime.getTime() && el.createdDate < endTime.getTime()) {
                            return true;
                        }
                    });

                    this.totalDataLength = this.data.length;

                    console.log('IIIIIIII ' + this.data.length);

                    if (this.data.length > 0) {
                        this.drawLineChart();
                        this.showUserDateBar();
                    } else {
                        this.data = testCaseDefinitions;
                        this.noData();
                        this.isLoaded = false;
                    }
                });
    }

    noData() {
        d3.select('#TopLineChartDiv').selectAll('*').remove();
        if (this.data.length > 0) {
            d3.select('#TopLineChartDiv').append('mat-card').text('No Test Cases were uploaded since the selected Start Date: ' + this.inputStartDate.toDateString() + ' for the selected project. Last Uploaded: ' + new Date(d3.max(this.data, function (d) { return d.createdDate; })).toDateString() + '.');
        } else {
            d3.select('#TopLineChartDiv').append('mat-card').text('No Test Cases were uploaded since the selected Start Date: ' + this.inputStartDate.toDateString() + ' for the selected project.');
        }
    }

    countJson: UserCountJson[] = [];

    showUserDateBar() {

        const userArray: string[] = [];
        d3.select('#userNameBar').selectAll('*').remove();
        this.data.forEach(element => {
            userArray.push(element.createdBy);
            // console.log("@@@@@@@@@@@@@@ " + element.createdBy)
            // d3.select("#userNameBar").append("p").text(element.createdBy)
        });

        const counts = {};
        userArray.forEach(function (x) {
            counts[x] = (counts[x] || 0) + 1;
        });

        this.countJson.length = 0;

        for (let i in counts) {
            const countObj = new UserCountJson();

            countObj.User = i;
            countObj.Value = counts[i];

            this.countJson.push(countObj);
            // console.log("@@@@@@ " + counts[i]);
        }

        // d3.select("#userNameBar").append("p").text(textData)

        // counts.forEach(element => {

        // });

        // set the dimensions and margins of the graph
        let margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 500 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

        // set the ranges
        let x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
        let y = d3.scaleLinear()
            .range([height, 0]);

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        let svg = d3.select('#userNameBar').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');

        // get the data

        const data = this.countJson;

        // format the data
        data.forEach(function (d) {
            d.Value = +d.Value;
        });

        // Scale the range of the data in the domains
        x.domain(data.map(function (d) { return d.User; }));
        y.domain([0, d3.max(data, function (d) { return d.Value; })]);

        // append the rectangles for the bar chart
        svg.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar').style('fill', 'steelblue')
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut)
            .on('mousemove', handleMouseMove)
            .attr('x', function (d) { return x(d.User); })
            .attr('width', x.bandwidth())
            .attr('y', function (d) { return y(d.Value); })
            .attr('height', function (d) { return height - y(d.Value); });

        // add the x Axis
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append('g')
            .call(d3.axisLeft(y));

        // define tooltip
        let tooltip = d3.select('#userNameBar') // select element in the DOM with id 'chart'
            .append('div').classed('tooltip', true).style('position', 'absolute').style('background-color', 'whitesmoke') // append a div element to the element we've selected
            .style('pointer-events', 'none').style('box-shadow', '4px 4px 10px rgba(0, 0, 0, 0.4)');
        tooltip.append('div') // add divs to the tooltip defined above
            .attr('class', 'label'); // add class 'label' on the selection
        // tooltip.append('div') // add divs to the tooltip defined above
        //   .attr('class', 'count'); // add class 'count' on the selection
        // tooltip.append('div') // add divs to the tooltip defined above
        //   .attr('class', 'percent'); // add class 'percent' on the selection

        function handleMouseOver(d: any) {
            d3.select(this).style('stroke', 'black').style('fill', '#f09100');

            const toolText = d.User + ': ' + d.Value;

            tooltip.select('.label').html(toolText); // set current label

            tooltip.style('display', 'block'); // set display

            // tooltip.style('top', (d3.event.pageX + 10) + 'px'); // always 10px below the cursor
            // tooltip.style('left', (d3.event.pageY + 10) + 'px'); // always 10px to the right of the mouse

        }

        function handleMouseOut(d) {
            d3.select(this)
                .style('transform', 'scale(1)').style('stroke', 'white').style('fill', 'steelblue');

            tooltip.style('display', 'none'); // hide tooltip for that element

        }

        function handleMouseMove(d) {

            tooltip.style('top', (d3.event.layerY + 12) + 'px'); // always 10px below the cursor
            tooltip.style('left', (d3.event.layerX + 12) + 'px'); // always 10px to the right of the mouse

        }

        function tabulate(data, columns) {
            let table = d3.select('#userNameBar').append('table').style('float', 'right').style('border-collapse', 'collapse')
                .style('font-family', 'arial, sans-serif').style('width', '50%');
            let thead = table.append('thead');
            let tbody = table.append('tbody');

            // append the header row
            thead.append('tr')
                .selectAll('th')
                .data(columns).enter()
                .append('th').style('border', '1px solid #dddddd').style('text-align', 'left').style('padding', '8px')
                .text(function (column: any) {
                    if (column === 'Value') {
                        return 'Testcase Uploaded';
                    } else {
                        return column;
                    }
                });

            // create a row for each object in the data
            let rows = tbody.selectAll('tr')
                .data(data)
                .enter()
                .append('tr').style('background-color', function (d: any, i: any) { return i % 2 ? 'white' : '#f2f2f2' });

            // create a cell in each row for each column
            let cells = rows.selectAll('td')
                .data(function (row) {
                    return columns.map(function (column) {
                        return { column: column, value: row[column] };
                    });
                })
                .enter()
                .append('td').style('border', '1px solid #dddddd').style('text-align', 'left').style('white-space', 'pre').style('padding', '8px')
                .text(function (d: any) { return d.value; });

            return table;
        }

        // render the table(s)
        tabulate(data, ['User', 'Value']); // 2 column table

    }

    drawLineChart() {

        let tCounter = this.totalDataLength;

        d3.select('#TopLineChartDiv').selectAll('*').remove();

        // set the dimensions and margins of the graph
        let margin = { top: 20, right: 20, bottom: 30, left: 50 },
            width = 1200 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // parse the date / time
        let parseTime = d3.timeParse('%m/%d/%Y');

        // set the ranges
        let x = d3.scaleTime().range([0, width]);
        let y = d3.scaleLinear().range([height, 0]);

        // define the area
        let area: any = d3.area()
            .x(function (d: any) { return x(d.createdDate); })
            .y0(height)
            .y1(function (d: any, i) { return y(i); });

        // define the line
        let valueline: any = d3.line()
            .x(function (d: any) { return x(d.createdDate); })
            .y(function (d: any, i) {
                tCounter--;
                return y(tCounter);

            });
        // .curve(d3.curveBundle.beta(0.2));

        // append the svg obgect to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        let svg = d3.select('#TopLineChartDiv').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');

        // get the data
        // d3.csv("", function (data:any) {
        // if (error) throw error;

        // format the data

        // this.data.forEach(function (part, index, theArray) {

        //   part = part.substring(2, part.length);
        //   theArray[index] = part;

        // });

        this.data.forEach(function (part, index, theArray) {

            const formatedDate = new Date(part.createdDate).toLocaleDateString();
            part['Date'] = new Date();
            part['Date'] = parseTime(formatedDate);
            // console.log("@@@@@@@@@@@@@@ " + part["createdBy"])
            theArray[index] = part;
            // d.total_test_cases = +d.total_test_cases;
        });

        // scale the range of the data
        // x.domain([d3.min(this.data, function (d: any) { return d["Date"]; }), new Date()]);
        // y.domain([0, d3.max(this.data, function (d, i) { return i; }) + 200]);

        // scale the range of the data
        x.domain([this.inputStartDate, this.inputEndDate]);
        y.domain([0, tCounter + 200]);

        // add the area
        svg.append('path')
            .data([this.data])
            .attr('class', 'area').style('fill', 'none')
            .attr('d', area);

        // gridlines in x axis function
        function make_x_gridlines() {
            return d3.axisBottom(x);
        }

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(y);
        }

        // add the X gridlines
        svg.append('g')
            .attr('class', 'grid').style('opacity', '0.1')
            .attr('transform', 'translate(0,' + height + ')')
            .call(make_x_gridlines()
                .tickSize(-height)
            );

        // add the Y gridlines
        svg.append('g')
            .attr('class', 'grid').style('opacity', '0.1')
            .call(make_y_gridlines()
                .tickSize(-width)
            );

        // add the valueline path.
        svg.append('path')
            .data([this.data])
            .attr('class', 'line').style('fill', 'none').style('stroke', 'limegreen').style('stroke-width', '2px')
            .attr('d', function (d: any) {
                return valueline(d);
            }).call(transition);

        // add the X Axis
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));

        // add the Y Axis
        svg.append('g')
            .call(d3.axisLeft(y));

        // });

        function transition(path) {
            path.transition()
                .duration(450)
                .attrTween('stroke-dasharray', tweenDash);
        }

        function tweenDash() {
            let l = this.getTotalLength(),
                i = d3.interpolateString('0,' + l, l + ',' + l);
            return function (t) { return i(t); };
        }

        // // Define the div for the tooltip
        // var div = d3.select("body").append("div")
        //     .attr("class", "tooltip")
        //     .style("opacity", 0);

        // // Add the scatterplot
        // svg.selectAll("dot")
        //     .data(this.data)
        //     .enter().append("circle")
        //     .attr("r", 5)
        //     .attr("cx", function (d) {

        //         return x(d.createdDate);
        //     })
        //     .attr("cy", function (d: any, i) {
        //         tCounter--;
        //         return y(tCounter);

        //     })
        //     .on("mouseover", function (d) {
        //         div.transition()
        //             .duration(200)
        //             .style("opacity", .9);
        //         div.html("ddddddddddddddddddd")
        //             .style("left", (d3.event.pageX) + "px")
        //             .style("top", (d3.event.pageY - 28) + "px");
        //     })
        //     .on("mouseout", function (d) {
        //         div.transition()
        //             .duration(500)
        //             .style("opacity", 0);
        //     });

        this.isLoaded = false;
    }

    showSelectedDate() {
        // this.inputStartDate.setDate(this.inputStartDate.getDate() - 2);

        this.getTestCaseDefinitions();

    }

}
