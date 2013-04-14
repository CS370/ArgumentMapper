/**
 * Set up the UI elements that need to be driven by Javascript
 *
 * Uses the jQuery UI framework to make this effortless.
 *
 * Created by Tyler Young on 4 April 2013.
 */

var scope;
var canvas;
var context;

/**
 * Selects all premise-title textareas and forces them to automatically
 * resize (vertically)
 */
function makeTextareaAutoResize() {
    var textAreas = $('textarea.premise-title');

    textAreas.each( function() { // For each premise title text area
        if( $(this).attr('autoresizing') !== 'true' ) {
            $(this).attr('autoresizing', 'true'); // Set a flag so we don't re-bind the autoresizer to this element
            $(this).autoResize({ 'extraSpace': 0 });
            $(this).trigger('change.dynSiz');
        }
    });
}

/**
 * Returns the Presenter's copy (the model, loaded by canvasController.js)
 * of the argument map element with the given ID.
 * @param id int The ID of the premise to search for
 * @returns A premise object
 */
function findInScope(id) {
    if( id in scope.premises ) {
        return scope.premises[id];
    }
    console.log("Couldn't find premise with ID " + id.toString());
    console.log("Attributes: ");
    for( var key in id) {
        console.log("\t" + id[key]);
    }
}

/**
 * Draws the connection between the premise with the specified ID and
 * all elements to which it is connected.
 *
 * @TODO: Refactor this to a separate file? It's grown to be a bit of a mess.
 * @param connector {{start: {string | Array}, end: {string | array}}} The connector to draw
 */
