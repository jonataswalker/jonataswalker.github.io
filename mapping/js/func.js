JSON.stringifyOnce = function(obj, replacer, indent){
    var printedObjects = [];
    var printedObjectKeys = [];

    function printOnceReplacer(key, value){
        if ( printedObjects.length > 2000){ // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
        return 'object too long';
        }
        var printedObjIndex = false;
        printedObjects.forEach(function(obj, index){
            if(obj===value){
                printedObjIndex = index;
            }
        });

        if ( key == ''){ //root element
             printedObjects.push(obj);
            printedObjectKeys.push("root");
             return value;
        }

        else if(printedObjIndex+"" != "false" && typeof(value)=="object"){
            if ( printedObjectKeys[printedObjIndex] == "root"){
                return "(pointer to root)";
            }else{
                return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase()  : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
            }
        }else{

            var qualifiedKey = key || "(empty key)";
            printedObjects.push(value);
            printedObjectKeys.push(qualifiedKey);
            if(replacer){
                return replacer(key, value);
            }else{
                return value;
            }
        }
    }
    return JSON.stringify(obj, printOnceReplacer, indent);
};


function stringifyOnce(obj, replacer, indent){
    var printedObjects = [];
    var printedObjectKeys = [];
    
    function printOnceReplacer(key, value){
    var printedObjIndex = false;
    printedObjects.forEach(function(obj, index){
    if(obj===value){
    printedObjIndex = index;
    }
    });
    
    if(printedObjIndex && typeof(value)=="object"){
    return "(see " + value.constructor.name.toLowerCase() + " with key " + printedObjectKeys[printedObjIndex] + ")";
    }else{
    var qualifiedKey = key || "(empty key)";
    printedObjects.push(value);
    printedObjectKeys.push(qualifiedKey);
    if(replacer){
    return replacer(key, value);
    }else{
    return value;
    }
    }
    }
    return JSON.stringify(obj, printOnceReplacer, indent);
}
/**
    * Returns the index of the layer within the collection.
    * @param {type} layers
    * @param {type} layer
    * @returns {Number}
    */
function indexOf(layers, layer) {
    var length = layers.getLength();
    for (var i = 0; i < length; i++) {
        if (layer === layers.item(i)) {
            return i;
        }
    }
    return -1;
}
function findByName(name) {
    var layers = map.getLayers();
    var length = layers.getLength();
    for (var i = 0; i < length; i++) {
        if (name === layers.item(i).get('name')) {
            return layers.item(i);
        }
    }
    return null;
}
function raiseLayer(layer) {
    var layers = map.getLayers();
    var index = indexOf(layers, layer);
    if (index < layers.getLength() - 1) {
        var next = layers.item(index + 1);
        layers.setAt(index + 1, layer);
        layers.setAt(index, next);
    }
}
function lowerLayer(layer) {
    var layers = map.getLayers();
    var index = indexOf(layers, layer);
    if (index > 0) {
        var prev = layers.item(index - 1);
        layers.setAt(index - 1, layer);
        layers.setAt(index, prev);
    }
}
/*****
******/