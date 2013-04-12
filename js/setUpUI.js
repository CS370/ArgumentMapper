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
    for( var i = 0; i < scope.premises.length; i++) {
        if( scope.premises[i].id == id ) {
            return scope.premises[i];
        }
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
 * @param id int The ID of the premise whose connections you wish to draw
 */
function connectPremise(id){
    /**
     * Private: Convert a string in the format '123px' (as is used by Angular.JS)
     * into an integer like 123
     * @param inPx string A value with the label 'px' (like "1234px")
     * @returns int The measure as an integer (like 1234)
     */
    function pxToInt(inPx) {
        if(inPx.length > 0) {
            return parseInt(inPx.replace('px',''));
        }
        return inPx; // Was an int already!
    }


    /**
     * Private: draws a Bezier curve between the starting and
     * ending coordinates on the canvas
     * @param startCoords A 2-element array with the x and y parameters of the line's starting position, like [100, 200]
     * @param stopCoords A 2-element array with the x and y parameters of the line's ending position, like [100, 200]
     * @param startConnectorLoc string The location of the connection on the starting element (top, bottom, left, or right)
     * @param stopConnectorLoc string The location of the connection on the ending element (top, bottom, left, or right)
     */
    function drawPath(startCoords, stopCoords, startConnectorLoc, stopConnectorLoc) {
        var ctrlPt1 = [startCoords[0], (startCoords[1] + stopCoords[1])/2];
        var ctrlPt2 = ctrlPt1;

        context.beginPath();
        context.moveTo(startCoords[0], startCoords[1]); // start point
        context.bezierCurveTo(ctrlPt1[0], ctrlPt1[1],
                              ctrlPt2[0], ctrlPt2[1],
                              stopCoords[0], stopCoords[1]);

        context.lineWidth = 2; //px

        // line color
        context.strokeStyle = '#333';
        context.stroke();
        context.closePath();
    }


    /**
     * Gets the relevant coordinates for the premise in question
     * @param premiseModel The Angular.JS representation of the model for this premise
     * @returns {{top: Array, bottom: Array, left: Array, right: Array}}
     *          An object with the premise's top, bottom, left and right in the view (HTML)
     */
    function getCoords(premiseModel) {
        var premiseView = $('#' + premiseModel.id);
        var w = premiseView.innerWidth();
        var h = premiseView.innerHeight();
        var offset = 5;

        return {
            "top": [pxToInt(premiseModel.left) + w / 2, pxToInt(premiseModel.top) + offset],
            "bottom": [pxToInt(premiseModel.left) + w / 2, pxToInt(premiseModel.top) + h - offset],
            "left": [pxToInt(premiseModel.left), pxToInt(premiseModel.top) + h / 2],
            "right": [pxToInt(premiseModel.left) + w, pxToInt(premiseModel.top) + h / 2]
        };
    }

    // TODO: Don't try to draw if the premises don't exist
    var premiseModel = findInScope(id);
    premiseModel.coords = getCoords(premiseModel);
    for( var connectsToID in premiseModel.connectsTo ) {
        var otherModel = findInScope(connectsToID);
        otherModel.coords = getCoords(otherModel);

        drawPath(premiseModel.coords[premiseModel.connectsTo[connectsToID]],
                 otherModel.coords[otherModel.connectedFrom[id]],
                 premiseModel.connectedFrom[id],
                 otherModel.connectedFrom[id]);
    }


}

/**
 * Re-draws the connections between all premises
 */
function connectPremises() {
    canvas.clear();

    scope.premises.forEach(function(premise){
        connectPremise(premise.id);
    });
}

/**
 * Performs all drawing actions. Must be called each time you update anything on the canvas element.
 */
function redrawCanvas() {
    connectPremises();
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
        revert: "invalid"             // Animates the invalid placement of new premise back to original place
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
            console.log(ui.draggable.attr("class"));
            if(ui.draggable.attr("class") == "rebuttal-demo ui-draggable") {
                scope.premises.add(true);
            }
            else {
                scope.premises.add();
            }
        }
    });
}

function bindCloseButtonEventHandler() {
    $('.premise .close').click(function(){
        scope.premises.remove($(this).parent().parent().attr('id'));
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
    canvas.clear = function() {
        // Store the current transformation matrix
        context.save();

        // Use the identity matrix while clearing the canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Restore the transform
        context.restore();
    }
    // resize the canvas to fill browser window dynamically
    $(window).resize(resizeCanvas);
    resizeCanvas();


    bindCloseButtonEventHandler();

    makeTextareaAutoResize();

    makeNewPremiseDraggable();
    makeCanvasDroppable();
}

$(document).ready(main); // When the document is loaded, run the "main" function
