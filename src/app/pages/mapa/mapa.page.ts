import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var mapboxgl: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, AfterViewInit {

  lat: number;
  lng: number;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let geo = params.geo;
      geo = geo.substr(4).split(',');
      this.lat = Number(geo[0]);
      this.lng = Number(geo[1]);
    });
  }

  ngAfterViewInit() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYW50eG9uZWd1aWd1cmVuIiwiYSI6ImNrZjNxYWdlNzAwZjIycmxjYWt3aTJhZm4ifQ.PXxV-BYg-aVurFDzT66wxg';

    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v10',
      center: [this.lng, this.lat],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true
    });

    map.on('load', () => {
      // Map resize
      map.resize();

      // Marker
      new mapboxgl.Marker()
        .setLngLat([this.lng, this.lat])
        .addTo(map);

      const layers = map.getStyle().layers;
      let labelLayerId;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      },
        labelLayerId
      );
    });
  }

}
