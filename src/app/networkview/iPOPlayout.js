

var app = angular.module('ipopApp', []);

app.service('iPOPdata', function($http, $q) {
    var self = this;

	self.getIPOP = function(mock) {
		var deferred = $q.defer();

        var url = mock ? '/api/iPOPMock' : '/api'
		$http.get(url)
		.then(function(response) {
		  	deferred.resolve(response.data);
		});   

        return deferred.promise;
	}

    var urls = "msProject,1067s,acats,budgets,dependencies,personnel,roles,users";

    urls.split(',').forEach(function(endpoint) {
        var url = '/api/' + endpoint;
        self['get'+ endpoint] = function() {
            var deferred = $q.defer();
            $http.get(url)
            .then(function(response) {
                deferred.resolve(response.data);
            }); 
            return deferred.promise;            
        }
    });


    return self;
});

app.controller('ipopController', function(iPOPdata) {
    var self = this;


    Date.prototype.addDays = function(days)
    {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }



    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
            }
        });
    }

    // https://bl.ocks.org/mbostock/7881887


    self.doCreateIPOP = function() {

        function makeTransform(dx,dy){
            return "translate(" + dx + "," + dy + ")"
        }

        var page = { width: 1500, height: 1200 };
        var margin = {top: 10, right: 30, bottom: 30, left: 10};
        var canvas = {width: page.width - (margin.left + margin.right), height: page.height  - (margin.top + margin.bottom)}

        var section = { width: 100, height: page.height, top: margin.top, left: margin.left   }
        var timeline = { width: page.width - section.width, height: page.height, top: margin.top, left: margin.left +  section.width   }


        var parseDate = d3.timeParse("%Y-%m-%d");
        var formatCount = d3.format(",.0f");


        var ipopSVG = d3.select("#ipop").append("svg")
            .attr("width", page.width)
            .attr("height", page.height);

        var canvasSVG = ipopSVG.append("g")
            .attr('id', 'canvas')
            .attr("transform", makeTransform( margin.left, margin.top));
        
        var sectionSVG = canvasSVG.append("g")
            .attr("class", "section")
            .attr("id", "section")
            .attr("transform", makeTransform(0,25))

        var timelineSVG = canvasSVG.append("g")
            .attr("class", "timeline")
            .attr("id", "timeline")
            .attr("transform", makeTransform(timeline.left,15))

        var timeAxisSVG = timelineSVG.append("g")
            .attr("class", "axis-time")
            .attr("transform", makeTransform(0,0))
        

        // sectionSVG.append("rect")
        //     .attr("fill", function(d, i) { return 'yellow'; })
        //     .attr("x", function(d) { return section.left; })
        //     .attr("y", function(d) { return section.top; })   
        //     .attr("width", function(d, i) { return section.width; })
        //     .attr("height", function(d, i) { return section.height; });
        
        var taskSize = {
            height: 10,
            width: 10,
            space: 2,
            spaceX: function() {
                return this.height + this.space;
            },
            size: function() {
                return this.height + this.space;
            }
        }

        var milestoneSize = {
            radius: 6,
            space: 2,
            spaceY: function(i) {
                console.log('spaceY =' + i)
                return this.radius + this.space;
            },
            size: function() {
                return this.radius + this.space;
            }
        }


        function buildList(hash){
            var list = [];
            for(var key in hash){
                var item = hash[key];
                list.push(item);
            }
            return list;
        }

        function buildMap(depth, list) {
            var hash = {};
            var result = {}
 
            list.forEach(function(item) {
                 var key = item.wbsList[depth];
                 if ( !hash[key] ) {
                    hash[key] = [];
                }
                hash[key].push(item);
            });

            for(var key in hash){
                var list = hash[key];
                var root = list.filter(function(item) { return item.depth === depth;})
                root = root.length > 0 ?  root[0] : {};
                root.childList = list.filter(function(item) { return item  !== root;})

                result[key] = root;
                root.childMap = buildMap(depth+1, root.childList);
            }

            return result;
        }


        iPOPdata.getmsProject().then(function(result) {
            var tasks = result.Project.Tasks.Task.filter(function(item){
                var title = item.Name.trim();
                return title && title.length;
            });

            var allTasks = tasks.map(function(item) {
                var wbsList = item.WBS.split('.');
                var depth = wbsList.length - 1;
                var title = item.Name.trim();
                return {
                    title: title.length ? title : "unknown section",
                    key: item.UID + item.Name,
                    isMilestone: item.Milestone == "0" ? false : true,
                    startDate: new Date(item.Start),
                    endDate: new Date(item.Finish),
                    uid: item.UID,
                    id: item.ID,
                    wbs: item.WBS,
                    wbsList: wbsList,
                    depth: depth,
                    
                    links: item.PredecessorLink
                }
            });


            var taskHash = buildMap(0,allTasks);

            var allsubtasks = [];
            var groups = buildList(taskHash);

            //groups = groups.splice(1,1);

            groups.forEach(function(item){
                allsubtasks = allsubtasks.concat(item.childList);

                item.milestones = item.childList.filter(function(item) { 
                    return item.isMilestone;
                });

                item.milestoneHeightTotal = milestoneSize.size() * ( 2 + item.milestones.length);

                item.tasks = item.childList.filter(function(item) { 
                    return !item.isMilestone;
                });

                item.taskHeightTotal = taskSize.size() * ( 2 + item.tasks.length);

                item.sectionHeight = Math.max(30, item.milestoneHeightTotal + item.taskHeightTotal);
                item.sectionHeight = Math.min(item.sectionHeight, 100);
            })

            var minDate = d3.min(allsubtasks, function(d) { return d.startDate.addDays(-30); });
            var maxDate = d3.max(allsubtasks, function(d) { return d.endDate.addDays(30); });

            var xAxis = d3.scaleTime()
                .domain([minDate, maxDate])
                .rangeRound([0, timeline.width]);

             var formatYearTimeline = d3.axisTop(xAxis).ticks(d3.timeYear).tickSize(20, 0)
                .tickFormat(d3.timeFormat("%Y"));

            var formatMonthTimeline = d3.axisTop(xAxis).ticks(d3.timeMonth).tickSize(20, 0)
                .tickFormat(d3.timeFormat("%b"))

           timeAxisSVG.append("g")
                .attr("class", "axis-year")
                .attr('id', 'year-timeline')
                .attr("transform", makeTransform(0,0))
                .call(formatYearTimeline)
                    .selectAll(".tick text")
                        .style("text-anchor", "start")
                        .attr("x", 6)
                        .attr("y", -6);

            timeAxisSVG.append("g")
                .attr("class", "axis-month")
                .attr('id', 'month-timeline')
                .attr("transform", makeTransform(0,20))
                .call(formatMonthTimeline)
                    .selectAll(".tick text")
                    .style("text-anchor", "start")
                    .attr("x", 6)
                    .attr("y", -6);
            
            self.msProject = JSON.stringify(groups, undefined, 3);



            var sectionStart = 20;
            groups.forEach(function(item){

                var yAxis = d3.scaleLinear()
                    .domain([0, item.sectionHeight])
                    .range([0, item.sectionHeight]);

                var sectionForceSVG = timelineSVG.append("g")
                    .attr("class", "sectionforcetimeline")
                    .attr("width", timeline.width)
                    .attr("height", item.sectionHeight)
                    .attr("id", 'force' + item.key)
                    .attr("transform", function(d, i) { return makeTransform(0, sectionStart); })

                sectionStart += item.sectionHeight;
                
                sectionForceSVG.append("line")
                    .style("stroke", "black")
                    .attr("x1", 0)
                    .attr("y1",  yAxis( 0))
                    .attr("x2", timeline.width)
                    .attr("y2",  yAxis( 0))

                sectionForceSVG.append("text")
                    .attr("dy", ".75em")
                    .attr("y", 6)
                    .attr("x", -.75 * section.width)
                    .attr("text-anchor", "left")
                    .text(item.title)


//now try a layout using forces  sectionForceSVG

                item.milestones.forEach(function(d){
                    d.cx = xAxis(d.startDate)
                })

                item.tasks.forEach(function(d){
                    d.cx = xAxis(d.startDate),             
                    d.width = xAxis(d.endDate) - xAxis(d.startDate),
                    d.height =  yAxis(taskSize.height)         
                })

                var allItems = [].concat(item.milestones,item.tasks);

                var simulation = d3.forceSimulation(allItems)
                    .force("x", d3.forceX(function(d) { return d.cx; }).strength(4))
                    .force("y", d3.forceY(function(d) { return 50; }).strength(1))
                    //.force("y", d3.forceY(function(d) { return item.forceSectionHeight / 2; }).strength(1))
                    .force("collide", d3.forceCollide(8))
                    //.force("charge", d3.forceManyBody(33))
                    //.force("x", d3.forceX())
                    //.force("center", d3.forceCenter(width / 2, height / 2));
   

                simulation.on('end', function() { 
                    console.log('ended!'); 
                });

                simulation.on('tick', function(x) { 
                    console.log('tick!' + x); 
                });

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

               var simTasks = sectionForceSVG.selectAll(".timelineForceTask")
                    .data(item.tasks)
                    .enter().append("rect")
                        .attr("class", "timelineForceTask")      
                        .attr("x", function(d,i) { return d.cx })
                        .attr("y", function(d,i) { return d.cy })   
                        .attr("width", function(d, i) { return d.width })
                        .attr("height", function(d, i) { return  d.height; })
                        .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended))

               var simTasksText = sectionForceSVG.selectAll(".timelineForceTaskText")
                    .data(item.tasks)
                    .enter().append("text")
                        .attr("class", "timelineForceTaskText") 
                        .attr("dy", ".75em")
                        .attr("x", function(d,i) { return d.cx; })
                        .attr("y", function(d,i) { return d.cy; })   
                        .attr("text-anchor", "start")
                        .text(function(d, i) { 
                            return `${d.title}`; 
                        })

                var simMilestones = sectionForceSVG.selectAll(".timelineForceMilestone")
                    .data(item.milestones)
                    .enter().append("circle")
                        .attr("class", "timelineForceMilestone")          
                        .attr("cx", function(d,i) { return d.cx; })
                        .attr("cy", function(d,i) { return d.cy; })   
                        .attr("r", function(d, i) { return  milestoneSize.radius; })
                        .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended));

                var simMilestonesText = sectionForceSVG.selectAll(".timelineForceMilestoneText")
                    .data(item.milestones)
                    .enter().append("text")
                        .attr("class", "timelineForceMilestoneText")     
                        .attr("dy", "-.75em")     
                        .attr("x", function(d,i) { return d.cx; })
                        .attr("y", function(d,i) { return d.cy })   
                        .attr("text-anchor", "start")
                        .text(function(d, i) { 
                            return `${d.title}`; 
                        })


                function collide(node) {
                    node.radius = 100;
                    var r = node.radius,
                        nx1 = node.x - r,
                        nx2 = node.x + r,
                        ny1 = node.y - r,
                        ny2 = node.y + r;
                    return function(quad, x1, y1, x2, y2) {
                        if (quad.point && (quad.point !== node)) {
                        var x = node.x - quad.point.x,
                            y = node.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = node.radius + quad.point.radius;
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


                simulation
                    .nodes(allItems)
                    .on("tick", ticked);

                //https://github.com/d3/d3-quadtree

                function ticked() {

                    var q = d3.quadtree().addAll(allItems),
                    i = 0,
                    n = allItems.length;

                    while (++i < n) {
                        q.visit(collide(allItems[i]));
                    }

                    simTasks
                        .attr("x", function(d,i) { return d.x })
                        .attr("y", function(d,i) { return d.y });  

                    simTasksText
                        .attr("x", function(d,i) { return d.x })
                        .attr("y", function(d,i) { return d.y }); 
                        
                    simMilestones
                        .attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });

                    simMilestonesText
                        .attr("x", function(d) { return d.x; })
                        .attr("y", function(d) { return d.y; });
                }


                             
            })

        });

       






        //   var line = root.append("line")
        //     .style("stroke", "black")
        //     .attr("x1", 150)
        //     .attr("y1", 100)
        //     .attr("x2", 250)
        //     .attr("y2", 300);


    }


    self.doCreateIPOP();
  });