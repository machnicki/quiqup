'use strict';

var QuiqupTest;

(function (window, QT, _) {
  QT = angular.module('quiqupTest', ['cb.x2js', 'leaflet-directive']);

  QT.controller('TIMSCtrl', ['$scope', 'TIMSSource', '$timeout', '$q', function($scope, TIMSSource, $timeout, $q) {
    var promiseGetMarkersFiltered; //reference to timeout for filtetring markers by street

    $scope.street = '';

    $scope.getNewData = function() {
      $scope.isLoading = true; //true when map is waiting for new markers
      $scope.markers = [];
      $scope.markersFiltered = []; //filtered markers by street

      TIMSSource.get(function(data) {
        var length,
          iterationsQty,
          dataPiece,
          deferred, //use to check the end of looping in timers
          allPromises = [];

        //data is dividing into pieces and assigning to $scope by timers (better performance)
        if (data && data.constructor == Array && (length = data.length)) {
          iterationsQty = Math.ceil(length/50);

          for(var i=0; i < iterationsQty; i++) {
            deferred = $q.defer();

            allPromises.push(deferred.promise);

            dataPiece = data.splice(0, 50);

            (function(dataPiece, deferred) {

              $timeout(function() {
                var markerPosition,
                    markers = [],
                    streets = []; //use for filters

                dataPiece.forEach(function(item, index) {
                  markerPosition = item.CauseArea.DisplayPoint.Point.coordinatesLL.split(',');

                  if(item.CauseArea.Streets && item.CauseArea.Streets.Street && item.CauseArea.Streets.Street.constructor == Array) {
                    item.CauseArea.Streets.Street.forEach(function(street) {
                      streets.push(street.name);
                    });
                  }

                  markers.push({
                    lat: parseFloat(markerPosition[1]),
                    lng: parseFloat(markerPosition[0]),
                    focus: false,
                    message: item.comments,
                    draggable: false,
                    streets: streets.join(', ')
                  });
                });

                deferred.resolve(markers);
              }, 0);
            })(dataPiece, deferred);

          }

          //one markers assignment into $scope for better performance
          $q.all(allPromises).then(function(data) {
            var newMarkers = [];

            $scope.markers = newMarkers.concat.apply(newMarkers, data);

            $scope.getMarkersFiltered();

            $scope.isLoading = false;
          });
        }
      });
    };

    $scope.getNewData();

    //filter by street
    $scope.$watch('street', _.debounce(function() {
      $timeout.cancel(promiseGetMarkersFiltered);

      promiseGetMarkersFiltered = $timeout(function() {
        $scope.getMarkersFiltered();
      }, 0);
    }, 500));

    //on view I use $scope.markersFiltered array
    $scope.getMarkersFiltered = function() {

      $scope.markersFiltered = $scope.markers.filter(function(marker) {
        if ($scope.street) {
          if (marker.streets && marker.streets.indexOf($scope.street) > -1) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      });
    };

    //set the starting position
    angular.extend($scope, {
      london: {
        lat: 51.505,
        lng: -0.09,
        zoom: 10
      },
      position: {
        lat: 51,
        lng: 0
      }
    });
  }]);

  //get data from webservice and transform from XML to JSON
  QT.factory('TIMSSource', ['$http', 'x2js', function($http, x2js) {
    return {
      get: function(callback) {
        $http.get(
          'http://data.tfl.gov.uk/tfl/syndication/feeds/tims_feed.xml?app_id=5ab7117a&app_key=e975ed062b4650c6b17c180fd02712db'
        ).success(function(data) {
            var json = x2js.xml_str2json(data);

            //todo make validation - object should have good structure
            callback(json.Root.Disruptions.Disruption)
        });
      }
    };
  }]);

})(window, QuiqupTest, _);