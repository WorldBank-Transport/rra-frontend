'use strict';
import React, { PropTypes as T } from 'react';
import { render } from 'react-dom';
import mapboxgl from 'mapbox-gl';

import config from '../../config';
import { toTimeStr } from '../../utils/utils';
import { t } from '../../utils/i18n';

import LayerControl from '../map-layer-control';

const clone = data => JSON.parse(JSON.stringify(data));

class ResultsMap extends React.Component {
  setupMap () {
    this.popover = null;
    this.mapLoaded = false;

    mapboxgl.accessToken = config.mbtoken;
    let { bbox } = this.props;

    this.theMap = new mapboxgl.Map({
      container: this.refs.map,
      style: 'mapbox://styles/ruralroads/cj9fm2v4p85ex2rlo8ja3ybxh',
      attributionControl: false
    });
    this.theMap.addControl(new mapboxgl.AttributionControl(), 'bottom-right');
    this.theMap.scrollZoom.disable();
    this.theMap.fitBounds(bbox);
    this.theMap.on('style.load', () => {
      this.mapLoaded = true;
      this.setupData();
    });

    this.theMap.on('click', 'eta', e => {
      this.showPopover(e.features[0]);
    });

    this.theMap.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // Disable map rotation using right click + drag.
    this.theMap.dragRotate.disable();

    // Disable map rotation using touch rotation gesture.
    this.theMap.touchZoomRotate.disableRotation();

    // Remove compass.
    document.querySelector('.mapboxgl-ctrl .mapboxgl-ctrl-compass').remove();

    this.theMap.addControl(new LayerControl(), 'top-left');
  }

  onPopoverCloseClick () {
    this.popover.remove();
  }

  showPopover (feature) {
    let popoverContent = document.createElement('div');

    render(<MapPopover
            name={feature.properties.n}
            pop={feature.properties.p}
            popIndName={this.props.popIndName}
            time={this.props.comparing ? feature.properties.eDelta : feature.properties.e}
            comparing={this.props.comparing}
            compareScenarioName={this.props.compareScenarioName}
            poiName={this.props.poiName}
            onCloseClick={this.onPopoverCloseClick.bind(this)} />, popoverContent);

    // Populate the popup and set its coordinates
    // based on the feature found.
    if (this.popover != null) {
      this.popover.remove();
    }

    this.popover = new mapboxgl.Popup({closeButton: false})
      .setLngLat(feature.geometry.coordinates)
      .setDOMContent(popoverContent)
      .addTo(this.theMap);
  }

  getPopBuckets (featColl) {
    const feats = featColl.features;
    const totalBuckets = 5;
    const bucketSize = Math.floor(feats.length / totalBuckets);
    const pop = feats.map(f => f.properties.p).sort((a, b) => a - b);

    let buckets;
    if (pop.length < 5) {
      buckets = [0].concat(pop);
    } else {
      // Prepare the buckets array.
      // Get the pop value to build the buckets. All buckets have the same
      // amount of values.
      buckets = Array.apply(null, Array(totalBuckets - 1)).map((_, i) => pop[(i + 1) * bucketSize - 1]);

      // Add first and last values as well.
      buckets.unshift(0);
      buckets.push(pop[pop.length - 1]);
    }

    return buckets;
  }

  getCircleRadiusPaintProp (featColl) {
    let buckets = this.getPopBuckets(featColl);
    // Last value is not needed.
    buckets.pop();
    // Start from the last to account for less than 5 buckets.
    buckets.reverse();

    let stops = buckets.map((b, idx) => ([{zoom: 6, value: b}, (5 - idx) * 4]));
    // Reverse to ensure ascending order.
    stops.reverse();

    return {
      'base': 1,
      'type': 'interval',
      'property': 'p',
      'stops': stops
      // 'stops': [
      //   [{zoom: 0, value: 0}, 2],
      //   [{zoom: 0, value: 1}, 5],
      //   [{zoom: 6, value: 0}, 5],
      //   [{zoom: 6, value: 1}, 25],
      //   [{zoom: 14, value: 0}, 15],
      //   [{zoom: 14, value: 1}, 45]
      // ]
    };
  }

  getCircleColorPaintProp (comparing) {
    return comparing
      ? {
        'base': 1,
        'type': 'interval',
        'property': 'eDelta',
        'stops': [
          [-1860, '#1a9850'], // -31
          [-1800, '#91cf60'], // -30
          [-600, '#d9ef8b'], // -10
          [0, '#4d4d4d'], // 0
          [1, '#fee08b'],
          [600, '#fc8d59'], // 10
          [1800, '#d73027'] // 30
        ]
      }
      : {
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
      };
  }

