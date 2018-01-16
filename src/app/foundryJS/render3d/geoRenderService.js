// angular service directive
(function (app, fo, geo, undefined) {

    app.service('geoRenderService', function ($location) {

        function getHttpContext() {
            if (location) {
                return location.protocol + "//" + location.host + location.pathname.slice(0, location.pathname.indexOf('/', 1));
            }
        };

        function imageBase(url) {
            var base = $location.protocol() + ':' + '//' + $location.host() + ':' + $location.port();
            return base + '/assets/images' + url;
        }


        this.imageUrl = imageBase;


        this.init = geo.init;

        this.renderList = function (list, defaultIcon, group) {

            geo.clearPlacemarkGroup(group);

            if (!list || !list.length) return;

            var localIcon = defaultIcon ? defaultIcon : imageBase('/map/location.png');

            //var tooltipLabelGroup = geo.createLabelGroup(new geo.LabelOptions());
            //var tooltipLabel = geo.addLabel(tooltipLabelGroup);

            function itemSelected(item, mouseEventType, keyboardQualifer) {
                fo.publish('itemSelected', [item, geo]);
            }


            geo.registerSelectionCallback(group, itemSelected, geo.ScreenSpaceEventType.LEFT_CLICK);

            //now you need to draw both dictionaries
            list.forEach(function (item) {
                if (!item.latitude || !item.longitude) return;
                var customIcon = item.customIcon ? item.customIcon : localIcon;

                geo.addPlacemark(group, item, geo.Position.fromDegrees(item.latitude, item.longitude), customIcon, 1, item.currentHeading || 0);
            })
            return group;
        };


        var airportsGroup;
        this.renderAirports = function (list, defaultIcon) {
            airportsGroup = airportsGroup ? airportsGroup : geo.createPlacemarkGroup();
            var icon = defaultIcon ? defaultIcon : imageBase('/map/location.airport.png');
            return this.renderList(list, icon, airportsGroup);
        };

        var locationsGroup;
        this.renderLocations = function (list, defaultIcon) {
            locationsGroup = locationsGroup ? locationsGroup : geo.createPlacemarkGroup();
            var icon = defaultIcon ? defaultIcon : imageBase('/map/location.png');
            return this.renderList(list, icon, locationsGroup);
        };

        var flightsGroup;
        this.renderFlights = function (list, defaultIcon) {
            flightsGroup = flightsGroup ? flightsGroup : geo.createPlacemarkGroup();
            var icon = defaultIcon ? defaultIcon : imageBase('/map/airplane.png');
            return this.renderList(list, icon, flightsGroup);
        };

        var pathsGroup;
        this.renderFlightPaths = function (list) {

            pathsGroup = pathsGroup ? pathsGroup : geo.createPolylineGroup(2, geo.Color.fromCssColorString('#00FF00', 0.5));
            geo.clearPolylineGroup(pathsGroup);

            if (!list || !list.length) return;


            list.forEach(function (flight) {
                var start = flight.departsAirport && flight.departsAirport.first;
                if (!start) return;

                var positions = [
                    geo.Position.fromDegrees(flight.latitude, flight.longitude),
                    geo.Position.fromDegrees(start.latitude, start.longitude),
                ];

                geo.addPolyline(pathsGroup, positions);

            });

        };

        var regionsGroup;
        this.renderRegions = function (list) {

            regionsGroup = regionsGroup ? regionsGroup : geo.createPolylineGroup(2, geo.Color.fromCssColorString('#00FF00', 0.5));
            geo.clearPolylineGroup(regionsGroup);

            list.forEach(function (item) {
                var positions = item.pointList.map(function (track) {
                    return geo.Position.fromDegrees(track.lat, track.lng);
                });

                geo.addPolyline(regionsGroup, positions);

            });

        }

        this.flyTo = function (flight) {
            geo.flyTo(geo.Position.fromDegrees(flight.latitude, flight.longitude));
        }

        this.clearAll = function () {
            this.renderAirports([]);
            this.renderFlights([]);
            this.renderFlightPaths([]);
            this.renderLocations([]);
            this.renderRegions([]);
        }

    });

}(foApp, Foundry, AIS.Globe));