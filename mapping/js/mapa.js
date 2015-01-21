var style_uf = new ol.style.Style({
    fill: new ol.style.Fill({ color: 'rgba(255, 100, 50, 0.2)' }),
    stroke: new ol.style.Stroke({
        width: 1,
        color: 'rgba(255, 100, 50, 0.6)'
    })
});
var style_capitais = new ol.style.Style({
    fill: new ol.style.Fill({ color: 'rgba(173, 127, 168, 0.2)' }),
    stroke: new ol.style.Stroke({
        width: 1.5,
        color: 'rgba(173, 127, 168, 0.9)'
    })
});
var brasil_uf = new ol.layer.Vector({
    style : style_uf,
    name : 'brasil_uf',
    source : new ol.source.TopoJSON({
        projection : 'EPSG:3857',
        url : './json/uf-topojson.json'
    })
});
/******/
var brasil_capitais = new ol.layer.Vector({
    style : style_capitais,
    name : 'brasil_capitais',
    source: new ol.source.TopoJSON({
        projection: 'EPSG:3857',
        url: './json/brasil-com-capitais-topojson.json'
    })
});
var layerOSM = new ol.layer.Tile({
    source: new ol.source.OSM()
});
var layerMQ = new ol.layer.Tile({source: new ol.source.MapQuest({layer: 'osm'})});
var layer_principal = new ol.layer.Tile({ source : new ol.source.Stamen({ layer: 'watercolor' }), name : 'mapa'});

var controls = [
    new ol.control.Attribution(),
    new ol.control.MousePosition({
        undefinedHTML: 'outside',
        projection: 'EPSG:4326',
        coordinateFormat: function(coordinate) { return ol.coordinate.format(coordinate, '{x}, {y}', 4); }
    }),
    new ol.control.OverviewMap({ collapsed: false }),
    new ol.control.Rotate({ autoHide: false }),
    new ol.control.ScaleLine(),
    new ol.control.Zoom(),
    new ol.control.ZoomSlider(),
    new ol.control.ZoomToExtent(),
    new ol.control.FullScreen()
];
var selectInteraction_UF = new ol.interaction.Select({
    layers: [brasil_uf],
    style: new ol.style.Style({
        fill: new ol.style.Fill({color: 'rgba(143, 89, 2, 0.3)'}),
        stroke: new ol.style.Stroke({
            width: 2,
            color: 'rgba(143, 89, 2, 0.8)'
        })
    })
});
var map = new ol.Map({
    target : 'map',
    renderer : 'canvas',
    layers : [
        //new ol.layer.Tile({ source : new ol.source.MapQuest({ layer: 'osm' }), name : 'mapa' }),
        layer_principal,
        //new ol.layer.Tile({ source : new ol.source.Stamen({ layer: 'terrain-labels' }), name : 'mapa_label'}),
        brasil_uf,
        brasil_capitais
    ],
    view : new ol.View({
        center: ol.proj.transform([-53.30, -17.80], 'EPSG:4326', 'EPSG:3857'),
        //center: ol.proj.transform([-47.85, -15.80], 'EPSG:4326', 'EPSG:3857'),
        zoom : 4,
        minZoom: 3.5,
        maxZoom: 4.5
    })
});

var est_uf, est_cap;
var myJ = new Request.JSON({url:'./json/est-censo2010-uf.json',onSuccess:function(data){est_uf = data;}}).get();
var myJ2 = new Request.JSON({url:'./json/est-censo2010-capitais.json',onSuccess: function(data){est_cap = data;}}).get();


var highlightStyleCache = {};

var featureOverlay = new ol.FeatureOverlay({
  map: map,
  style: function(feature, resolution) {
    var text = resolution < 5000 ? feature.get('name') : '';
    if (!highlightStyleCache[text]) {
      highlightStyleCache[text] = [new ol.style.Style({
        fill: new ol.style.Fill({color: 'rgba(143, 89, 2, 0.3)'}),
        stroke: new ol.style.Stroke({
            width: 2,
            color: 'rgba(143, 89, 2, 0.8)'
        }),
        text: new ol.style.Text({
          font: '12px Calibri,sans-serif',
          text: text,
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#f00',
            width: 3
          })
        })
      })];
    }
    return highlightStyleCache[text];
  }
});

