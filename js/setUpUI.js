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
    $('textarea.premise-title').autoResize({ 'extraSpace': 0 });
    $("textarea.premise-title").trigger('change.dynSiz');
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
     */
    function drawPath(startCoords, stopCoords) {
        // For now, we'll just make these straight lines
        var ctrlPt1 = startCoords;
        var ctrlPt2 = stopCoords;

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


    var premiseModel = findInScope(id);
    if( premiseModel.connectsTo > 0 ) {

        premiseModel.coords = getCoords(premiseModel);

        var otherModel = findInScope(premiseModel.connectsTo);
        otherModel.coords = getCoords(otherModel);

        drawPath(premiseModel.coords[premiseModel.connectorLoc], otherModel.coords[otherModel.connectorLoc] )
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

function makeNewPremiseDraggable() {
    $(".premise-demo").draggable({      // Mark everything with class "premise-demo" as draggable
        scroll: false,               // Don't scroll the element we're contained in
        grid: [ 5, 5 ],               // Snap to a 5px square grid
        stack: "#theCanvas div",    // Allow divs to be stacked within the canvas
        distance: 20,                 // Only move the div if it is dragged more than 20px (prevent accidents)
        helper: "clone",
        revert: "invalid"
    });
}

function makeCanvasDroppable() {
    $("#theCanvas").droppable({      // Mark everything with id "theCanvas" as draggable
        accept: ".premise-demo",
        tolerance: "fit",
        drop: function(event, ui) {
            scope.premises.add();
        }

    });
}

/**
 * Handles the setup of the user interface components
 */
function main() {
    scope = $('#theCanvas').scope();

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

    makeTextareaAutoResize();


    // resize the canvas to fill browser window dynamically
    $(window).resize(resizeCanvas);
    resizeCanvas();

    scope.premises.add();
    makeNewPremiseDraggable();
    makeCanvasDroppable();
}

$(document).ready(main); // When the document is loaded, run the "main" function
