Number.prototype.toDeg = function() { return this * 180 / Math.PI; }
Number.prototype.toRad = function() { return this * Math.PI / 180; }
function toRad(x) {return x * Math.PI / 180;}

// Distance in kilometers between two points using the Haversine algo.
function haversine(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1).toRad();
    var dLong = (lon2 - lon1).toRad();

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return Math.round(d);
}
//The Spherical Law of Cosines
//Original source: "http://www.movable-type.co.uk/scripts/latlong.html"
function SphericalCosinus(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLon = (lon2-lon1).toRad(); 
    var lat1 = lat1.toRad();
    var lat2 = lat2.toRad();
    var d = Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
                                            Math.cos(lat1)*Math.cos(lat2) *
                                            Math.cos(dLon)) * R;

    return Math.round(d);
}
function addFeature(arrayXY, vector_source) {
    var i, lat, lon, geom, feature, features = [];

    geom = new ol.geom.LineString(
        ol.proj.transform(arrayXY, 'EPSG:4326', 'EPSG:3857')
    );

    feature = new ol.Feature(geom);

    vectorSource.addFeature(feature);
    return feature;
}
// Add 10 random circle features
function addFeatures() {
    var i, lat, lon, geom, feature, features = [];
    for(i=0; i< 10; i++) {
        lat = Math.random() * 174 - 87;
        lon = Math.random() * 360 - 180;

        geom = new ol.geom.Circle(
            ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'), 
            100000
        );

        feature = new ol.Feature(geom);
        features.push(feature);
    }    
    vectorSource.addFeatures(features);
    return features;
}

// Remove 10 features
function removeFeatures() {
    var features = vectorSource.getFeatures();
    for(var i=0; i< features.length && i<10; i++) {
        vectorSource.removeFeature(features[i]);
    }
}
function mapFly(destino){
    var startcenter = map.getView().getCenter();
    var resolution = 152.8740565703525;
    var start = +new Date();
    
    var center4326 = ol.proj.transform(startcenter, 'EPSG:3857', 'EPSG:4326');
    var destino4326 = ol.proj.transform(destino, 'EPSG:3857', 'EPSG:4326');
    var distance = SphericalCosinus(center4326[1], center4326[0], destino4326[1], destino4326[0]);
    var duration = distance.round() * 1.1;

    var pan = ol.animation.pan({
        duration: duration,
        source: startcenter,
        start: start
    });
    var bounce = ol.animation.bounce({
        duration: duration,
        resolution: 9783.9396,
        start: start
    });
    
    //map.removeOverlay(popup);
    map.beforeRender(pan, bounce);
    map.getView().setCenter(destino);
    map.getView().setResolution(resolution);
    
    
    
}

function createOverlay() {
    return new ol.Overlay({
        element: container,
        positioning: 'top-right'
    });
}
function number_format( number, decimals, dec_point, thousands_sep ) {
    var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
    var d = dec_point == undefined ? "." : dec_point;
    var t = thousands_sep == undefined ? "," : thousands_sep, s = n < 0 ? "-" : "";
    var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}
