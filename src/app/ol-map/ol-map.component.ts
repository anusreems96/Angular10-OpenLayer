import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    ViewChild
} from '@angular/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import * as olProj from 'ol/proj';
import { OSM, Vector, Cluster } from "ol/source";
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import View from 'ol/View';
import { boundingExtent } from 'ol/extent';

@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss'],
})
export class OlMapComponent implements OnInit, AfterViewInit {
  @ViewChild('olPopupContainer') popupContainer: ElementRef<HTMLDivElement>;

  map: Map;
  overlay: Overlay;
  vectorLayer: VectorLayer;
  markers: Feature[];
  userMarker: Feature;
  markersLayer: VectorLayer;

  constructor() {}

  ngOnInit(): void {
    // this.markers = [];
    // for (let i = 0; i < 10; i++) {
    //   this.markers.push(new Feature({
    //     geometry: new Point(olProj.fromLonLat([7.0785+i, 51.4614]))
    //   }));
    // }
    // this.userMarker = new Feature();
    // this.markersLayer = new VectorLayer({
    //   source: new Vector({ features: this.markers })
    // });
    // // this.map = new Map({
    // //   target: 'ol-map',
    // //   layers: [
    // //     new TileLayer({
    // //       source: new OSM()
    // //     })
    // //   ],
    // //   view: new View({
    // //     center: olProj.fromLonLat([7.0785, 51.4614]),
    // //     zoom: 5
    // //   })
    // // });
    // this.map = new Map({
    //   target: 'ol-map',
    //   layers: [
    //       new TileLayer({ source: new OSM() }),
    //       this.markersLayer
    //   ],
    //   view: new View({
    //       center: olProj.fromLonLat([9.0785, 51.4614]),
    //       zoom: 7
    //   })
    // });
  }

  ngAfterViewInit(): void {
    // let point = olProj.fromLonLat([7.0785, 51.4614]);
    // console.log({point});
    // this.overlay = new Overlay({
    //   element: this.popupContainer.nativeElement,
    //   autoPan: true,
    //   autoPanAnimation: {
    //       duration: 250
    //   }
    // });
    // this.map.addOverlay(this.overlay);

    // this.map.on('click', (evt) => {
    //   const coordinate = evt.coordinate;
    //   console.log({coordinate})

    //   this.overlay.setPosition(coordinate);
    // });

    // this.overlay.setPosition(point);

    // this.vectorLayer = new VectorLayer({
    //   source: new Vector({
    //       features: [
    //           new Feature({
    //               geometry: new Point(olProj.fromLonLat([7.0785, 51.4614]))
    //           })
    //       ]
    //   })
    // });

    // this.map.addLayer(this.vectorLayer);

    this.test();
  }

  closePopup() {
    this.overlay.setPosition(undefined);
  }

  test() {



    var content = document.getElementById('ol-popup-content');
    var center = olProj.transform([76.26, 9.93], 'EPSG:4326', 'EPSG:3857'); //initial position of map
    var view = new View({
      center: center,
      zoom: 2,
    });

    //raster layer on map
    var OSMBaseLayer = new TileLayer({
      source: new OSM(),
    });

    let straitSource = new Vector({ wrapX: true });
    

    var clusterSource = new Cluster({distance: 15, source: straitSource});
    //airportLayer = new OpenLayers.Layer.Vector("Airports", {strategies: [strategy]});

    const styleCache = {};
    var straitsLayer = new VectorLayer({
        source: clusterSource,
        style: function (feature) {
            const size = feature.get('features').length;
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
    });

    this.map = new Map({
      layers: [OSMBaseLayer, straitsLayer],
      target: 'ol-map',
      view: view,
    });

    // Popup showing the position the user clicked
    var container = document.getElementById('ol-popup');
    var popup = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    this.map.addOverlay(popup);

    /* Add a pointermove handler to the map to render the popup.*/
    this.map.on('pointermove', (evt) => {
      var feature = this.map.forEachFeatureAtPixel(evt.pixel, (feat, layer) => {
        return feat;
      });

      if (feature && feature.get('type') == 'Point') {
        var coordinate = evt.coordinate; //default projection is EPSG:3857 you may want to use ol.proj.transform

        content.innerHTML = feature.get('desc');
        popup.setPosition(coordinate);
      } else {
        popup.setPosition(undefined);
      }
    });

    var data = [
      { Lon: 19.455128, Lat: 41.310575 },
      { Lon: 19.455128, Lat: 41.310574 },
      { Lon: 19.457388, Lat: 41.300442 },
      { Lon: 19.413507, Lat: 41.295189 },
      { Lon: 16.871931, Lat: 41.175926 },
      { Lon: 16.844809, Lat: 41.151096 },
      { Lon: 16.855165, Lat: 45 },
    ];

    data.forEach((item) => {
      //iterate through array...
      var longitude = item.Lon,
        latitude = item.Lat,
        iconFeature = new Feature({
          geometry: new Point(
            olProj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857')
          ),
          type: 'Point',
          desc:
            '<pre> <b>Waypoint Details </b> ' +
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

      straitSource.addFeature(iconFeature);
    });

    this.map.on('click', (e) => {
        straitsLayer.getFeatures(e.pixel).then((clickedFeatures) => {
          if (clickedFeatures.length) {
            // Get clustered Coordinates
            const features = clickedFeatures[0].get('features');
            if (features.length > 1) {
              const extent = boundingExtent(
                features.map((r) => r.getGeometry().getCoordinates())
              );
              this.map.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50]});
            }
          }
        });
      });
  }

  addPointGeom() {} // End of function showStraits()
}
