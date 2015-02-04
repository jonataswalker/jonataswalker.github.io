/******/
var london = ol.proj.transform([-0.12755, 51.507222], 'EPSG:4326', 'EPSG:3857');
var moscow = ol.proj.transform([37.6178, 55.7517], 'EPSG:4326', 'EPSG:3857');
var istanbul = ol.proj.transform([28.9744, 41.0128], 'EPSG:4326', 'EPSG:3857');
var rome = ol.proj.transform([12.5, 41.9], 'EPSG:4326', 'EPSG:3857');
var bern = ol.proj.transform([7.4458, 46.95], 'EPSG:4326', 'EPSG:3857');
var madrid = ol.proj.transform([-3.683333, 40.4], 'EPSG:4326', 'EPSG:3857');
var brasilia = ol.proj.transform([-47.92972, -15.77972], 'EPSG:4326', 'EPSG:3857');
var div_info = document.id('uf-info');
var input_el = document.id('cidade');
input_el.focus();
var span_result = document.id('result-query');
var tags_container = document.id('tags-container');

var tms_layer = new ol.layer.Tile({
    preload: 4,
    source: new ol.source.OSM()
});
var layerMQ = new ol.layer.Tile({
    source: new ol.source.MapQuest({layer: 'osm'})
});
var view = new ol.View({
    center: brasilia,
    zoom: 4,
    minZoom: 2,
    maxZoom: 10
});
var source_features = new ol.source.GeoJSON(({
  object: {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: { name: 'EPSG:3857' }
    },
    features: []
  }
}));
var source_features_line = new ol.source.GeoJSON(({
  object: {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: { name: 'EPSG:3857' }
    },
    features: []
  }
}));
var layer_features = new ol.layer.Vector({
    source: source_features
});
var layer_features_line = new ol.layer.Vector({
    source: source_features_line
});
var map = new ol.Map({
    layers : [layerMQ, layer_features, layer_features_line],
    target : 'map',
    renderer : 'canvas',
    view : view
});
var zoomslider = new ol.control.ZoomSlider();
map.addControl(zoomslider);

var draw_line = false;
map.on('moveend', function(){
    if(draw_line === true){
        draw_line = false;
        var features_t = source_features.getFeatures();
        var numf = features_t.length, nump = numf - 1;
        var ultima_feat = source_features.getFeatureById('f'+numf);
        var penultima_feat = source_features.getFeatureById('f'+nump);
        var ultima_coord = ultima_feat.get('coordinate');
        var penultima_coord = penultima_feat.get('coordinate');
        
        var percurso = new ol.Feature({
            geometry: new ol.geom.LineString([penultima_coord, ultima_coord], 'XY')
        });
        
        var penult4326 = ol.proj.transform(penultima_coord, 'EPSG:3857', 'EPSG:4326');
        var ult4326 = ol.proj.transform(ultima_coord, 'EPSG:3857', 'EPSG:4326');
            
        var distance_ = SphericalCosinus(penult4326[1], penult4326[0], ult4326[1], ult4326[0]);
        
        var sf = new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 2,
                color: 'rgba(100, 200, 50, 0.8)'
            }),
            text: new ol.style.Text({
                font: '12px sans-serif',
                textBaseline: 'top',
                text: distance_ + ' Km',
                fill: new ol.style.Fill({
                    color: 'rgba(100, 200, 50, 1)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#000',
                    width: 2
                })
            })
        });

        percurso.setStyle(sf);
        percurso.setId('f'+nump+'f'+numf);
        source_features_line.addFeature(percurso);
        
        var zoom_f;
        if(distance_ < 50){
            zoom_f = 10;
        } else if(distance_ < 100){
            zoom_f = 9;
        } else if(distance_ < 300){
            zoom_f = 8;
        } else if(distance_ < 500){
            zoom_f = 7;
        } else if(distance_ < 800){
            zoom_f = 6;
        } else if(distance_ < 1500){
            zoom_f = 5;
        } else if(distance_ < 2500){
            zoom_f = 4;
        } else{
            zoom_f = 3;
        }
        
        (function(){ view.setZoom(zoom_f); }).delay(1500);
        
        var distancia_completa = 0, prim_feat, seg_feat, prim_coord, seg_coord, prim4326, seg4326;
        for(var i=1;i<numf;i++){
            nump = i + 1;
            prim_feat = source_features.getFeatureById('f'+i);
            seg_feat = source_features.getFeatureById('f'+nump);
            prim_coord = prim_feat.get('coordinate');
            seg_coord = seg_feat.get('coordinate');
            prim4326 = ol.proj.transform(prim_coord, 'EPSG:3857', 'EPSG:4326');
            seg4326 = ol.proj.transform(seg_coord, 'EPSG:3857', 'EPSG:4326');
                
            distancia_completa += SphericalCosinus(prim4326[1], prim4326[0], seg4326[1], seg4326[0]);
        }
        div_info.set('html', '<h3>Sua viagem começou!!</h3><h3>E por enquanto já são '+formataMilhar(distancia_completa)+' Km!!</h3>');
    }
});



