var style_uf = new ol.style.Style({
    fill: new ol.style.Fill({ color: 'rgba(255, 100, 50, 0)' }),
    stroke: new ol.style.Stroke({width: 1, color: 'rgba(33, 34, 33, 0.6)'})
});
var style_mun = new ol.style.Style({
    fill: new ol.style.Fill({ color: 'rgba(143, 89, 2, 0)' }),
    stroke: new ol.style.Stroke({width: 0.5, color: 'rgba(53, 54, 52, 0.5)'})
});
var brasil_uf = new ol.layer.Vector({
    style : style_uf,
    name : 'brasil_uf',
    source : new ol.source.TopoJSON({
        projection : 'EPSG:3857',
        url : './json/uf-topojson.json'
    })
});
var tms_layer = new ol.layer.Tile({
    source: new ol.source.TileJSON({
        url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
    })/**
    source: new ol.source.XYZ({
        tileUrlFunction: function(coordinate) {
            if(coordinate == null){ return ""; } 
            var z = coordinate[0];
            var x = coordinate[1];
            var y = (1 << z) - coordinate[2] - 1;
            return '/tiles/NE1_HR_LC_SR_W/' + z + '/' + x + '/' + y + '.png';
        }
    })**/
});
var map = new ol.Map({
    target : 'map',
    renderer : 'canvas',
    layers : [
        tms_layer,
        brasil_uf
    ],
    view : new ol.View({
        center: ol.proj.transform([-53.30, -17.80], 'EPSG:4326', 'EPSG:3857'),
        zoom : 4,
        minZoom: 3,
        maxZoom: 10
    })
});
var select = new ol.interaction.Select({
    style: function(feature, res) { 
        return [
            new ol.style.Style({
                fill: new ol.style.Fill({ color: 'rgba(143, 89, 2, 0)' }),
                stroke: new ol.style.Stroke({width: 1, color: 'rgba(143, 89, 2, 0.8)'})
            })
        ]
    },
    layers: [brasil_uf]
});
map.addInteraction(select);
var div_info = document.getElementById('uf-info');

var displayFeatureInfo = function(pixel) {
    var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) { return feature; });
    if(feature){ //console.log(feature.getId());
        var cod_uf = feature.get('codigo');
        if(!cod_uf) return;
        var desc_uf = feature.get('name');
        console.log('uf:'+cod_uf);
        console.log('f_name:' + desc_uf);
        if (findByName('munic'+cod_uf)) return;
        
        div_info.innerHTML = 'carregando...';
        var vectorSource = new ol.source.Vector();
        var myJ = new Request.JSON({
            url:'./json/municipios/municipios_uf'+cod_uf+'-topojson.json',
            onSuccess:function(data){
                var format = new ol.format.TopoJSON();
                var features = format.readFeatures(data, {
                    featureProjection: 'EPSG:3857'
                });
                vectorSource.addFeatures(features);
                
                var vectorLayer = new ol.layer.Vector({
                    source: vectorSource,
                    style : style_mun,
                    name : 'munic'+cod_uf
                });
                map.getLayers().push(vectorLayer);
                div_info.innerHTML = desc_uf + '<br>Número Munic.: ' + features.length;
            }
        }).get();
    }
};
window.addEvent('domready', function() {
    $('removeOSM').addEvent('click', function() {
        var layer_remov;
        //11 - menor codigo uf e 53 maior
        for(var i=11;i<53;i++){
            layer_remov = findByName('munic'+i);
            if(layer_remov) map.removeLayer(layer_remov);
            layer_remov = null;
        }
    });
});
map.on('click', function(evt) {displayFeatureInfo(evt.pixel);});