function drawConnection(connector){
    /**
     * Parses the connection ID string to determine which side of the premise this handle is connected to.
     * @param connectionID string The ID of the invisible element this handle is snapped to.
     *                            Of the form [premise ID]-{left|right|top|bottom}
     */
    function getSideConnectedTo(connectionID) {
        if( connectionID.indexOf('top') !== -1 ) {
            return Sides.TOP;
        } else if( connectionID.indexOf('right') !== -1 ) {
            return Sides.RIGHT;
        } else if( connectionID.indexOf('bottom') !== -1 ) {
            return Sides.BOTTOM;
        } else if( connectionID.indexOf('left') !== -1 ) {
            return Sides.LEFT;
        }
    }

    /**
     * Parses the connection ID string to determine what orientation the handle should have.
     * @param connectionID {string|Sides enum} The ID of the invisible element this handle is snapped to.
     *                                         Of the form [premise ID]-{left|right|top|bottom}
     */
    function getOrientation(connectionID) {
        if( typeof(connectionID) === 'undefined' ) {
            return Orientations.HORIZONTAL;
        }

        if( typeof(connectionID) === 'number' ) {
            if( connectionID === Sides.TOP || connectionID === Sides.BOTTOM ){
                return Orientations.HORIZONTAL;
            } else {
                return Orientations.VERTICAL;
            }
        }

        if( connectionID.indexOf('top') !== -1 || connectionID.indexOf('bottom') !== -1 ) {
            return Orientations.HORIZONTAL;
        } else {
            return Orientations.VERTICAL;
        }
    }

    /**
     * Private: draws a Bezier curve between the starting and
     * ending coordinates on the canvas
     * @param startCoords {{left: number, top: number}} The x and y parameters of the line's starting position, like {top: 100, left: 200}
     * @param stopCoords {{left: number, top: number}} The x and y parameters of the line's ending position, like {top: 100, left: 200}
     * @param startConnectorLoc Sides enum The location of the connection on the starting element (top, bottom, left, or right)
     * @param stopConnectorLoc Sides enum The location of the connection on the ending element (top, bottom, left, or right)
     */
    var Orientations = { VERTICAL: 0, HORIZONTAL: 1 };
    function drawPath(startCoords, stopCoords, startConnectorLoc, stopConnectorLoc) {
        var ctrlPt1 = {'left': startCoords.left, 'top': (startCoords.top + stopCoords.top)/2 };
        var ctrlPt2 = ctrlPt1;

        var shiftAmt = 5;
        if( getOrientation(startConnectorLoc) === Orientations.HORIZONTAL ) {
            startCoords.left += 2 * shiftAmt - 10;
        } else {
            startCoords.top -= 2 * shiftAmt + 20;
        }

        context.beginPath();
        context.moveTo(startCoords.left, startCoords.top); // start point
        context.bezierCurveTo(ctrlPt1.left, ctrlPt1.top,
                              ctrlPt2.left, ctrlPt2.top,
                              stopCoords.left, stopCoords.top);

        // Draw connecting line
        if( getOrientation(stopConnectorLoc) === Orientations.HORIZONTAL ) {
            startCoords.left += shiftAmt / 2;
            context.lineTo(stopCoords.left, stopCoords.top);
        } else {
            startCoords.top += shiftAmt / 2;
            context.lineTo(stopCoords.left, stopCoords.top);
        }

        // Move the control point
        if( getOrientation(startConnectorLoc) === Orientations.HORIZONTAL ) {
            ctrlPt1.left -= shiftAmt;
            ctrlPt1.left -= shiftAmt;
            startCoords.left -= 4 * shiftAmt;
        } else {
            ctrlPt1.top += shiftAmt;
            ctrlPt2.top += shiftAmt;
            startCoords.top += 4 * shiftAmt;
        }
        if( startConnectorLoc == Sides.BOTTOM ) {
            ctrlPt1.top += shiftAmt;
            ctrlPt2.top += shiftAmt;
        } else if( startConnectorLoc == Sides.TOP ) {
            ctrlPt1.top -= shiftAmt;
            ctrlPt2.top -= shiftAmt;
        } else if( startConnectorLoc == Sides.RIGHT ) {
            ctrlPt1.left += shiftAmt;
            ctrlPt2.left += shiftAmt;
        } else { // Left
            ctrlPt1.left -= shiftAmt;
            ctrlPt2.left -= shiftAmt;
        }

        context.bezierCurveTo(ctrlPt1.left, ctrlPt1.top,
                              ctrlPt2.left, ctrlPt2.top,
                              startCoords.left, startCoords.top);

        context.lineWidth = 2; //px

        // line color
        context.strokeStyle = '#333';
        context.stroke();

        context.fillStyle = '#51a351';
        context.fill();

        context.closePath();
    }

    /**
     * Creates the connector handle with the specified ID
     * @param handleID string The ID (without a hash) of the handle to create. Should contain "start" or "end".
     */
    function updateHandlePosition(handleID) {
        var ConnectorType = { Start: "start", Stop: "end" };
        var type;
        if( handleID.indexOf('start') !== -1 ) {
            type = ConnectorType.Start;
        } else {
            type = ConnectorType.Stop;
        }

        var handleElement = $('#' + handleID);

        var left, top;
        if( typeof(connector[type]) !== "object" ) { // We know exactly which element it connects to
            var elementToConnectTo = $("#" + connector[type]);

            if( elementToConnectTo.length > 0 ) { // Element actually exists in DOM
                left = elementToConnectTo.position().left + elementToConnectTo.outerWidth() / 2 + elementToConnectTo.offsetParent().position().left;
                top = elementToConnectTo.position().top + elementToConnectTo.outerHeight() / 2 + elementToConnectTo.offsetParent().position().top;

                if( getOrientation(connector[type]) === Orientations.VERTICAL ) {
                    handleElement.addClass( "connector-vertical", 500 );
                } else {
                    handleElement.removeClass( "connector-vertical", 500 );
                }
            } else { // Element doesn't exist! Update the model accordingly.
                connector[type] = [handleElement.position().left, handleElement.position().top];
            }
        } else {
            left = connector[type][0];
            top = connector[type][1];
            handleElement.removeClass( "connector-vertical", 500 );
        }
        handleElement.css({
            'left': left,
            'top': top
        });
    }

    // Make sure the "handles" exist in the DOM
    var startHandleID = connector.id + "-start";
    var endHandleID = connector.id + "-end";

    updateHandlePosition(startHandleID);
    updateHandlePosition(endHandleID);

    var startHandle = $("#" + startHandleID);
    var startUpperLeft = startHandle.position();
    var startCenter = {'top': startUpperLeft.top + startHandle.innerHeight() / 2,
        'left': startUpperLeft.left + startHandle.innerWidth() / 2 };
    var endHandle = $("#" + endHandleID);
    var endUpperLeft = endHandle.position();
    var endCenter = {'top': endUpperLeft.top + endHandle.innerHeight() / 2,
        'left': endUpperLeft.left + endHandle.innerWidth() / 2 };

    // Draw the connection between the handles
    drawPath(startCenter,
             endCenter,
             getSideConnectedTo(connector.start),
             getSideConnectedTo(connector.end));

}

