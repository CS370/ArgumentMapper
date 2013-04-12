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
    $scope.argumentData = new ArgumentData();
    $scope.title = $scope.argumentData.getTitle();
    $scope.premises = $scope.argumentData.getPremiseList();


    // Override the default add() functionality to include a call to the view-updating methods
    $scope.argumentData.addPremise = function (isRebuttal) {
        ArgumentData.prototype.addPremise.call(this, isRebuttal);
        $scope.$apply();
        makeTextareaAutoResize();
        bindCloseButtonEventHandler();
    };
    $scope.argumentData.removePremise = function(id) {
        ArgumentData.prototype.removePremise.call(this, id);
        $scope.$apply();
    }
}


var app = angular.module('ArgumentMapper', []);

/**
 * Handles the draggable property of the elements in the canvas.
 *
 * This is an Angular.js "directive" to set up our premise elements.
 */
app.directive('premise',function() {
    return {
        template: '<div class="premise {{model.additionalClasses}}" id="{{model.id}}" ng-style="{ top: model.top, left: model.left}"><div ng-transclude></div></premise>',
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