  setupData () {
    if (!this.mapLoaded) {
      return;
    }
    if (!this.theMap.getSource('admin-bounds')) {
      this.theMap.addSource('admin-bounds', {
        type: 'vector',
        tiles: [`${config.api}/projects/${this.props.projectId}/tiles/admin-bounds/{z}/{x}/{y}`]
      });
      this.theMap.addLayer({
        'id': 'admin-bounds',
        'type': 'line',
        'source': 'admin-bounds',
        'source-layer': 'admin-bounds',
        'paint': {
          'line-color': '#53697F',
          'line-dasharray': [4, 1, 2, 1],
          'line-width': {
            'stops': [
              [4, 1],
              [12, 2]
            ]
          },
          'line-opacity': 0.32
        }
      }, 'eta');
    }

    if (!this.theMap.getSource('road-network')) {
      this.theMap.addSource('road-network', {
        type: 'vector',
        tiles: [`${config.api}/projects/${this.props.projectId}/scenarios/${this.props.scenarioId}/tiles/road-network/{z}/{x}/{y}`]
      });
      this.theMap.addLayer({
        'id': 'road-network',
        'type': 'line',
        'source': 'road-network',
        'source-layer': 'road-network',
        'paint': {
          'line-color': '#FFFFFF',
          'line-width': {
            'stops': [
              [4, 1],
              [10, 2],
              [12, 4]
            ]
          }
        },
        'filter': [
          'all',
          [
            '==',
            '$type',
            'LineString'
          ],
          [
            'has',
            'highway'
          ]
        ]
      }, 'place-neighbourhood');
      this.theMap.addLayer({
        'id': 'road-network-cap',
        'type': 'line',
        'source': 'road-network',
        'source-layer': 'road-network',
        'paint': {
          'line-color': '#53697F',
          'line-width': 0.5,
          'line-gap-width': {
            'stops': [
              [4, 1],
              [10, 2],
              [12, 4]
            ]
          },
          'line-opacity': 0.32
        },
        'filter': [
          'all',
          [
            '==',
            '$type',
            'LineString'
          ],
          [
            'has',
            'highway'
          ]
        ]
      }, 'road-network');
    }

    if (this.props.data.fetched && !this.theMap.getSource('etaData')) {
      this.theMap.addSource('etaData', {
        'type': 'geojson',
        'data': clone(this.props.data.data)
      });

      this.theMap.addLayer({
        'id': 'eta',
        'type': 'circle',
        'source': 'etaData',
        'paint': {
          'circle-color': this.getCircleColorPaintProp(this.props.comparing),
          'circle-radius': this.getCircleRadiusPaintProp(this.props.data.data),
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
    }

    if (this.props.poi.fetched && !this.theMap.getSource('poiData')) {
      this.theMap.addSource('poiData', {
        type: 'geojson',
        data: clone(this.props.poi.data)
      });
      this.theMap.addLayer({
        id: 'poi',
        type: 'symbol',
        source: 'poiData',
        layout: {
          'icon-image': 'marker-15'
        }
      });
    }

    if (!this.theMap.getLayer('satellite')) {
      this.theMap.addLayer({
        id: 'satellite',
        source: {
          'type': 'raster',
          'url': 'mapbox://mapbox.satellite',
          'tileSize': 256
        },
        type: 'raster',
        'layout': {
          'visibility': 'none'
        }
      }, 'road-network-cap');
    }
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
    if (this.props.data.fetched && this.props.data.receivedAt !== prevProps.data.receivedAt) {
      let source = this.theMap.getSource('etaData');
      if (source) {
        source.setData(clone(this.props.data.data));
        this.theMap.setPaintProperty('eta', 'circle-radius', this.getCircleRadiusPaintProp(this.props.data.data));
        this.theMap.setPaintProperty('eta', 'circle-color', this.getCircleColorPaintProp(this.props.comparing));
      } else {
        this.setupData();
      }
    }

    if (this.props.poi.fetched && this.props.poi.receivedAt !== prevProps.poi.receivedAt) {
      let source = this.theMap.getSource('poiData');
      if (source) {
        source.setData(clone(this.props.poi.data));
      } else {
        this.setupData();
      }
    }
  }

  renderPopLegend () {
    const data = this.props.data.data;
    if (!data.features) {
      return null;
    }

    const shorten = (num) => {
      if (num >= 1e6) {
        return Math.floor(num / 1e6) + 'M';
      } else if (num >= 1e3) {
        return Math.floor(num / 1e3) + 'K';
      } else {
        return num;
      }
    };

    let stops = this.getPopBuckets(data);
    // Build the legend
    let legend = [];
    stops.forEach((s, idx, all) => {
      // Skip idx 0.
      if (idx) {
        const from = all[idx - 1];
        const to = all[idx];
        const r = idx * 4;

        let scale = ['xs', 's', 'm', 'l', 'xl'];
        if (stops.length < 6) {
          // Cut the scale when it's not big enough.
          scale = scale.slice(scale.length - stops.length + 1);
        }

        legend.push(<dt key={`dt-${r}`} className={`radius radius--${scale[idx - 1]}`} title={`${from} - ${to}`}>{r}px radius</dt>);
        legend.push(<dd key={`dd-${r}`} title={`${from} - ${to}`}>{shorten(from)}-{shorten(to)}</dd>);
      }
    });

    return (
      <div className='legend__block'>
        <h3 className='legend__title'>{t('Population size')}</h3>
        <dl className='legend__dl legend__dl--size'>
          {legend}
        </dl>
      </div>
    );
  }

  renderTimeLegend () {
    return (
      <div className='legend__block'>
        {this.props.comparing ? (
          <h3 className='legend__title'>{t('Difference {minutes}', {minutes: <small>{t('(minutes)')}</small>}, true)}</h3>
        ) : (
          <h3 className='legend__title'>{t('Time to POI {minutes}', {minutes: <small>{t('(minutes)')}</small>}, true)}</h3>
        )}
        {this.props.comparing ? (
          <dl className='legend__dl legend__dl--colors'>
            <dt className='color color--alpha'>{t('Dark green')}</dt>
            <dd>{t('-30 or less')}</dd>
            <dt className='color color--beta'>{t('Soft green')}</dt>
            <dd>{t('-30 to -10')}</dd>
            <dt className='color color--gama'>{t('Light green')}</dt>
            <dd>{t('-10 to 0')}</dd>
            <dt className='color color--eta'>{t('Brown')}</dt>
            <dd>{t('No change')}</dd>
            <dt className='color color--delta'>{t('Yellow')}</dt>
            <dd>{t('0 to 10')}</dd>
            <dt className='color color--epsilon'>{t('Orange')}</dt>
            <dd>{t('10 to 30')}</dd>
            <dt className='color color--zeta'>{t('Red')}</dt>
            <dd>{t('30 or more')}</dd>
          </dl>
        ) : (
          <dl className='legend__dl legend__dl--colors'>
            <dt className='color color--alpha'>{t('Dark green')}</dt>
            <dd>{t('0 to 10')}</dd>
            <dt className='color color--beta'>{t('Soft green')}</dt>
            <dd>{t('10 to 20')}</dd>
            <dt className='color color--gama'>{t('Light green')}</dt>
            <dd>{t('20 to 30')}</dd>
            <dt className='color color--delta'>{t('Yellow')}</dt>
            <dd>{t('30 to 60')}</dd>
            <dt className='color color--epsilon'>{t('Orange')}</dt>
            <dd>{t('60 to 90')}</dd>
            <dt className='color color--zeta'>{t('Red')}</dt>
            <dd>{t('90 to 120')}</dd>
            <dt className='color color--eta'>{t('Brown')}</dt>
            <dd>{t('120 or more')}</dd>
          </dl>
        )}
      </div>
    );
  }

  render () {
    return (
      <article className='card card--analysis-result eta-vis'>
        <div className='card__contents'>
          <header className='card__header'>
            <h1 className='card__title'>{this.props.comparing ? t('Difference in travel time') : t('Travel time')}</h1>
          </header>

          <figure className='card__media eta-vis__media'>
            <div className='card__cover eta-vis__map' ref='map'></div>
            <figcaption className='eta-vis__legend legend'>
              {this.renderPopLegend()}
              {this.renderTimeLegend()}
            </figcaption>
          </figure>
        </div>
      </article>
    );
  }
}

ResultsMap.propTypes = {
  projectId: T.number,
  scenarioId: T.number,
  bbox: T.array,
  data: T.object,
  poi: T.object,
  poiName: T.string,
  popIndName: T.string,
  comparing: T.bool,
  compareScenarioName: T.string
};

export default ResultsMap;

class MapPopover extends React.Component {
  render () {
    let label = this.props.comparing ? t('Compared to {name}', {name: this.props.compareScenarioName}) : t('Nearest POI');
    let time;
    if (this.props.comparing) {
      time = this.props.time === 0 ? t('no difference') : `${toTimeStr(Math.abs(this.props.time))} ${this.props.time < 0 ? t('faster') : t('slower')}`;
    } else {
      time = toTimeStr(this.props.time);
    }
    return (
      <article className='popover'>
        <div className='popover__contents'>
          <header className='popover__header'>
            <div className='popover__headline'>
              <h1 className='popover__title'>{this.props.name}</h1>
            </div>
            <div className='popover__actions actions'>
              <ul className='actions__menu'>
                <li><button type='button' className='actions__menu-item poa-xmark' title='Close popover' onClick={this.props.onCloseClick}><span>{t('Dismiss')}</span></button></li>
              </ul>
            </div>
          </header>
          <div className='popover__body'>
            <dl className='dl-horizontal popover__details'>
              <dt>{this.props.popIndName}</dt>
              <dd>{this.props.pop}</dd>
              <dt>{label}</dt>
              <dd>{time}</dd>
            </dl>
          </div>
        </div>
      </article>
    );
  }
}

MapPopover.propTypes = {
  name: T.string,
  pop: T.number,
  popIndName: T.string,
  time: T.number,
  poiName: T.string,
  comparing: T.bool,
  compareScenarioName: T.string,
  onCloseClick: T.func
};