var uf_geonames = { 22:'RN', 20:'PI', 30:'PE', 17:'PB', 16:'PA', 13:'MA', '06':'CE', '03':'AP', '02':'AL', 28:'SE', 27:'SP', 26:'SC', 23:'RS', 21:'RJ', 18:'PR', 15:'MG', 11:'MS', 14:'MT', 29:'GO', '07':'DF', '08':'ES', '05':'BA', 31:'TO', 25:'RR', '04':'AM', '01':'AC', 24:'RO' };

window.addEvent('domready', function() {
    var primeiro_center = view.getCenter();
    document.id('fullscreen').addEvent('click', function(event){
        event.stopPropagation();
        toggleFullScreen();
    });
    
    var params_query = ['maxRows', 'featureClass', 'style', 'fuzzy', 'userName', 'lang'];
    var query_values = [10, 'P', 'LONG', 1, 'jonataswalker', 'en'];
    var data_query = query_values.associate(params_query);
    var url = 'http://api.geonames.org/searchJSON';
    var myJSONP = new Autocompleter.JSONP(input_el, url, {
        jsonpOptions: {
            data: data_query,
            param_geoname : ['name_startsWith']
        },
        postVar: 'q',
        delay: 600,
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
                    html : this.markQueryValue(choice.toponymName) + ', ' + choice.adminName1 + ' - ' + choice.countryName
                });
                el.inputValue = choice.toponymName + ', ' + choice.adminName1 + ' - ' + choice.countryName;
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
        onComplete: function(el, request, response){
            //console.log('complete:'+response);
            input_el.setStyle('background','');
            if(response.totalResultsCount == 0){
                span_result.set('text', 'nenhum resultado!!').addClass('bg-red').wink(1000);
            }
        },
        onBlur: function(el){ el.value = '';},
        onChoiceConfirm: function(choice){
            var result = Object.clone(this.cached);
            this.destroy.bind(this);
            this.cached = null;
            var id = choice.id, row, feature;
            var choice_row = Object.keyOf(result.geonames, id);
            Object.each(result.geonames, function(item, index){
                Object.each(item, function(val, key){
                    if(key == 'geonameId' && val == id){
                        row = result.geonames[index];
                    }
                });
            });
            //console.log(row);
            
            var destino = ol.proj.transform([row.lng.toFloat(), row.lat.toFloat()], 'EPSG:4326', 'EPSG:3857');
            
            var lenf = source_features.getFeatures().length;
            if(lenf == 0){
                div_info.set('html', '<h3>Sua viagem começou!!</h3>');
                
                feature = new ol.Feature({
                    geometry: new ol.geom.Point(destino),
                    descricao: 'Início da Viagem',
                    cidade: row.toponymName,
                    uf: row.adminName1,
                    pais: row.countryName,
                    coordinate: destino
                });
                var style = [
                    new ol.style.Style({
                        image: new ol.style.Icon(({
                            scale: 1,
                            rotateWithView: false,
                            anchor: [0.5, 1],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            opacity: 1,
                            src: 'images/airport_terminal.png'
                        }))
                    }),
                    new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 5,
                            fill: new ol.style.Fill({
                                color: 'rgba(230,120,30,0.7)'
                            })
                        })
                    })
                ];
                feature.setId('f1');
                feature.setStyle(style);
                source_features.addFeature(feature);
                
            } else{
                draw_line = true;
                var ultima_feature = source_features.getFeatureById('f'+lenf);
                var destino_anterior = ultima_feature.get('coordinate');
                feature = new ol.Feature({
                    geometry: new ol.geom.Point(destino),
                    cidade: row.toponymName,
                    uf: row.adminName1,
                    pais: row.countryName,
                    coordinate: destino
                });
                style = [
                    new ol.style.Style({
                        image: new ol.style.Icon(({
                            scale: 1,
                            rotateWithView: false,
                            anchor: [0.5, 1],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            opacity: 1,
                            src: 'images/airport_runway.png'
                        }))
                    }),
                    new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 5,
                            fill: new ol.style.Fill({
                                color: 'rgba(230,120,30,0.7)'
                            })
                        })
                    })
                ];
                var fid = lenf + 1;
                feature.setId('f' + fid);
                feature.setStyle(style);
                source_features.addFeature(feature);
            }
            
            var uf_adap = (row.countryCode == 'BR') ? uf_geonames[row.adminCode1] : row.adminName1;
            var el = new Element('li', {
                id : 'li'+id,
                class : 'ui-corner-all',
                events: {
                    click : function(){ mapFly(destino); }
                }
            }).appendHTML(
                '<span>'+row.toponymName+', '+ uf_adap +' - '+row.countryCode+'</span>'
            ).inject(tags_container);
            tags_container.removeClass('hidden');
            input_el.value = '';
            
            mapFly(destino);
        }
    });
});
