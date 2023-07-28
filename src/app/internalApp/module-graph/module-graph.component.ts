import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import { ModuleService } from '../module.service'
import { Module } from '../module';
import { LoginService } from "../login.service"
import { ClientProjectService } from '../client-project.service'
import { ClientProject } from '../client-project'

@Component({
  selector: 'app-module-graph',
  templateUrl: './module-graph.component.html',
  styleUrls: ['./module-graph.component.css']
})
export class ModuleGraphComponent implements OnInit {

  // organizations: string[] = this.loginService.getUserInformationFromLocalStorage().userOrganizations;
  organization: string = this.loginService.getUserInformationFromLocalStorage().defaultOrganization;
  clientProjects: ClientProject[] = [];
  clientProjectId: number;
  moduleHierarchyArr2: Module[] = [];
  selectedProjectName: string;

  constructor(private clientProjectService: ClientProjectService, private moduleService: ModuleService, private loginService: LoginService) { }

  ngOnInit() {
    this.getProjectsByOrganizationName(this.organization);
  }

  getProjectsByOrganizationName(name: string) {
    this.organization = name;
    this.clientProjectService.getClientProjects()
      .subscribe(
        result => {
          if (result != undefined) {
            this.clientProjects = result;
            if (this.clientProjects.length > 0) {
              this.clientProjectId = this.clientProjects[0].clientProjectId;
              this.getModuleHierarchyByProjectName(this.clientProjectId);
              this.selectedProjectName = this.clientProjects[0].name;
            }
          }
        });
  }

  getModuleHierarchyByProjectName(clientProjectId: number): void {
    let allProjectTempId = 0;
    if (clientProjectId === undefined) {
      allProjectTempId = 0;
    } else {
      allProjectTempId = clientProjectId
    }
    this.moduleService.getModulesTree(allProjectTempId).subscribe(result => {
      this.mainModuleData.children = result;
      this.mainModuleData.name = this.selectedProjectName;
      this.generateModuleTreeGraph();
    })

  }

  addProjectName(projectName: string) {
    this.selectedProjectName = projectName;
  }

  mainModuleData = {
    "name": "flare",
    "children": [{
    }]
  }

  generateModuleTreeGraph() {

    d3.select("#moduleTreeRoot").selectAll("*").remove();

    // Set the dimensions and margins of the diagram
    var margin = { top: 20, right: 90, bottom: 30, left: 90 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#moduleTreeRoot").append("svg").attr("id", "main-svg")
      .attr("width", 5000)
      .attr("height", 1000)
      .append("g")
      .attr("transform", "translate("
        + margin.left + "," + margin.top + ")");

    var i = 0,
      duration = 750,
      root;

    // declares a tree layout and assigns the size
    var treemap = d3.tree().size([530, width])

    // Assigns parent, children, height, depth
    root = d3.hierarchy(this.mainModuleData, function (d: any) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 100;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);

    // Collapse the node and all it's children
    function collapse(d) {
      if (d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
      }
    }

    function update(source) {

      // compute the new height
      var levelWidth = [1];
      var childCount = function (level, n) {

        if (n.children && n.children.length > 0) {
          if (levelWidth.length <= level + 1) levelWidth.push(0);

          levelWidth[level + 1] += n.children.length;
          n.children.forEach(function (d) {
            childCount(level + 1, d);
          });
        }
      };
      childCount(0, root);
      var newHeight = d3.max(levelWidth) * 28; // 28 pixels per line  
      treemap = treemap.size([newHeight, width]);

      d3.select("#main-svg").attr("height", newHeight + 400)

      console.log("$$ " + root.level)

      // Assigns the x and y position for the nodes
      var treeData = treemap(root);

      // Compute the new tree layout.
      var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(function (d) { d.y = d.depth * 350 });

      // ****************** Nodes section ***************************

      // Update the nodes...
      var node = svg.selectAll('g.node')
        .data(nodes, function (d: any) { return d.id || (d.id = ++i); });

      // Enter any new modes at the parent's previous position.
      var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function () {
          return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on('click', click);

      // Add Circle for the nodes
      nodeEnter.append('circle').style("fill", "#fff").style("stroke", "steelblue").style("stroke-width", "3px")
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", function (d: any) {
          return d._children ? "lightsteelblue" : "#fff";
        });

      // Add labels for the nodes
      nodeEnter.append('text').style("font", "12px sans-serif")
        .attr("dy", ".35em")
        .attr("x", function (d: any) {
          return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function (d: any) {
          return d.children || d._children ? "end" : "start";
        })
        .text(function (d: any) { return d.data.name; });

      // UPDATE
      var nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        });

      // Update the node attributes and style
      nodeUpdate.select('circle.node')
        .attr('r', 10)
        .style("fill", function (d: any) {
          return d._children ? "lightsteelblue" : "#fff";
        })
        .attr('cursor', 'pointer');


      // Remove any exiting nodes
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function () {
          return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select('circle')
        .attr('r', 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select('text')
        .style('fill-opacity', 1e-6);

      // ****************** links section ***************************

      // Update the links...
      var link = svg.selectAll('path.link')
        .data(links, function (d: any) { return d.id; });

      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link").style("fill", "none").style("stroke", "#ccc").style("stroke-width", "2px").style("opacity", ".4")
        .attr('d', function () {
          var o = { x: source.x0, y: source.y0 }
          return diagonal(o, o)
        });

      // UPDATE
      var linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
        .duration(duration)
        .attr('d', function (d) { return diagonal(d, d.parent) });

      // Remove any exiting nodes
      var linkExit = link.exit().transition()
        .remove();
      // Store the old positions for transition.
      nodes.forEach(function (d: any) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Creates a curved (diagonal) path from parent to the child nodes
      function diagonal(s, d: any) {

        return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

      }

      // Toggle children on click.
      function click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }
    }
  }

}
