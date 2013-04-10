/**
 * The canvas presenter.
 *
 * Uses the Jasmine framework for Javascript unit testing.
 *
 * To run the unit tests, open SpecRunner.html in your browser.
 *
 * Created by Tyler Young on 4 April 2013.
 */

function CanvasPresenter($scope) {
    /**
     * Returns a new ID which is not in conflict with any existing IDs in this document.
     * @returns int A non-conflicting ID
     */
    function getNewID() {
        var maxKnown = -1;
        for( var i = 0; i < $scope.premises.length; i++ ) {
            if($scope.premises[i].id > maxKnown) {
                maxKnown = $scope.premises[i].id;
            }
        }
        maxKnown++;
        return maxKnown;
    }

    $scope.premises = [
        {"id": 1234,
            "title": "Everyone knows Roswell was a coverup",
            "content": "Lorem ipsum.",
            "top": 100,
            "left": 15,
            "connectorLoc": 'bottom',
            "connectsTo": 8675309},
        {"id": 8675309,
            "title": "The shadows are borked.",
            "content": "This description may be useless.",
            "top": 330,
            "left": 200,
            "connectorLoc": 'left',
            "connectsTo": 1234}
    ];

    /**
     * Creates a new premise in the scope's list of premises.
     * @usage $scope.premises.add();
     */
    $scope.premises.add = function(){
        this.push({
            "id": getNewID(),
            "title": "",
            "content": "You just added this premise!",
            "top": 300,
            "left": 500
        });
        $scope.$apply();
        makeTextareaAutoResize();
    };
    $scope.title = "Was the moon landing faked?";
}


var app = angular.module('ArgumentMapper', []);

/**
 * Handles the draggable property of the elements in the canvas.
 *
 * This is an Angular.js "directive" to set up our premise elements.
 */
app.directive('premise',function() {
    return {
        template: '<div class="premise" id="{{model.id}}" ng-style="{ top: model.top, left: model.left}"><div ng-transclude></div></premise>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            model: '='
        },
        link: function postLink(scope, element, iAttrs, ctrl) {
            element.draggable({
                start: function () {          // A dummy method called when a drag starts
                    console.log("Drag started");
                },
                drag: function () {           // Called when a drag is in progress
                    console.log("Drag in progress");

                    scope.$apply(function read() {
                        scope.model.top = element.css('top');
                        scope.model.left = element.css('left');
                    });
                    redrawCanvas();
                },
                stop: function () {           // A dummy method called when a drag ends
                    console.log("Drag ended");
                },
                containment: "#theCanvas",  // Contain this element in the canvas element
                scroll: false,               // Don't scroll the element we're contained in
                grid: [ 5, 5 ],               // Snap to a 5px square grid
                stack: "#theCanvas div",    // Allow divs to be stacked within the canvas
                distance: 20                 // Only move the div if it is dragged more than 20px (prevent accidents)
            });
        }
    };
});