function formataMilhar(valor){
    return number_format(valor, 0, '', '.');
}
var formatLength = function(length) {
  var output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) + ' ' + 'm';
  }
  return output;
};
function setCoordinateAndShow(coordinate) {
    // Set position
    overlay.setPosition(coordinate);
    // Update overlay label
    $('coordinate').set('text', ol.coordinate.toStringXY(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'), 2));
    // Show overlay
    container.setStyle('display', 'block'); 
}
function toggleFullScreen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
    (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {  
            document.documentElement.requestFullScreen();  
        } else if (document.documentElement.mozRequestFullScreen) {  
            document.documentElement.mozRequestFullScreen();  
        } else if (document.documentElement.webkitRequestFullScreen) {  
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
        }  
    } else {  
        if (document.cancelFullScreen) {  
            document.cancelFullScreen();  
        } else if (document.mozCancelFullScreen) {  
            document.mozCancelFullScreen();  
        } else if (document.webkitCancelFullScreen) {  
            document.webkitCancelFullScreen();  
        }  
    }  
}

function indexOf(e,t){var n=e.getLength();for(var r=0;r<n;r++){if(t===e.item(r)){return r}}return-1}function findByName(e){var t=map.getLayers();var n=t.getLength();for(var r=0;r<n;r++){if(e===t.item(r).get("name")){return t.item(r)}}return null}function raiseLayer(e){var t=map.getLayers();var n=indexOf(t,e);if(n<t.getLength()-1){var r=t.item(n+1);t.setAt(n+1,e);t.setAt(n,r)}}function lowerLayer(e){var t=map.getLayers();var n=indexOf(t,e);if(n>0){var r=t.item(n-1);t.setAt(n-1,e);t.setAt(n,r)}}

JSON.stringifyOnce=function(e,t,n){function s(n,s){if(r.length>2e3){return"object too long"}var o=false;r.forEach(function(e,t){if(e===s){o=t}});if(n==""){r.push(e);i.push("root");return s}else if(o+""!="false"&&typeof s=="object"){if(i[o]=="root"){return"(pointer to root)"}else{return"(see "+(!!s&&!!s.constructor?s.constructor.name.toLowerCase():typeof s)+" with key "+i[o]+")"}}else{var u=n||"(empty key)";r.push(s);i.push(u);if(t){return t(n,s)}else{return s}}}var r=[];var i=[];return JSON.stringify(e,s,n)}

/**
 * Observer - Observe formelements for changes
 *
 * - Additional code from clientside.cnet.com
 *
 * @version             1.1
 *
 * @license             MIT-style license
 * @author              Harald Kirschner <mail [at] digitarald.de>
 * @copyright   Author
 */
var Observer = new Class({

        Implements: [Options, Events],

        options: {
                periodical: false,
                delay: 1000
        },

        initialize: function(el, onFired, options){
                this.element = $(el) || $$(el);
                this.addEvent('onFired', onFired);
                this.setOptions(options);
                this.bound = this.changed.bind(this);
                this.resume();
        },

        changed: function() {
                var value = this.element.get('value');
                if ($equals(this.value, value)) return;
                this.clear();
                this.value = value;
                this.timeout = this.onFired.delay(this.options.delay, this);
        },

        setValue: function(value) {
                this.value = value;
                this.element.set('value', value);
                return this.clear();
        },

        onFired: function() {
                this.fireEvent('onFired', [this.value, this.element]);
        },

        clear: function() {
                clearTimeout(this.timeout || null);
                return this;
        },

        pause: function(){
                if (this.timer) clearInterval(this.timer);
                else this.element.removeEvent('keyup', this.bound);
                return this.clear();
        },

        resume: function(){
                this.value = this.element.get('value');
                if (this.options.periodical) this.timer = this.changed.periodical(this.options.periodical, this);
                else this.element.addEvent('keyup', this.bound);
                return this;
        }

});

var $equals = function(obj1, obj2) {
        return (obj1 == obj2 || JSON.encode(obj1) == JSON.encode(obj2));
};

/**
 * Autocompleter
 *
 * http://digitarald.de/project/autocompleter/
 *
 * @version             1.1.2
 *
 * @license             MIT-style license
 * @author              Harald Kirschner <mail [at] digitarald.de>
 * @copyright   Author
 */

var Autocompleter = new Class({

        Implements: [Options, Events],

        options: {/*
            onOver: $empty,
            onSelect: $empty,
            onSelection: $empty,
            onShow: $empty,
            onHide: $empty,
            onBlur: $empty,
            onFocus: $empty,*/
            minLength: 1,
            markQuery: true,
            width: 'inherit',
            maxChoices: 10,
            injectChoice: null,
            customChoices: null,
            emptyChoices: null,
            visibleChoices: true,
            className: 'autocompleter-choices',
            zIndex: 42,
            delay: 400,
            observerOptions: {},
            fxOptions: {},

            autoSubmit: false,
            overflow: false,
            overflowMargin: 25,
            selectFirst: false,
            filter: null,
            filterCase: false,
            filterSubset: false,
            forceSelect: false,
            selectMode: true,
            choicesMatch: null,

            multiple: false,
            separator: ', ',
            separatorSplit: /\s*[,;]\s*/,
            autoTrim: false,
            allowDupes: false,

            cache: true,
            relative: false
        },

        initialize: function(element, options) {
            this.element = $(element);
            this.setOptions(options);
            this.build();
            this.observer = new Observer(this.element, this.prefetch.bind(this), Object.merge({
                    'delay': this.options.delay
            }, this.options.observerOptions));
            this.queryValue = null;
            if (this.options.filter) this.filter = this.options.filter.bind(this);
            var mode = this.options.selectMode;
            this.typeAhead = (mode == 'type-ahead');
            this.selectMode = (mode === true) ? 'selection' : mode;
            this.cached = [];
        },

        /**
         * build - Initialize DOM
         *
         * Builds the html structure for choices and appends the events to the element.
         * Override this function to modify the html generation.
         */
        build: function() {
            if ($(this.options.customChoices)) {
                this.choices = this.options.customChoices;
            } else {
                this.choices = new Element('ul', {
                    'class': this.options.className,
                    'styles': {
                        'zIndex': this.options.zIndex
                    }
                }).inject(document.body);
                this.relative = false;
                if (this.options.relative) {
                    this.choices.inject(this.element, 'after');
                    this.relative = this.element.getOffsetParent();
                }
                this.fix = new OverlayFix(this.choices);
            }
            if (!this.options.separator.test(this.options.separatorSplit)) {
                this.options.separatorSplit = this.options.separator;
            }
            this.fx = (!this.options.fxOptions) ? null : new Fx.Tween(this.choices, Object.merge({
                    'property': 'opacity',
                    'link': 'cancel',
                    'duration': 200
            }, this.options.fxOptions)).addEvent('onStart', Chain.prototype.clearChain).set(0);
            this.element.setProperty('autocomplete', 'off')
                    .addEvent((Browser.ie || Browser.safari || Browser.chrome) ? 'keydown' : 'keypress', this.onCommand.bind(this))
                    .addEvent('click', this.onCommand.bind(this, false));
            document.addEvent('click', function(e){
                    if (e.target != this.choices) this.toggleFocus(false);
            }.bind(this));
        },

        destroy: function() {
            if (this.fix) this.fix.destroy();
            this.choices = this.selected = this.choices.destroy();
        },

        toggleFocus: function(state) {
            this.focussed = state;
            if (!state) this.hideChoices(true);
            this.fireEvent((state) ? 'onFocus' : 'onBlur', [this.element]);
        },
        onCommand: function(e) {
            if (!e && this.focussed) return this.prefetch();
            if (e && e.key && !e.shift) {
                switch (e.key) {
                    case 'enter':
                        if (this.element.value != this.opted) return true;
                        if (this.selected && this.visible) {
                            this.choiceSelect(this.selected);
                            this.fireEvent('choiceConfirm', this.selected);
                            return !!(this.options.autoSubmit);
                        }
                        break;
                    case 'up': case 'down':
                        if (!this.prefetch() && this.queryValue !== null) {
                            var up = (e.key == 'up');
                            this.choiceOver((this.selected || this.choices)[
                                    (this.selected) ? ((up) ? 'getPrevious' : 'getNext') : ((up) ? 'getLast' : 'getFirst')
                            ](this.options.choicesMatch), true);
                        }
                        return false;
                    case 'esc': case 'tab':
                        this.hideChoices(true);
                        break;
                }
            }
            return true;
        },
        setSelection: function(finish) {
            var input = this.selected.inputValue, value = input;
            var start = this.queryValue.length, end = input.length;
            if (input.substr(0, start).toLowerCase() != this.queryValue.toLowerCase()) start = 0;
            if (this.options.multiple) {
                var split = this.options.separatorSplit;
                value = this.element.value;
                start += this.queryIndex;
                end += this.queryIndex;
                var old = value.substr(this.queryIndex).split(split, 1)[0];
                value = value.substr(0, this.queryIndex) + input + value.substr(this.queryIndex + old.length);
                if (finish) {
                    var tokens = value.split(this.options.separatorSplit).filter(function(entry) {
                            return this.test(entry);
                    }, /[^\s,]+/);
                    if (!this.options.allowDupes) tokens = [].combine(tokens);
                    var sep = this.options.separator;
                    value = tokens.join(sep) + sep;
                    end = value.length;
                }
            }
            this.observer.setValue(value);
            this.opted = value;
            if (finish || this.selectMode == 'pick') start = end;
            this.element.selectRange(start, end);
            this.fireEvent('onSelection', [this.element, this.selected, value, input]);
        },

        showChoices: function() {
            var match = this.options.choicesMatch, first = this.choices.getFirst(match);
            this.selected = this.selectedValue = null;
            if (this.fix) {
                var pos = this.element.getCoordinates(this.relative), width = this.options.width || 'auto';
                this.choices.setStyles({
                    'left': pos.left,
                    'top': pos.bottom,
                    'width': (width === true || width == 'inherit') ? pos.width : width
                });
            }
            if (!first) return;
            if (!this.visible) {
                this.visible = true;
                this.choices.setStyle('display', '');
                if (this.fx) this.fx.start(1);
                this.fireEvent('onShow', [this.element, this.choices]);
            }
            if (this.options.selectFirst || this.typeAhead || first.inputValue == this.queryValue) this.choiceOver(first, this.typeAhead);
            var items = this.choices.getChildren(match), max = this.options.maxChoices;
            var styles = {'overflowY': 'hidden', 'height': ''};
            this.overflown = false;
            if (items.length > max) {
                var item = items[max - 1];
                styles.overflowY = 'scroll';
                styles.height = item.getCoordinates(this.choices).bottom;
                this.overflown = true;
            };
            this.choices.setStyles(styles);
            this.fix.show();
            if (this.options.visibleChoices) {
                var scroll = document.getScroll(),
                size = document.getSize(),
                coords = this.choices.getCoordinates();
                if (coords.right > scroll.x + size.x) scroll.x = coords.right - size.x;
                if (coords.bottom > scroll.y + size.y) scroll.y = coords.bottom - size.y;
                window.scrollTo(Math.min(scroll.x, coords.left), Math.min(scroll.y, coords.top));
            }
        },
        hideChoices: function(clear) {
            if (clear) {
                var value = this.element.value;
                if (this.options.forceSelect) value = this.opted;
                if (this.options.autoTrim) {
                    value = value.split(this.options.separatorSplit).filter(arguments[0]).join(this.options.separator);
                }
                this.observer.setValue(value);
            }
            if (!this.visible) return;
            this.visible = false;
            if (this.selected) this.selected.removeClass('autocompleter-selected');
            this.observer.clear();
            var hide = function(){
                this.choices.setStyle('display', 'none');
                this.fix.hide();
            }.bind(this);
            if (this.fx) this.fx.start(0).chain(hide);
            else hide();
            this.fireEvent('onHide', [this.element, this.choices]);
        },
        prefetch: function() {
            var value = this.element.value, query = value;
            if (this.options.multiple) {
                var split = this.options.separatorSplit;
                var values = value.split(split);
                var index = this.element.getSelectedRange().start;
                var toIndex = value.substr(0, index).split(split);
                var last = toIndex.length - 1;
                index -= toIndex[last].length;
                query = values[last];
            }
            if (query.length < this.options.minLength) {
                    this.hideChoices();
            } else {
                if (query === this.queryValue || (this.visible && query == this.selectedValue)) {
                    if (this.visible) return false;
                    this.showChoices();
                } else {
                    this.queryValue = query;
                    this.queryIndex = index;
                    if (!this.fetchCached()) this.query();
                }
            }
            return true;
        },
        fetchCached: function() {
                //return false;
                if (!this.options.cache
                        || !this.cached
                        || !this.cached.length
                        || this.cached.length >= this.options.maxChoices
                        || this.queryValue) return false;
                this.update(this.filter(this.cached));
                return true;
        },
        update: function(tokens) {
            this.choices.empty();
            this.cached = tokens;
            var type = tokens && typeOf(tokens);
            if (!type || (type == 'array' && !tokens.length) || (type == 'hash' && !tokens.getLength())) {
                (this.options.emptyChoices || this.hideChoices).call(this);
            } else {
                if (this.options.maxChoices < tokens.length && !this.options.overflow) tokens.length = this.options.maxChoices;
                //console.log(JSON.stringifyOnce(tokens, null, 5));
                
                Object.each(tokens, this.options.injectChoice || function(token){
                    //console.log('each token' + token);
                    var choice = new Element('li', {'html': this.markQueryValue(token)});
                    choice.inputValue = token;
                    this.addChoiceEvents(choice).inject(this.choices);
                }, this);

                this.showChoices();
            }
        },
        choiceOver: function(choice, selection) {
            if (!choice || choice == this.selected) return;
            if (this.selected) this.selected.removeClass('autocompleter-selected');
            this.selected = choice.addClass('autocompleter-selected');
            this.fireEvent('onSelect', [this.element, this.selected, selection]);
            if (!this.selectMode) this.opted = this.element.value;
            if (!selection) return;
            this.selectedValue = this.selected.inputValue;
            if (this.overflown) {
                var coords = this.selected.getCoordinates(this.choices), margin = this.options.overflowMargin,
                        top = this.choices.scrollTop, height = this.choices.offsetHeight, bottom = top + height;
                if (coords.top - margin < top && top) this.choices.scrollTop = Math.max(coords.top - margin, 0);
                else if (coords.bottom + margin > bottom) this.choices.scrollTop = Math.min(coords.bottom - height + margin, bottom);
            }
            if (this.selectMode) this.setSelection();
        },

        choiceSelect: function(choice) {
            if (choice) this.choiceOver(choice);
            this.setSelection(true);
            this.queryValue = false;
            this.hideChoices();
        },

        filter: function(tokens) {
            return (tokens || this.tokens).filter(function(token) {
                    return this.test(token);
            }, new RegExp(((this.options.filterSubset) ? '' : '^') + this.queryValue.escapeRegExp(), (this.options.filterCase) ? '' : 'i'));
        },

        /**
         * markQueryValue
         *
         * Marks the queried word in the given string with <span class="autocompleter-queried">*</span>
         * Call this i.e. from your custom parseChoices, same for addChoiceEvents
         *
         * @param               {String} Text
         * @return              {String} Text
         */
        markQueryValue: function(str) {
          if (!str) return; // if str is null
            return (!this.options.markQuery || !this.queryValue) ? str
                    : str.replace(new RegExp('(' + ((this.options.filterSubset) ? '' : '^') + this.queryValue.escapeRegExp() + ')', (this.options.filterCase) ? '' : 'i'), '<span class="autocompleter-queried">$1</span>');
        },

        /**
         * addChoiceEvents
         *
         * Appends the needed event handlers for a choice-entry to the given element.
         *
         * @param               {Element} Choice entry
         * @return              {Element} Choice entry
         */
        addChoiceEvents: function(el) {
            return el.addEvents({
                    'mouseover': this.choiceOver.bind(this, el),
                    'click': function(){
                        var result = this.choiceSelect(el);
                        this.fireEvent('choiceConfirm', this.selected);
                        return result;
                    }.bind(this)
            });
        }
});

var OverlayFix = new Class({

        initialize: function(el) {
                if (Browser.ie) {
                        this.element = $(el);
                        this.relative = this.element.getOffsetParent();
                        this.fix = new Element('iframe', {
                                'frameborder': '0',
                                'scrolling': 'no',
                                'src': 'javascript:false;',
                                'styles': {
                                        'position': 'absolute',
                                        'border': 'none',
                                        'display': 'none',
                                        'filter': 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)'
                                }
                        }).inject(this.element, 'after');
                }
        },

        show: function() {
                if (this.fix) {
                        var coords = this.element.getCoordinates(this.relative);
                        delete coords.right;
                        delete coords.bottom;
                        this.fix.setStyles(Object.append(coords, {
                                'display': '',
                                'zIndex': (this.element.getStyle('zIndex') || 1) - 1
                        }));
                }
                return this;
        },

        hide: function() {
                if (this.fix) this.fix.setStyle('display', 'none');
                return this;
        },

        destroy: function() {
                if (this.fix) this.fix = this.fix.destroy();
        }

});

