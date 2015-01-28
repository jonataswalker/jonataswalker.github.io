/******/
var london = ol.proj.transform([-0.12755, 51.507222], 'EPSG:4326', 'EPSG:3857');
var moscow = ol.proj.transform([37.6178, 55.7517], 'EPSG:4326', 'EPSG:3857');
var istanbul = ol.proj.transform([28.9744, 41.0128], 'EPSG:4326', 'EPSG:3857');
var rome = ol.proj.transform([12.5, 41.9], 'EPSG:4326', 'EPSG:3857');
var bern = ol.proj.transform([7.4458, 46.95], 'EPSG:4326', 'EPSG:3857');
var madrid = ol.proj.transform([-3.683333, 40.4], 'EPSG:4326', 'EPSG:3857');
var brasilia = ol.proj.transform([-47.30, -15.80], 'EPSG:4326', 'EPSG:3857');
var container = document.id('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var tms_layer = new ol.layer.Tile({
    preload: 4,
    source: new ol.source.OSM()
    /*source: new ol.source.TileJSON({
        url: 'https://api.tiles.mapbox.com/v3/examples.map-i86nkdio.jsonp'
    })*/
});
var view = new ol.View({
    center: brasilia,
    zoom: 6,
    minZoom: 3,
    maxZoom: 10
});
var overlay = new ol.Overlay({
    element: container,
    positioning: 'top-right'
});
var map = new ol.Map({
    layers : [tms_layer],
    target : 'map',
    renderer : 'canvas',
    overlays: [overlay],
    view : view
});
var overlay2 = createOverlay();
map.addOverlay(overlay2);
map.on('moveend', function(evt){
    //console.log(evt);
    //console.log(view.getCenter());
    
    map.removeOverlay(overlay);
    overlay = createOverlay();
    map.addOverlay(overlay);
    
    var hdms2 = ol.coordinate.toStringHDMS(ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326'));
    overlay.setPosition(view.getCenter());
    content.innerHTML = '<p>Você está aqui!!</p><code>' + hdms2 +'</code>';
    container.setStyle('display', 'block');
});
map.on('click', function(evt) {
  var coordinate = evt.coordinate;
  var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));

  overlay.setPosition(coordinate);
  content.innerHTML = '<p>Você clicou aqui:</p><code>' + hdms +'</code>';
  container.style.display = 'block';

});

var div_info = document.getElementById('uf-info');
var cidades_escolhidas = {};
window.addEvent('domready', function() {
    var maxRows = 10;
    var featureClass = 'P';
    var style = 'LONG';
    var orderby = 'relevance';
    var lang = 'en';
    var fuzzy = 1;
    var username = 'jonataswalker';
    var isNameRequired = true;
    
    var params_query = ['maxRows', 'featureClass', 'style', 'fuzzy', 'userName', 'lang'];
    var query_values = [maxRows, featureClass, style, fuzzy, username, lang];
    var data_query = query_values.associate(params_query);
    
    var url = 'http://api.geonames.org/searchJSON';
    var input_el = document.id('cidade');
    var span_result = document.id('result-query');
    
    var myJSONP = new Autocompleter.JSONP(input_el, url, {
        jsonpOptions: {
            data: data_query,
            param_geoname : ['name_startsWith']
        },
        postVar: 'q',
        delay: 300,
        zIndex: 9999,
        minLength: 3,
        cache: true,
        forceSelect: true,
        selectMode: 'pick',
        relative: true,
        injectChoice: function(choices) {
            Object.each(choices, function(choice){
                //console.log('each choice' + choice.toponymName);
                if (!choice.toponymName) return;
                var el = new Element('li', {
                    id : choice.geonameId,
                    html : this.markQueryValue(choice.toponymName) + ', ' + choice.countryName
                });
                el.inputValue = choice.toponymName + ' (' + choice['countryName'] + ')';
                this.addChoiceEvents(el).inject(this.choices);
            }, this);
        },
        onRequest: function(url){
            input_el.setStyles({
                'background-image':'url(./images/indicator_blue_small.gif)',
                'background-position':'300px 7px',
                'background-repeat':'no-repeat'
            });
        },
        onSelection: function(input, selection, input_value, value){
            
        },
        onComplete: function(el, request, response){
            //console.log('complete:'+response);
            input_el.setStyle('background','');
            if(response.totalResultsCount == 0){
                span_result.set('text', 'nenhum resultado!!').addClass('bg-red').wink(1000);
            }
        },
        onBlur: function(el){
            el.value = '';
        },
        onCancel: function(el){
            console.log(el);
        },
        onChoiceConfirm: function(choice){
            //console.log(choice.id);
            
            var result = Object.clone(this.cached);
            this.destroy.bind(this);
            var id = choice.id;
            var choice_row = Object.keyOf(result.geonames, id);
            Object.each(result.geonames, function(item, index){
                Object.each(item, function(val, key){
                    if(key == 'geonameId' && val == id){
                        cidades_escolhidas[id] = result.geonames[index];
                    }
                });
            });
            //console.log(cidades_escolhidas);
            var row = Object.clone(cidades_escolhidas[id]);
            var container = $('tags-container');
            var el = new Element('li', {
                id : 'li'+id,
                class : 'ui-corner-all',
                events: {
                    click : function(){
                        mapFly(row.lng, row.lat);
                    }
                }
            }).appendHTML(
                '<span>'+row.toponymName+' - '+row.countryCode+'</span>' +
                '<a class="tags-close"><span class="text-icon">×</span>' +
                '<span class="tags-icon-close"></span></a>'
            ).inject(container);
            container.removeClass('hidden');
            input_el.value = '';
            
            mapFly(row.lng, row.lat);
        }
    });
    
    /**
    var findNearbyStreets = {search:['lat', 'lng', 'radius', 'maxRows']};
    var find = {params:['2', '3', '4', '5']};
    console.log(Object.toQueryString(find.params.associate(findNearbyStreets.search)));**/
    
   


});
