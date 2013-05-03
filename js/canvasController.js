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
    $scope.update = function() {
        $scope.containers = $scope.argumentData.getContainersList();
        console.log("Containers:");
        console.log($scope.containers);

        $scope.premises = $scope.argumentData.getPremiseList();

        $scope.uncontainedPremises = [];
        $scope.argumentData.forEachPremise(function(premise) {
            if( premise.group == 0 || typeof(premise.group) === "undefined" ) {
                $scope.uncontainedPremises.push(premise);
            }
        });
        console.log("Uncontained premises:");
        console.log($scope.uncontainedPremises);

        $scope.title = $scope.argumentData.getTitle();
        $scope.connectors = $scope.argumentData.getConnectorsList();

    }

    $scope.argumentData = new ArgumentData();

    $scope.update();

    // Override the default add() functionality to include a call to the view-updating methods
    $scope.argumentData.addPremise = function (isRebuttal, droppedPosition) {
        var theID = ArgumentData.prototype.addPremise.call(this, isRebuttal, droppedPosition);
        updateFromModel();

        bindHandlersForPremises();
        return theID;
    };
    $scope.argumentData.removePremise = function(id) {
        ArgumentData.prototype.removePremise.call(this, id);
        $scope.update();
        $scope.$apply();
    }
    $scope.argumentData.removeConnector = function(id) {
        ArgumentData.prototype.removeConnector.call(this, id);
        $scope.update();
        $scope.$apply();
    }
    $scope.argumentData.addConnector = function (isRebuttal) {
        ArgumentData.prototype.addConnector.call(this, isRebuttal);
        $scope.update();
        $scope.$apply();
        bindCloseConnectorEventHandler();
    };
    $scope.argumentData.addContainer = function (premise0, premise1) {
        var newID = ArgumentData.prototype.addContainer.call(this, premise0, premise1);
        $scope.update();
        $scope.$apply();
        return newID;
    };
    $scope.argumentData.addPremiseToContainer = function (idOfPremise, idOfContainer) {
        ArgumentData.prototype.addPremiseToContainer.call(this, idOfPremise, idOfContainer);
        $scope.update();
        $scope.$apply();
    }
}


var app = angular.module('ArgumentMapper', []);

/**
 * Handles the premise elements in the canvas.
 *
 * This is an Angular.js "directive" to set up our premise elements.
 */
app.directive('premise',function() {
    return {
        template: '<div class="premise {{model.additionalClasses}}" id="{{model.id}}" group="{{model.group}}" ng-style="{ top: model.top, left: model.left}">'
            + '<div ng-transclude>'
            + '<div id="{{model.id}}-top" class="connect-point connect-point-top"></div>'
            + '<div id="{{model.id}}-right" class="connect-point connect-point-right"></div>'
            + '<div id="{{model.id}}-bottom" class="connect-point connect-point-bottom"></div>'
            + '<div id="{{model.id}}-left" class="connect-point connect-point-left"></div>'
            + '</div></premise>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            model: '='
        },
        link: function postLink(scope, element, iAttrs, ctrl) {
            $(".premise").draggable({
                start: function () {          // A dummy method called when a drag starts
                    console.log("Drag started");

                    if( $(this).attr('group') > 0 ) {
                        scope.model.group = 0;
                        var pos = $(this).offset();
                        $(this).css({
                            'position': 'absolute',
                            'top': pos.top,
                            'left': pos.left
                        });
                        scope.model.top = pos.top;
                        scope.model.left = pos.left;

                        updateFromModel();
                    }
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
                    redrawCanvas();
                },
                containment: "#theCanvas",  // Contain this element in the canvas element
                scroll: false,               // Don't scroll the element we're contained in
                grid: [ 5, 5 ],               // Snap to a 5px square grid
                stack: "#theCanvas .premise",    // Allow divs to be stacked within the canvas
                distance: 20                 // Only move the div if it is dragged more than 20px (prevent accidents)
            });
        }
    };
});

/**
 * Handles the premise elements in the canvas.
 *
 * This is an Angular.js "directive" to set up our premise elements.
 */
app.directive('connector',function() {
    return {
        template: '<div class="connector-container" id="connector-{{model.id}}"">'
            + '<div ng-transclude></div></connector>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            model: '='
        },
        link: function postLink(scope, element, iAttrs, ctrl) {
            var connectors = element.find(".connector");
            connectors.draggable({
                containment: "#theCanvas",  // Contain this element in the canvas element
                scroll: false,               // Don't scroll the element we're contained in
                stack: "#theCanvas div",    // Allow divs to be stacked within the canvas
                snap: ".connect-point:not(premise-container.connect-point)",
                snapMode: "outer",
                drag: function () {           // Called when a drag is in progress
                    var type;
                    if( $(this).attr('id').indexOf('start') !== -1 ) {
                        type = "start";
                    } else {
                        type = "end";
                    }

                    var handleElement = $(this);
                    scope.$apply(function read() {
                        scope.model[type] = [handleElement.position().left, handleElement.position().top];
                    });
                    redrawCanvas();
                },
                stop: function (event, ui) {
                    var type;
                    if( $(this).attr('id').indexOf('start') !== -1 ) {
                        type = "start";
                    } else {
                        type = "end";
                    }

                    /* Get the possible snap targets: */
                    var snapped = $(this).data('uiDraggable').snapElements;

                    /* Pull out only the snap targets that are "snapping": */
                    var snappedTo = $.map(snapped, function(element) {
                        return element.snapping ? element.item : null;
                    });

                    if( typeof($(snappedTo).attr('id')) !== 'undefined' ) {
                        scope.model[type] = $(snappedTo).attr('id');
                        console.log("Snapped to " + scope.model.end);
                    }
                    redrawCanvas();
                }
            });
        }
    };
});

/**
 * Handles the premise elements in the canvas.
 *
 * This is an Angular.js "directive" to set up our premise elements.
 */
app.directive('premiseContainer',function() {
    return {
        template: '<div class="premise-container" id="{{model.id}}" ng-style="{ top: model.top, left: model.left}">'
            + '<div ng-transclude>'
            + '<div id="{{model.id}}-top" class="connect-point connect-point-top"></div>'
            + '<div id="{{model.id}}-right" class="connect-point connect-point-right"></div>'
            + '<div id="{{model.id}}-bottom" class="connect-point connect-point-bottom"></div>'
            + '<div id="{{model.id}}-left" class="connect-point connect-point-left"></div>'
            + '</div></premise-container>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            model: '='
        },
        link: function postLink(scope, element, iAttrs, ctrl) {
            $(".premise-container").draggable({
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
                stack: "#theCanvas .premise",    // Allow divs to be stacked within the canvas
                distance: 20                 // Only move the div if it is dragged more than 20px (prevent accidents)
            });
        }
    };
});