/**
 * The interface between the Canvas Presenter and the database.
 *
 * Created by Tyler Young on 12 April 2013.
 */

function ArgumentData() {
    this._premises = new Premises();
    this._connectors = new Connectors();
    this._containers = new Containers();
    this._title = "Was the moon landing staged?";
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
    return this._title;
};

ArgumentData.prototype.setTitle = function( theTitle ) {
    this._title = theTitle;
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
 * Loads the connectors in the argument. Currently a mock for database interactions.
 * @returns {{int: {start: string, end: string}, . . .}}
 */
ArgumentData.prototype.getContainersList = function() {
    // Need to add the list of premise objects (rather than just their IDs)
    for( var key in this._containers ) {
        this._containers[key].premises = [];
        if( key != 'premises' ) {
            var crntContainer = this._containers[key];

            // For each premise in the list of contained premises
            for( var crntPremise = 0; crntPremise < crntContainer.containedPremisesIDs.length; crntPremise++ ) {
                var containedPremiseID = crntContainer.containedPremisesIDs[crntPremise];
                crntContainer.premises.push(this._premises[containedPremiseID]);

                if( this._premises[containedPremiseID].group != key ) {
                    console.log("\tFound premise " + containedPremiseID + " is not actually in group " + key);
                    this.removeContainer(key);
                    break;
                }
            }
        }
    }

    return this._containers;
}

/**
 * Creates a new premise in the scope's list of premises.
 * @param isRebuttal boolean If true, we'll mark this as a rebuttal
 * @param droppedPosition {top: number, left: number} The position of the new premise in the canvas
 * @return The ID of the newly created premise
 * @usage $scope.premises.addPremise();
 */
ArgumentData.prototype.addPremise = function(isRebuttal, droppedPosition){
    if(typeof(isRebuttal)==='undefined') isRebuttal = false;

    if(typeof(droppedPosition)==='undefined') droppedPosition = {top: 200, left: 300};

    var newID = this.getNewID();
    console.log("Creating premise with id " + newID);
    this._premises[newID] = {
        "id": newID,
        "title": "",
        "content": "You just added this premise!",
        "top": droppedPosition.top-75,
        "left": droppedPosition.left-200,
        "connectedFrom": {},
        "connectsTo": {},
        'additionalClasses': ( isRebuttal ? ' rebuttal' : '' ),
        'group': 0
    };
    return newID;
};

/**
 * Removes a premise from the list of premises.
 * @param premiseID The ID of the premise to be removed.
 */
ArgumentData.prototype.removePremise = function(premiseID){
    delete this._premises[premiseID];
    console.log(this._containers);
    for( var key in this._containers ) {
        var premisesObjects = this._containers[key].premises;
        for( var premiseObject = 0; premiseObject< premisesObjects.length; premiseObject++) {
            if( premisesObjects[premiseObject].id == premiseID ) {
                premisesObjects.remove(premiseObject)

                var idList = this._containers[key].containedPremisesIDs;
                for( var i = 0; i < idList.length; i++ ) {
                    if( idList[i] == premiseID ) {
                        idList.remove(i);
                    }
                }
            }
        }
    }
    console.log(this._containers);
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


/**
 * Creates a new premise in the scope's list of premises.
 * @param idOfThingDroppedOnto {number} The ID of the first premise (the one that was dropped onto)
 * @param idOfThingDropped {number} the ID of the second premise (the one that was dropped)
 */
ArgumentData.prototype.addContainer = function(idOfThingDroppedOnto, idOfThingDropped){
    function replaceIndex( startOrEnd, idToCheck, idToReplaceWith ) {
        if( connector[startOrEnd].indexOf(idToCheck) >= 0 ) {
            // Replace the ID with this one
            // parseInt pulls the leading int out of the string
            console.log("Replacing a connector: rather than connecting to " + connector[startOrEnd] + ",");
            connector[startOrEnd] = connector[startOrEnd].replace(parseInt(connector[startOrEnd]), idToReplaceWith);
            console.log("                       we'll connect to " + connector[startOrEnd]);
        }
    }

    // Create the container
    var position = {
        top: this._premises[idOfThingDroppedOnto].top,
        left: this._premises[idOfThingDroppedOnto].left
    };

    var containerID = this.getNewID();
    console.log("Creating container with id " + containerID);
    this._containers[containerID] = {
        "id": containerID,
        "containedPremisesIDs": [idOfThingDropped, idOfThingDroppedOnto],
        "top": position.top,
        "left": position.left
    };

    // Add necessary classes to the premises
    this._premises[idOfThingDroppedOnto].additionalClasses += " grouped";
    this._premises[idOfThingDropped].additionalClasses += " grouped";

    // Set the group IDs to match the container
    if(!this.premiseIsGrouped(idOfThingDroppedOnto)){
        this._premises[idOfThingDroppedOnto].group = containerID;
        console.log("Group of the premise you dropped onto is now " + this._premises[idOfThingDroppedOnto].group);
    } else {
        console.log("That premise was already grouped.");
    }
    this._premises[idOfThingDropped].group = containerID;
    console.log("Group of the premise you dropped is now " + this._premises[idOfThingDropped].group);


    // If these premises had connectors attached, re-attach the connectors to the box
    for( var connectorID in this._connectors ) {
        var connector = this._connectors[connectorID];

        // If these were connected to each other
        if( (connector.start.indexOf(idOfThingDropped) >= 0 && connector.end.indexOf(idOfThingDroppedOnto) >= 0)
            || (connector.end.indexOf(idOfThingDropped) >= 0 && connector.start.indexOf(idOfThingDroppedOnto) >= 0) ) {
            delete this._connectors[connectorID];
        } else {
            var keysToCheck = ["start", "end"];
            var idsToCheck = [idOfThingDropped, idOfThingDroppedOnto];
            for( var i = 0; i < keysToCheck.length; i++ ) {
                for( var j = 0; j < idsToCheck.length; j++ ) {
                    replaceIndex(keysToCheck[i], idsToCheck[j], containerID);
                }
            }
        }
    }

    return containerID;
};

/**
 * @param premiseID {number} The ID of the premise in question
 * @returns {boolean} True if the premise in question is indeed grouped with others (inside a container)
 */
ArgumentData.prototype.premiseIsGrouped = function(premiseID) {
    return (typeof(this._premises[premiseID].group) !== "undefined" && this._premises[premiseID].group > 0 );
}

/**
 * Adds a premise to an existing container
 * @param idOfPremise number The ID of the premise to add
 * @param idOfContainer number The container to add this premise to
 */
ArgumentData.prototype.addPremiseToContainer = function(idOfPremise, idOfContainer){
    this._containers[idOfContainer].containedPremisesIDs.push(idOfPremise);
}

/**
 * Removes a container from the list of containers.
 * @param containerID The ID of the container to be removed.
 */
ArgumentData.prototype.removeContainer = function(containerID){
    console.log("Deleting container:");
    console.log(this._containers[containerID]);

    // Ungroup all contained premises
    var containedPremiseIDs = this._containers[containerID].containedPremisesIDs;
    for(var i = 0; i < containedPremiseIDs.length; i++ ) {
        var premise = this._premises[containedPremiseIDs[i]];
        premise.group = 0;
        premise.additionalClasses = premise.additionalClasses.replace("grouped", "");

        // TODO: Place the premises in a place that makes sense
    }

    delete this._containers[containerID];
};

/**
 * Deletes all premises, containers, and connectors in the argument.
 */
ArgumentData.prototype.clearArgument = function() {
    console.log("Clearing all premises, connectors, and containers!");
    this._premises = {};
    this._connectors = {};
    this._containers = {};
    this._title = "";
};

