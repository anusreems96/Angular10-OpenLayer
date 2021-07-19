import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
} from '@angular/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import * as olProj from 'ol/proj';
import { OSM, Vector, Cluster } from 'ol/source';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import View from 'ol/View';
import { boundingExtent } from 'ol/extent';

export const ReadableCoordFormat: string = 'EPSG:4326';
export const OlCoordFormat: string = 'EPSG:3857';

@Component({
    selector: 'app-ol-map',
    templateUrl: './ol-map.component.html',
    styleUrls: ['./ol-map.component.scss'],
})
export class OlMapComponent implements OnInit, AfterViewInit {
    @ViewChild('olPopupContainer') popupContainer: ElementRef<HTMLDivElement>;
    @ViewChild('olPopupContent') popupContent: ElementRef<HTMLDivElement>;

    map: Map;
    overlay: Overlay;
    vectorLayer: VectorLayer;
    markers: Feature[];
    userMarker: Feature;
    markersLayer: VectorLayer;

    constructor() { }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.initializeMap();
    }

    closePopup() {
        this.overlay.setPosition(undefined);
    }

    getMapCoordintes(event: any) {
        let coords = this.map.getEventCoordinate(event);
        let test = olProj.transform(coords, OlCoordFormat, ReadableCoordFormat);
        console.table({ coords, test });
    }

    initializeMap() {
        const content = this.popupContent.nativeElement;
        const center = olProj.transform([76.26, 9.93], ReadableCoordFormat, OlCoordFormat); //initial position of map
        const view = new View({
            center: center,
            zoom: 3,
        });

        //raster layer on map
        const OSMBaseLayer = new TileLayer({
            source: new OSM(),
        });

        let vectorSource = new Vector({ wrapX: true });
        let clusterSource = new Cluster({ distance: 15, source: vectorSource });

        let vectorLayer = new VectorLayer({
            source: clusterSource,
            style: (feature) => {
                return this.getClusterStyle(feature);
            },
        });

        this.map = new Map({
            layers: [OSMBaseLayer, vectorLayer],
            target: 'ol-map',
            view: view,
        });

        // Popup showing the position the user clicked
        var popupContainer = this.popupContainer.nativeElement;
        var popup = new Overlay({
            element: popupContainer,
            autoPan: true,
            autoPanAnimation: {
                duration: 250,
            },
        });
        this.map.addOverlay(popup);

        var data = [
            { Lat: 13.384130, Lon: 74.894423 },
            { Lat: 13.352336, Lon: 74.846899 },
            { Lat: 13.182951, Lon: 75.175259 },
            { Lat: 13.677988, Lon: 75.221229 },
            { Lat: 10.166713, Lon: 76.454200 },
            { Lat: 10.122281, Lon: 76.462515 },
            { Lat: 9.7291489, Lon: 76.672759 },
            { Lat: 10.080182, Lon: 76.610993 },
            { Lat: 9.2127229, Lon: 77.000070 },
            { Lat: 14.055547, Lon: 74.518642 },
            { Lat: 11.854550, Lon: 79.004382 },
            { Lat: 11.706582, Lon: 78.441001 },
            { Lat: 10.439002, Lon: 79.732655 },
            { Lat: 14.410209, Lon: 80.034957 },
        ];

        data.forEach((item, i) => {
            //iterate through array...
            var longitude = item.Lon,
                latitude = item.Lat,
                iconFeature = new Feature({
                    geometry: new Point(
                        olProj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857')
                    ),
                    type: 'Point',
                    title: i,
                    desc:
                        '<pre><b>Item - '+ i + '</b> ' +
                        '<br>' +
                        'Latitude : ' +
                        latitude +
                        '<br>Longitude: ' +
                        longitude +
                        '</pre>',
                }),
                iconStyle = new Style({
                    image: new Circle({
                        radius: 6,
                        stroke: new Stroke({
                            color: 'black',
                        }),
                        fill: new Fill({
                            color: 'red',
                        }),
                    }),
                });

            iconFeature.setStyle(iconStyle);

            vectorSource.addFeature(iconFeature);
        });

        this.map.on('click', (e) => {
            vectorLayer.getFeatures(e.pixel).then((clickedFeatures) => {
                if (clickedFeatures.length) {
                    // Get clustered Coordinates
                    const features = clickedFeatures[0].get('features');
                    if (features.length > 1) {
                        const extent = boundingExtent(
                            features.map((r) => r.getGeometry().getCoordinates())
                        );
                        this.map
                            .getView()
                            .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
                    }
                }
            });
        });

        /* Add a pointermove handler to the map to render the popup.*/
        this.map.on('pointermove', (evt) => {
            
            
            var feature = this.map.forEachFeatureAtPixel(evt.pixel, (feat, layer) => {
                return feat;
            });

            console.log('hit', feature);

            vectorLayer.getFeatures(evt.pixel).then((hoveredFeatures) => {
                if (hoveredFeatures.length) {
                    // Get clustered Coordinates
                    const features = hoveredFeatures[0].get('features');
                    if (features.length === 1) {
                        var coordinate = evt.coordinate; //default projection is EPSG:3857 you may want to use ol.proj.transform
                        content.innerHTML = features[0].get('desc');
                        popup.setPosition(coordinate);
                    }
                    else if(features.length > 1) {
                        var coordinate = evt.coordinate; //default projection is EPSG:3857 you may want to use ol.proj.transform
                        content.innerHTML = `Items: ${features.map(f => f.get('title')).join()}`;
                        popup.setPosition(coordinate);
                    }
                    else {
                        popup.setPosition(undefined);
                    }
                }
            });


            if (feature && feature.get('type') == 'Point') {
                var coordinate = evt.coordinate; //default projection is EPSG:3857 you may want to use ol.proj.transform

                content.innerHTML = feature.get('desc');
                popup.setPosition(coordinate);
            } else {
                popup.setPosition(undefined);
            }
        });
    }

    getClusterStyle(feature) {
        const styleCache = {};
        const size = feature.get('features').length;
        console.log({ size });
        if (size === 1) {
            return this.getMarkerStyle();
        }
        let style = styleCache[size];
        if (!style) {
            style = new Style({
                image: new Circle({
                    radius: 10,
                    stroke: new Stroke({
                        color: '#fff',
                    }),
                    fill: new Fill({
                        color: '#3399CC',
                    }),
                }),
                text: new Text({
                    text: size.toString(),
                    fill: new Fill({
                        color: '#fff',
                    }),
                }),
            });
            styleCache[size] = style;
        }
        return style;
    }

    getMarkerStyle() {
        let style = new Style({
            image: new Circle({
                radius: 6,
                stroke: new Stroke({
                    color: 'black',
                }),
                fill: new Fill({
                    color: 'red',
                }),
            }),
        });
        return style;
    }
}
