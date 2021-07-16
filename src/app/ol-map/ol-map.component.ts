import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import TileLayer from 'ol/layer/Tile';
import Map from 'ol/Map';
import * as olProj from 'ol/proj';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import Vector from 'ol/layer/Vector';
import SourceVector from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';

@Component({
  selector: 'app-ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss']
})
export class OlMapComponent implements OnInit, AfterViewInit {
  @ViewChild('olPopupContainer') popupContainer: ElementRef<HTMLDivElement>;

  map: Map;
  overlay: Overlay;
  vectorLayer: any;

  constructor() { }
  

  ngOnInit(): void {
    this.map = new Map({
      target: 'ol-map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: olProj.fromLonLat([7.0785, 51.4614]),
        zoom: 5
      })
    });

  }

  ngAfterViewInit(): void {

    let point = olProj.fromLonLat([7.0785, 51.4614]);
    console.log({point});
    this.overlay = new Overlay({
      element: this.popupContainer.nativeElement,
      autoPan: true,
      autoPanAnimation: {
          duration: 250
      }
    });
    this.map.addOverlay(this.overlay);

    this.map.on('click', (evt) => {
      const coordinate = evt.coordinate;
      console.log({coordinate})
    
      this.overlay.setPosition(coordinate);
    });

    this.overlay.setPosition(point);

    this.vectorLayer = new Vector({
      source: new SourceVector({
          features: [
              new Feature({
                  geometry: new Point(olProj.fromLonLat([7.0785, 51.4614]))
              })
          ]
      })
    });

    this.map.addLayer(this.vectorLayer);
    

  }

  closePopup(){
    this.overlay.setPosition(undefined);
  }

  
}
