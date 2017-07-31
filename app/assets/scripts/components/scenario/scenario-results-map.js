'use strict';
import React, { PropTypes as T } from 'react';
import mapboxgl from 'mapbox-gl';

import config from '../../config';

const clone = data => JSON.parse(JSON.stringify(data));

class ResultsMap extends React.Component {
  setupMap () {
    this.ready = false;
    mapboxgl.accessToken = config.mbtoken;
    let { bbox } = this.props;

    this.theMap = new mapboxgl.Map({
      container: this.refs.map,
      style: 'mapbox://styles/mapbox/light-v9'
    });
    this.theMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
    this.theMap.scrollZoom.disable();
    this.theMap.fitBounds(bbox);
    this.theMap.on('load', this.setupData.bind(this));
  }

  setupData () {
    let empty = {
      type: 'FeatureCollection',
      features: []
    };

    this.theMap.addSource('etaData', {
      'type': 'geojson',
      'data': this.props.data.fetched ? clone(this.props.data.data.geojson) : empty
    });

    this.theMap.addSource('poiData', {
      type: 'geojson',
      data: this.props.poi.fetched ? clone(this.props.poi.data.geojson) : empty
    });

    this.theMap.addLayer({
      'id': 'eta',
      'type': 'circle',
      'source': 'etaData',
      'paint': {
        'circle-color': {
          'base': 1,
          'type': 'interval',
          'property': 'e',
          'stops': [
            [0, '#1a9850'],
            [600, '#91cf60'],
            [1200, '#d9ef8b'],
            [1800, '#fee08b'],
            [3600, '#fc8d59'],
            [5400, '#d73027'],
            [7200, '#4d4d4d']
          ]
        },
        'circle-radius': {
          'base': 1,
          'type': 'interval',
          'property': 'pn',
          'stops': [
            [{zoom: 0, value: 0}, 2],
            [{zoom: 0, value: 1}, 5],
            [{zoom: 6, value: 0}, 5],
            [{zoom: 6, value: 1}, 25],
            [{zoom: 14, value: 0}, 15],
            [{zoom: 14, value: 1}, 45]
          ]
        },
        'circle-blur': 0.5,
        'circle-opacity': {
          'stops': [
            [0, 0.1],
            [6, 0.5],
            [12, 0.75],
            [16, 0.9]
          ]
        }
      }
    }, 'poi');

    this.theMap.addLayer({
      id: 'poi',
      type: 'symbol',
      source: 'poiData',
      layout: {
        'icon-image': 'marker-15'
      }
    });

    this.ready = true;
  }

  componentDidMount () {
    if (this.props.bbox) this.setupMap();
  }

  componentWillUnmount () {
    if (this.theMap) {
      this.theMap.remove();
    }
  }

  componentDidUpdate (prevProps) {
    if (this.ready) {
      if (prevProps.data.fetched) {
        this.theMap.getSource('etaData').setData(clone(this.props.data.data.geojson));
      }
      if (prevProps.poi.fetched) {
        this.theMap.getSource('poiData').setData(clone(this.props.poi.data.geojson));
      }
    }
  }

  render () {
    return (
      <article className='card card--analysis-result scenario-vis'>
        <div className='card__contents'>
          <header className='card__header'>
            <h1 className='card__title'>ETA Visualization</h1>
          </header>

          <figure className='card__media scenario-vis__media'>
            <div className='card__cover scenario-vis__map' ref='map'></div>

            <figcaption className='scenario-vis__legend'>
              <h3>Travel time in minutes</h3>
              <dl>
                <dt>Dark green</dt>
                <dd className='l1'><span>0</span></dd>
                <dt>Soft green</dt>
                <dd className='l2'><span>10</span></dd>
                <dt>Light green</dt>
                <dd className='l3'><span>20</span></dd>
                <dt>Yellow</dt>
                <dd className='l4'><span>30</span></dd>
                <dt>Orange</dt>
                <dd className='l5'><span>60</span></dd>
                <dt>Red</dt>
                <dd className='l6'><span>90</span></dd>
                <dt>Brown</dt>
                <dd className='l7'><span>120</span></dd>
              </dl>
            </figcaption>
          </figure>
        </div>
      </article>
    );
  }
}

ResultsMap.propTypes = {
  bbox: T.array,
  data: T.object,
  poi: T.object
};

export default ResultsMap;
