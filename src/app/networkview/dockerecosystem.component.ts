import { Component, OnInit, ViewContainerRef } from '@angular/core';


import * as d3 from 'd3';


import { DockerecosystemService } from "./dockerecosystem.service";


function makeTransform(dx: number, dy: number, s: number = 0) {
  if (s) {
    return `translate(${dx},${dy}) scale (${s})`
  }
  return `translate(${dx},${dy})`
}

function zoomHandler(vis) {
  vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

@Component({
  selector: 'foundry-dockerecosystem',
  templateUrl: './dockerecosystem.component.html',
  styleUrls: ['./dockerecosystem.component.css']
})
export class DockerecosystemComponent implements OnInit {
  graph: any = {}
  svgRoot: any = {}
  scale: number = 1.0;
  scaleFactor: number = 0.2;
  Tx: number = 0.0;
  Ty: number = 0.0;
  width: number = 960;
  height: number = 600;

  constructor(private vcr: ViewContainerRef, private service: DockerecosystemService) {

  }


  scaleOut() {
    this.scale -= this.scaleFactor;
    this.Tx -= this.scaleFactor * this.width / 2;
    this.Ty -= this.scaleFactor * this.height / 2;
    this.svgRoot
      .attr("transform", makeTransform(this.Tx, this.Ty, this.scale))
      .attr("width", this.width / this.scale)
      .attr("height", this.height / this.scale)
  }

  scaleIn() {
    this.scale += this.scaleFactor;
    this.Tx += this.scaleFactor * this.width / 2;
    this.Ty += this.scaleFactor * this.height / 2;
    this.svgRoot
      .attr("transform", makeTransform(this.Tx, this.Ty, this.scale))
      .attr("width", this.width / this.scale)
      .attr("height", this.height / this.scale)
  }


  // zoomListener = d3.behavior.zoom()
  //   .scaleExtent([0.1, 3])
  //   .on("zoom", zoomHandler);

  ngOnInit() {

    var root = this.vcr.element.nativeElement;

    this.svgRoot = d3.select(root)
      .append("svg")
      .attr("class", "svg-canvas")
      .attr("width", this.width)  //.attr("width", "100%")
      .attr("height", this.height)

    //this.zoomListener(this.svgRoot);




    this.service.getEcosystem()
      .subscribe(res => {
        this.graph = res.json();

        var allLinks = this.graph.links.map(function (item) {
          return item;
        });

        var link = this.svgRoot.append("g")
          .attr("class", "links-style")
          .selectAll("line")
          .data(allLinks)
          .enter().append("line")
          .attr("stroke-width", function (d) { return Math.sqrt(d.value); });

        var boxWidth = 80;
        var boxHeight = 40;
        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var counter = 0;
        var allNodes = this.graph.nodes.map(function (item) {
          var count = 3;
          counter++;
          var quotient = Math.floor(counter / count);

          item.width = boxWidth;
          item.height = boxHeight;
          item.x = 100 * quotient;
          item.y = boxHeight;
          //console.log(item);
          return item;
        });

        var node = this.svgRoot.append("g")
          .attr("class", "nodes-style")
          .selectAll(".node-body")
          .data(allNodes)
          .enter().append("g")
          .attr("class", "node-body")
          //.attr("transform", makeTransform(0, 0))
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        node.append("rect")
          .attr("width", function (d) { return d.width; })
          .attr("height", function (d) { return d.height; })
          .attr("fill", function (d) { return color(d.group); });


        node.append("text")
          //.attr("dy", ".75em")
          .attr("y", boxHeight / 2)
          .attr("x", boxWidth / 2)
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", "10px")
          .text(function (d) { return d.id; })



        var simulation = d3.forceSimulation()
          .force("x", d3.forceX(function (d) { return d.x; }).strength(4))
          //.force("y", d3.forceY(function (d) { return d.y; }).strength(1))
          .force("collide", d3.forceCollide(22))
          //.force("link", d3.forceLink().id(function (d) { return d.id; }))
          //.force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(this.width / 2, this.height / 2));


        simulation
          .nodes(allNodes)
          .on("tick", ticked);

        //simulation.force("link")
        //  .links(allLinks);


        function collide(node) {
          var r = node.width,
            nx1 = node.x - node.width / 2,
            nx2 = node.x + node.width / 2,
            ny1 = node.y - node.heigth / 2,
            ny2 = node.y + node.heigth / 2;
          return function (quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
              var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.width + quad.point.radius;
              if (l < r) {
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
              }
            }
            return x1 > nx2
              || x2 < nx1
              || y1 > ny2
              || y2 < ny1;
          };
        }

        function ticked() {


          var q = d3.quadtree().addAll(allNodes),
            i = 0,
            n = allNodes.length;

          while (++i < n) {
            q.visit(collide(allNodes[i]));
          }

          link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

          node
            .attr("transform", function (d) {
              return makeTransform(d.x - d.width / 2, d.y - d.height / 2)
            })
        }


        function dragstarted(d) {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        function dragended(d) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

      })








  }

}