Element.implement({

        getSelectedRange: function() {
            if (!Browser.ie) return {start: this.selectionStart, end: this.selectionEnd};
            var pos = {start: 0, end: 0};
            var range = this.getDocument().selection.createRange();
            if (!range || range.parentElement() != this) return pos;
            var dup = range.duplicate();
            if (this.type == 'text') {
                pos.start = 0 - dup.moveStart('character', -100000);
                pos.end = pos.start + range.text.length;
            } else {
                var value = this.value;
                var offset = value.length - value.match(/[\n\r]*$/)[0].length;
                dup.moveToElementText(this);
                dup.setEndPoint('StartToEnd', range);
                pos.end = offset - dup.text.length;
                dup.setEndPoint('StartToStart', range);
                pos.start = offset - dup.text.length;
            }
            return pos;
        },

        selectRange: function(start, end) {
            if (Browser.ie) {
                var diff = this.value.substr(start, end - start).replace(/\r/g, '').length;
                start = this.value.substr(0, start).replace(/\r/g, '').length;
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', start + diff);
                range.moveStart('character', start);
                range.select();
            } else {
                this.focus();
                this.setSelectionRange(start, end);
            }
            return this;
        }

});

/* compatibility */

Autocompleter.Base = Autocompleter;
/**
 * Autocompleter.Local
 *
 * http://digitarald.de/project/autocompleter/
 *
 * @version             1.1.2
 *
 * @license             MIT-style license
 * @author              Harald Kirschner <mail [at] digitarald.de>
 * @copyright   Author
 */

