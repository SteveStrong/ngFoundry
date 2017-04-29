import { Tools } from '../foundry/foTools'
import { foConcept } from '../foundry/foConcept.model'

import * as d3 from 'd3';

export class Shape extends foConcept {
    public color = d3.scaleOrdinal(d3.schemeCategory20);

    constructor(properties?: any) {
        super(properties);
        this.myType = 'Shape';
    }

    localGeom(item) {
        item.append("rect")
            .attr("width", d => d.width)
            .attr("height", function (d) { return d.height; })
            .attr("fill", function (d) { return this.color(d.group); })
            .append("text")
            .attr("class", "text-style");

        //.attr("dy", ".75em")
        item.attr("y", function (d) { return d.height / 2; })
            .attr("x", function (d) { return d.width / 2; })
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .text(function (d) {
                return d.text + d.myGuid;
            });

        return item;
    };
}

export class DockerecosystemModel {

    nodeDef = new Shape({
        id: "steve",
        group: 1,
        width: 80,
        height: 40,
        text: "hello"
    });

    doGeom(item) {

        let root = item
            .append("rect")
            .attr("width", d => d.width)
            .attr("height", function (d) { return d.height; })
            .attr("fill", function (d) { return d3.scaleOrdinal(d3.schemeCategory20)(d.group); })
            .append("text")
            .attr("class", "text-style");

        
        item.attr("y", function (d) { return d.height / 2; })
            .attr("x", function (d) { return d.width / 2; })
            //.attr("dy", ".75em")
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .text(function (d) {
                return d.text + d.myGuid;
            });

        return root;
    };
}