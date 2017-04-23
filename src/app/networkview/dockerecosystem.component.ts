import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Http } from '@angular/http';

import * as d3 from 'd3';

@Component({
  selector: 'foundry-dockerecosystem',
  templateUrl: './dockerecosystem.component.html',
  styleUrls: ['./dockerecosystem.component.css']
})
export class DockerecosystemComponent implements OnInit {
  graph: any = {}

  constructor(private http: Http, private vcr: ViewContainerRef) {

  }

  ngOnInit() {

  var root = this.vcr.element.nativeElement;
  let width = 960;
  let height = 600;

  var svg = d3.select(root)
    .append("svg")
    .attr("width", width)
    .attr("height", height)

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function (d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    this.http.get('miserables.json')
      .subscribe(res => {
        this.graph = res.json()

        var link = svg.append("g")
          .attr("class", "links-style")
          .selectAll("line")
          .data(this.graph.links)
          .enter().append("line")
          .attr("stroke-width", function (d) { return Math.sqrt(d.value); });


        var node = svg.append("g")
          .attr("class", "nodes-style")
          .selectAll("circle")
          .data(this.graph.nodes)
          .enter().append("circle")
          .attr("r", 5)
          .attr("fill", function (d) { return color(d.group); })
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        node.append("title")
          .text(function (d) { return d.id; });

        simulation
          .nodes(this.graph.nodes)
          .on("tick", ticked);

        simulation.force("link")
          .links(this.graph.links);

        function ticked() {
          link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

          node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
        }

      })






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

  }

}