var highlight; var i=0;
var div_info = document.getElementById('uf-info');
var displayFeatureInfo = function(pixel) {
    var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) { return feature; });

    if (feature) {
        var cod_uf = feature.get('codigo');
        var cod_cap = feature.get('cod_mun');
        if(cod_uf) div_info.innerHTML = feature.get('name') + '<br>População: ' + est_uf.uf[cod_uf].np + '<br>Pop. Urb: ' + est_uf.uf[cod_uf].npu + '<br>Pop. Rural: ' + est_uf.uf[cod_uf].npr + '<br>Rend. Mensal: ' + est_uf.uf[cod_uf].rpc;
        else if(cod_cap) div_info.innerHTML = feature.get('name_mun') + '<br>População: ' + est_cap.c[cod_cap].p + '<br>Pop. Urb: ' + est_cap.c[cod_cap].pu + '<br>Pop. Rural: ' + est_cap.c[cod_cap].pr + '<br>Rend. Mensal: ' + est_cap.c[cod_cap].rpcc;
    } else div_info.innerHTML = 'desconhecido!!';

    if (feature !== highlight) {
        if (highlight) featureOverlay.removeFeature(highlight);
        if (feature) featureOverlay.addFeature(feature);
        highlight = feature;
    }
};
map.on('click', function(evt) {
  displayFeatureInfo(evt.pixel);
});
var tile_cached = layer_raised = false;
map.on('postrender', function(evt) {
    console.log(map.getLayers().getLength());
    var len = map.getLayers().getLength();
    if(len > 3 && tile_cached === true && layer_raised === false) {
        console.log('layer_raised:'+layer_raised + 'tile_cached:'+tile_cached + ' log' + ++i);
        lowerLayer(layerOSM);
        lowerLayer(layerMQ);
        raiseLayer(brasil_uf);
        raiseLayer(brasil_capitais);
        layer_raised = true;
    }
});

window.addEvent('domready', function() {
    var layer_to_add, index_layer_to_add;
    $('addOSM').addEvent('click', function() {
        index_layer_to_add = indexOf(map.getLayers(), layerOSM);
        console.log('index:'+index_layer_to_add);
        if(index_layer_to_add >= 0){
            layerOSM.setVisible(true);
            layerMQ.setVisible(false);
            layer_principal.setVisible(false);
        } else {
            map.addLayer(layerOSM);
            layer_raised = false;
        }
    });
    $('removeOSM').addEvent('click', function() {
        layerOSM.setVisible(false);
        layer_principal.setVisible(true);
    });
    $('addMQ').addEvent('click', function() {
        index_layer_to_add = indexOf(map.getLayers(), layerMQ);
        if(index_layer_to_add >= 0){
            layerMQ.setVisible(true);
            layerOSM.setVisible(false);
            layer_principal.setVisible(false);
        } else {
            map.addLayer(layerMQ);
            layer_raised = false;
        }
    });
    $('removeMQ').addEvent('click', function() {
        layerMQ.setVisible(false);
        layer_principal.setVisible(true);
    });
    
    var tileSource = layerOSM.getSource();
    tileSource.setTileLoadFunction((function() {
    var numLoadingTiles = 0;
    var tileLoadFn = tileSource.getTileLoadFunction();
    return function(tile, src) {
        if (numLoadingTiles === 0) {
        div_info.innerHTML = 'carregando...'
        }
        ++numLoadingTiles;
        var image = tile.getImage();
        image.onload = image.onerror = function() {
            --numLoadingTiles;
            if (numLoadingTiles === 0 && layer_raised === false) {
                div_info.innerHTML = 'clique nos Estados ou Capitais'
                raiseLayer(brasil_capitais);
                raiseLayer(brasil_uf);
                tile_cached = layer_raised = true;
            }
        };
        tileLoadFn(tile, src);
    };
    })());
    var tileSource2 = layerMQ.getSource();
    tileSource2.setTileLoadFunction((function() {
    var numLoadingTiles = 0;
    var tileLoadFn = tileSource2.getTileLoadFunction();
    return function(tile, src) {
        if (numLoadingTiles === 0) {
            div_info.innerHTML = 'carregando...'
        }
        ++numLoadingTiles;
        var image = tile.getImage();
        image.onload = image.onerror = function() {
            --numLoadingTiles;
            if (numLoadingTiles === 0 && layer_raised === false) {
                div_info.innerHTML = 'clique nos Estados ou Capitais'
                raiseLayer(brasil_capitais);
                raiseLayer(brasil_uf);
                tile_cached = layer_raised = true;
            }
        };
        tileLoadFn(tile, src);
    };
    })());
});
/***
map.on('singleclick', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature,layer) { return feature; });
    if(feature){
        var cod_uf = feature.get('codigouf');
        if(cod_uf){
            document.id('uf-info').set('html', feature.get('nome')+' - '+feature.get('siglauf') + '<br>PopulaÃ§Ã£o: ' + statisticas_uf.uf[cod_uf].num_pop);
        }
    }
});******/