/**
 * Re-draws the connections between all premises
 */
function drawConnections() {
    canvas.clear();

    scope.argumentData.forEachConnector(function(connector){
        drawConnection(connector);
    });
}

/**
 * Performs all drawing actions. Must be called each time you update anything on the canvas element.
 */
function redrawCanvas() {
    drawConnections();
}

/**
 * Called whenever the browser window is resized.
 *
 * Because the size of the canvas element is relative to the size of the window, and the canvas requires
 * dimensions in pixels (not percentages!), we have to redraw.
 */
function resizeCanvas() {
    canvas.width = $("#theCanvas").outerWidth();
    canvas.height = $("#theCanvas").outerHeight();
    context.translate(0,-10); // correct for otherwise baffling error in the y direction

    redrawCanvas();
}

/**
 * Gives the options for dragging over a new premise box
 */
function makeNewPremiseDraggable() {
    $(".premise-demo, .rebuttal-demo").draggable({      // Mark everything with class "premise-demo" as draggable
        scroll: false,               // Don't scroll the element we're contained in
        grid: [ 5, 5 ],               // Snap to a 5px square grid
        stack: "#theCanvas div",    // Allow divs to be stacked within the canvas
        distance: 20,                 // Only move the div if it is dragged more than 20px (prevent accidents)
        helper: "clone",            // Makes a "clone" of the dragged object, instead of "moving" it
        revert: "invalid",             // Animates the invalid placement of new premise back to original place
        zIndex: 100
    });
}

/**
 * Gives the options for the droppable canvas
 */
function makeCanvasDroppable() {
    $("#theCanvas").droppable({      // Accept rebuttal-demo as well
        accept: ".rebuttal-demo, .premise-demo",
        tolerance: "intersect",
        drop: function(event, ui) {
            if(ui.draggable.attr("class") == "rebuttal-demo ui-draggable") {
                console.log("Added a Rebuttal");
                console.log(ui.draggable.attr("class"));
                scope.argumentData.addPremise(true, ui.offset);
            }
            else {
                console.log("Added a Premise");
                console.log(ui.draggable.attr("class"));
                scope.argumentData.addPremise(false, ui.offset);
            }
        }
    });
}

function bindCloseButtonEventHandler() {
    $('.premise .close').click(function(){
        console.log($(this).parent().parent());
        console.log("Deleting premise with ID " + $(this).parent().parent().attr('id'));
        scope.argumentData.removePremise($(this).parent().parent().attr('id'));
    });
}

function bindToolbarEventHandlers() {
    $("#addNewPremise").click(function() {
        scope.argumentData.addPremise();
    });
    $("#addNewRebuttal").click(function() {
        scope.argumentData.addPremise(true);
    });
    $("#addNewConnector").click(function() {
        scope.argumentData.addConnector();
        scope.$apply();
        redrawCanvas();
    });
}
/**
 * Handles the setup of the user interface components
 */
function main() {
    scope = $('#theCanvas').scope();

    // Set up the <canvas> element for drawing
    canvas = $("#drawing")[0];
    context = canvas.getContext('2d');
    canvas.clear = function () {
        // Store the current transformation matrix
        context.save();

        // Use the identity matrix while clearing the canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Restore the transform
        context.restore();
    };
    // resize the canvas to fill browser window dynamically
    $(window).resize(resizeCanvas);
    resizeCanvas();


    bindToolbarEventHandlers();
    bindCloseButtonEventHandler();

    makeTextareaAutoResize();

    makeNewPremiseDraggable();
    makeCanvasDroppable();
    redrawCanvas();
    setTimeout(redrawCanvas, 500);
}

$(document).ready(main); // When the document is loaded, run the "main" function