Autocompleter.Local = new Class({

        Extends: Autocompleter,

        options: {
                minLength: 0,
                delay: 200
        },
        initialize: function(element, tokens, options) {
                this.parent(element, options);
                this.tokens = tokens;
        },
        query: function() {
                this.update(this.filter());
        }

});
Autocompleter.Ajax = {};

Autocompleter.Ajax.Base = new Class({
    Extends: Autocompleter,
    options: {
        // onRequest: function(){},
        // onComplete: function(){},
        postVar: 'value',
        postData: {},
        ajaxOptions: {}
    },
    initialize: function(element, options) {
        this.parent(element, options);
        var indicator = document.id(this.options.indicator);
        if (indicator) {
            this.addEvents({
                'onRequest': indicator.show.bind(indicator),
                'onComplete': indicator.hide.bind(indicator)
            }, true);
        }
    },
    query: function(){
        var data = Object.clone(this.options.postData);
        data[this.options.postVar] = this.queryValue;
        this.fireEvent('onRequest', [this.element, this.request, data, this.queryValue]);
        this.request.send({'data': data});
    },
    queryResponse: function(response) {
        this.fireEvent('onComplete', [this.element, this.request, response]);
    }
});

Autocompleter.Ajax.Json = new Class({
    Extends: Autocompleter.Ajax.Base,
    initialize: function(el, url, options) {
        this.parent(el, options);
        this.request = new Request.JSON(Object.merge({
                'url': url,
                'link': 'cancel'
        }, this.options.ajaxOptions)).addEvent('onComplete', this.queryResponse.bind(this));
    },
    queryResponse: function(response) {
        this.update(response);
        this.parent(response);
    }
});

