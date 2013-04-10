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


function makeTextareaAutoResize() {
    $('textarea.premise-title').autoResize({ 'extraSpace': 0 });
    $("textarea.premise-title").trigger('change.dynSiz');
}


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

function connectPremise(id){
    function pxToInt(inPx) {
        if(inPx.length > 0) {
            return parseInt(inPx.replace('px',''));
        }
        return inPx; // Wasn't really a string!!
    }

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

    var premiseModel = findInScope(id);
    if( premiseModel.connectsTo > 0 ) {
        var premiseEl = $('#' + premiseModel.id);
        var w = premiseEl.innerWidth(); // in px
        var h = premiseEl.innerHeight();

        var offset = 5;
        premiseModel.coords = {
            "top": [pxToInt(premiseModel.left) + w/2, pxToInt(premiseModel.top) + offset],
            "bottom": [pxToInt(premiseModel.left) + w/2, pxToInt(premiseModel.top) + h - offset],
            "left": [pxToInt(premiseModel.left), pxToInt(premiseModel.top) + h/2],
            "right": [pxToInt(premiseModel.left) + w, pxToInt(premiseModel.top) + h/2]
        }
        console.log("Premise bottom center: " + premiseModel.coords.bottom.toString() );

        var otherModel = findInScope(premiseModel.connectsTo);
        var otherEl = $('#' + premiseModel.connectsTo);
        var otherPos = otherEl.position();
        var otherW = otherEl.outerWidth(); // in px
        var otherH = otherEl.outerHeight();
        otherModel.coords = {
            "top": [otherPos.left + otherW/2, otherPos.top + offset],
            "bottom": [otherPos.left + otherW/2, otherPos.top + otherH - offset],
            "left": [otherPos.left, otherPos.top + otherH/2],
            "right": [otherPos.left + otherW, otherPos.top + otherH/2]
        }

        drawPath(premiseModel.coords[premiseModel.connectorLoc], otherModel.coords[otherModel.connectorLoc] )
    }
}

function connectPremises() {
    canvas.clear();

    scope.premises.forEach(function(premise){
        connectPremise(premise.id);
    });
}

function doAllDrawings() {
    connectPremises();
}

function resizeCanvas() {
    canvas.width = $("#theCanvas").outerWidth();
    canvas.height = $("#theCanvas").outerHeight();

    doAllDrawings();
}

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
}

$(document).ready(main); // When the document is loaded, run the "main" function
