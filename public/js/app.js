'use strict';

var QuiqupTest;

(function (window, QT) {
  QT = angular.module('quiqupTest', ['cb.x2js', 'leaflet-directive']);

  QT.controller('TIMSCtrl', ['$scope', 'TIMSSource', '$timeout', function($scope, TIMSSource, $timeout) {
    $scope.markers = [];

    TIMSSource.get(function(data) {
      var length,
          iterationsQty,
          dataPiece;

      //data is dividing into pieces and assigning to scope by timers (better performance)
      if (data && data.constructor == Array && (length = data.length)) {

        iterationsQty = Math.ceil(length/50);

        for(var i=0; i < iterationsQty; i++) {
          dataPiece = data.splice(0, 50);

          $timeout((function(dataPiece) {
            var markerPosition;

            dataPiece.forEach(function(item, index) {
              markerPosition = item.CauseArea.DisplayPoint.Point.coordinatesLL.split(',');

              $scope.markers.push({
                lat: parseFloat(markerPosition[1]),
                lng: parseFloat(markerPosition[0]),
                focus: false,
                message: item.comments,
                draggable: false
              });
            });
          })(dataPiece), 0);
        }
      }

    });

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

})(window, QuiqupTest);