Autocompleter.Ajax.Xhtml = new Class({

    Extends: Autocompleter.Ajax.Base,

    initialize: function(el, url, options) {
        this.parent(el, options);
        this.request = new Request.HTML(Object.merge({
            'url': url,
            'link': 'cancel',
            'update': this.choices
        }, this.options.ajaxOptions)).addEvent('onComplete', this.queryResponse.bind(this));
    },
    queryResponse: function(tree, elements) {
        this.parent();
        if (!elements || !elements.length) {
                this.hideChoices();
        } else {
            this.choices.getChildren(this.options.choicesMatch).each(this.options.injectChoice || function(choice) {
                var value = choice.innerHTML;
                choice.inputValue = value;
                this.addChoiceEvents(choice.set('html', this.markQueryValue(value)));
            }, this);
            this.showChoices();
        }
    }
});


Autocompleter.JSONP = new Class({
        Extends: Autocompleter.Ajax.Json,
        options: {
            postVar: 'query',
            jsonpOptions: {},
//              onRequest: function(){},
//              onComplete: function(){},
//              filterResponse: function(){},
            minLength: 1
        },
        initialize: function(el, url, options) {
            this.url = url;
            this.setOptions(options);
            this.parent(el, options);
        },
        query: function(){
            var data = Object.clone(this.options.jsonpOptions.data||{});
            data[this.options.postVar] = this.queryValue;
            var param_geoname = Array.from(this.options.jsonpOptions.param_geoname);
            if(param_geoname.length > 0){
                param_geoname.each(function(item){
                    data[item] = this.queryValue;
                }, this);
            }
            this.jsonp = new Request.JSONP(Object.merge({
                url: this.url,
                link: 'cancel',
                data: data
            }, this.options.jsonpOptions));
            this.jsonp.addEvent('onComplete', this.queryResponse.bind(this));
            this.fireEvent('onRequest', [this.element, this.jsonp, data, this.queryValue]);
            this.jsonp.send();
        },
        queryResponse: function(response) {
            var data = (this.options.filter)?this.options.filter.apply(this, [response]):response;
            this.parent(data);
            this.update(data);
        }
});
Autocompleter.JsonP = Autocompleter.JSONP;