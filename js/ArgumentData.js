/**
 * The interface between the Canvas Presenter and the database.
 *
 * Created by Tyler Young on 12 April 2013.
 */

function ArgumentData() {
    this._premises = new Premises();
    this._connectors = new Connectors();
}


/**
 * Loads argument data. Currently a mock for database interactions.
 * @returns {int: {id: number, title: string, top: int, left: int, . . .}, . . .}
 *          An object with keys representing premise IDs,
 *          and values representing the data associated with the premises.
 */
ArgumentData.prototype.getPremiseList = function() {
    return this._premises;
};


/**
 * @returns string The title of the argument
 */
ArgumentData.prototype.getTitle = function() {
    return "Was the moon landing stage?";
};


/**
 * Loads the connectors in the argument. Currently a mock for database interactions.
 * @returns {{int: {start: string, end: string}, . . .}}
 */
ArgumentData.prototype.getConnectorsList = function() {
    return this._connectors;
}

/**
 * Creates a new connector.
 * @param isRebuttal boolean (Optional) If true, we'll mark this as a rebutting connector
 */
ArgumentData.prototype.addConnector = function(isRebuttal){
    if(typeof(isRebuttal)==='undefined') isRebuttal = false;

    console.log("Creating connector with id " + this.getNewID());
    this._connectors[this.getNewID()] = {
        id: this.getNewID(),
        start: [400, 300],
        end: [600, 400]
    };
};

/**
 * Removes a connector from the list of connectors.
 * @param id The ID of the connector to be removed.
 */
ArgumentData.prototype.removeConnector = function(id){
    delete this._connectors[id];
};


/**
 * Array-like functionality.
 * @param functionToRun The function to be run on all connector elements
 */
ArgumentData.prototype.forEachConnector = function(functionToRun) {
    for( var key in this._connectors ) {
        functionToRun(this._connectors[key]);
    }
};

/**
 * Creates a new premise in the scope's list of premises.
 * @param isRebuttal boolean (Optional) If true, we'll mark this as a rebuttal
 * @usage $scope.premises.addPremise();
 */
ArgumentData.prototype.addPremise = function(isRebuttal, droppedPosition){
    if(typeof(isRebuttal)==='undefined') isRebuttal = false;

    console.log("Creating premise with id " + this.getNewID());
    this._premises[this.getNewID()] = {
        "id": this.getNewID(),
        "title": "",
        "content": "You just added this premise!",
        "top": droppedPosition.top-75,
        "left": droppedPosition.left-200,
        "connectedFrom": {},
        "connectsTo": {},
        'additionalClasses': ( isRebuttal ? ' rebuttal' : '' )
    };
};

/**
 * Removes a premise from the list of premises.
 * @param premiseID The ID of the premise to be removed.
 */
ArgumentData.prototype.removePremise = function(premiseID){
    delete this._premises[premiseID];
};

/**
 * Array-like functionality.
 * @param functionToRun The function to be run on all premise elements
 */
ArgumentData.prototype.forEachPremise = function(functionToRun) {
    for( var key in this._premises ) {
        functionToRun(this._premises[key]);
    }
};

ArgumentData.prototype.getNewID = function () {
    var maxKnown = 0;
    for( var key in this._premises ) {
        if( key > maxKnown ) {
            maxKnown = key;
        }
    }

    for( var key in this._connectors ) {
        if( key > maxKnown ) {
            maxKnown = key;
        }
    }

    return ++maxKnown;
};


Sides = {
    TOP : 0,
    RIGHT : 1,
    LEFT : 2,
    BOTTOM: 3
}

/**
 * A class representing the set of premises in an argument
 */
function Premises() {
    // Data elements
    this[1234] = {
        "id": 1234,
        "title": "Everyone knows Roswell was a coverup",
        "content": "Lorem ipsum.",
        "top": 100,
        "left": 15,
        "group": 0,
        'additionalClasses': ''
    };
    this[8675309] = {
        "id": 8675309,
        "title": "The shadows are borked.",
        "content": "This description may be useless.",
        "top": 330,
        "left": 200,
        "group":0,
        'additionalClasses': ''
    };
    this[2] = {
        "id": 2,
        "title": "New premise.",
        "content": "This description may be useless.",
        "top": 60,
        "left": 450,
        "group": 0,
        'additionalClasses': ''
    };
    this[3] = {
        "id": 3,
        "title": "Far right side.",
        "content": "This description may be useless.",
        "top": 60,
        "left": 950,
        "group": 0,
        'additionalClasses': ''
    }
}

function Connectors() {
    this[3] = {
        id: 3,
        start: "1234-bottom",
        end: "8675309-left"
    };
    this[4] = {
        id: 4,
        start: "2-left",
        end: "1234-right"
    };
}
