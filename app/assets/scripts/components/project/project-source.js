'use strict';
import React, { PropTypes as T } from 'react';
import c from 'classnames';

import { fileTypesMatrix } from '../../utils/constants';
import { t } from '../../utils/i18n';

import { ModalBody } from '../modal';
import ModalBase from './source-modals/modal-base';
import ModalPoi from './source-modals/modal-poi';

class PorjectSourceData extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      modalOpen: false
    };
  }

  openModal () {
    this.setState({modalOpen: true});
  }

  closeModal () {
    this.setState({modalOpen: false});
  }

  renderModal () {
    if (!this.props.editable) {
      return null;
    }

    var TheModal = null;
    switch (this.props.type) {
      case 'profile':
        TheModal = ModalProfile;
        break;
      case 'admin-bounds':
        TheModal = ModalAdminBounds;
        break;
      case 'origins':
        TheModal = ModalOrigins;
        break;
      case 'road-network':
        TheModal = ModalRoadNetwork;
        break;
      case 'poi':
        TheModal = ModalPoi;
        break;
    }

    return TheModal ? (<TheModal
      onCloseClick={this.closeModal.bind(this)}
      revealed={this.state.modalOpen}
      type={this.props.type}
      sourceData={this.props.sourceData}
      projectId={this.props.projectId}
      scenarioId={this.props.scenarioId}
    />) : null;
  }

  render () {
    let { display, description } = fileTypesMatrix[this.props.type];

    return (
      <section className={c(`card psb psb--${this.props.type}`, {'psb--complete': this.props.complete})}>
        <div className='card__contents'>
          <header className='card__header'>
            <div className='card__headline'>
              <a title='Edit detail' className='link-wrapper' href='#'>
                <h1 className='card__title'>{display}</h1>
              </a>
              <p className='card__subtitle'>1 Source file</p>
            </div>
            <div className='card__actions actions'>
              <ul className='actions__menu'>
                <li>
                  <a className='actions__menu-item ca-question' title='Learn more' href='#'>
                    <span>What is this?</span>
                  </a>
                </li>
              </ul>
              <ul className='actions__menu'>
                <li>
                  <a className='actions__menu-item ca-download' title='Export raw data' href='#'>
                    <span>Download</span>
                  </a>
                </li>
                {this.props.editable ? (
                  <li>
                    <button className='actions__menu-item ca-pencil' type='button' title='Modify details' onClick={this.openModal.bind(this)}>
                      <span>Edit</span>
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
          </header>
          <div className='card__body'>
            <div className='card__summary'>
              <p>{description}</p>
            </div>
          </div>
        </div>

        {this.renderModal()}
      </section>
    );
  }
}

PorjectSourceData.defaultProps = {
  editable: true
};

PorjectSourceData.propTypes = {
  editable: T.bool,
  type: T.string,
  complete: T.bool,
  sourceData: T.object,
  projectId: T.number,
  scenarioId: T.number
};

export default PorjectSourceData;

// Modal Components.
// One per type. Forms are better handled on their own.

// ////////////////////////////////////////////////////////////////////////// //
// /////////////                  Profile                       ///////////// //
// ////////////////////////////////////////////////////////////////////////// //

class ModalProfile extends ModalBase {
  onSubmit () {
    console.log('Submit');
  }

  renderBody () {
    let sourceData = this.props.sourceData;
    let hasFile = !!sourceData.files.length;
    return (
      <ModalBody>
        <form className='form'>
        {hasFile ? (
          <div className='form__group'>
            <label className='form__label' htmlFor='profile'>{t('Source')}</label>
            <div className='form__input-group'>
              <input type='text' id='profile' name='profile' className='form__control' placeholder={sourceData.files[0].name} readOnly />
              <div className='form__input-addon'><button type='button' className='button button--danger-plain button--text-hidden' title={t('Remove file')}><i className='collecticon-trash-bin'></i><span>{t('Remove file')}</span></button></div>
            </div>
          </div>
        ) : (
          <div className='form__group'>
            <label className='form__label' htmlFor='profile'>{t('Source')}</label>
            <input type='file' id='profile' name='profile' className='form__control' placeholder={t('Select a profile file')} />
          </div>
        )}
        </form>
      </ModalBody>
    );
  }
}

ModalProfile.propTypes = {
  sourceData: T.object
};

// ////////////////////////////////////////////////////////////////////////// //
// /////////////              Admin Boundaries                  ///////////// //
// ////////////////////////////////////////////////////////////////////////// //

class ModalAdminBounds extends ModalBase {
  onSubmit () {
    console.log('Submit');
  }

  renderBody () {
    let sourceData = this.props.sourceData;
    let hasFile = !!sourceData.files.length;
    return (
      <ModalBody>
        <form className='form'>
        {hasFile ? (
          <div className='form__group'>
            <label className='form__label' htmlFor='admin-bounds'>{t('Source')}</label>
            <div className='form__input-group'>
              <input type='text' id='admin-bounds' name='admin-bounds' className='form__control' placeholder={sourceData.files[0].name} readOnly/>
              <div className='form__input-addon'><button type='button' className='button button--danger-plain button--text-hidden' title={t('Remove file')}><i className='collecticon-trash-bin'></i><span>{t('Remove file')}</span></button></div>
            </div>
          </div>
        ) : (
          <div className='form__group'>
            <label className='form__label' htmlFor='admin-bounds'>{t('Source')}</label>
            <input type='file' id='admin-bounds' name='admin-bounds' className='form__control' placeholder={t('Select a administrative boundaries file')} />
          </div>
        )}
        </form>
      </ModalBody>
    );
  }
}

ModalAdminBounds.propTypes = {
  sourceData: T.object
};

// ////////////////////////////////////////////////////////////////////////// //
// /////////////                  Origins                       ///////////// //
// ////////////////////////////////////////////////////////////////////////// //

class ModalOrigins extends ModalBase {
  onSubmit () {
    console.log('Submit');
  }

  renderSourceFile () {
    let sourceData = this.props.sourceData;
    let hasFile = !!sourceData.files.length;

    if (!hasFile) {
      return (
        <div className='form__group'>
          <label className='form__label' htmlFor='origins'>{t('Source')}</label>
          <input type='file' id='origins' name='origins' className='form__control' placeholder={t('Select a administrative boundaries file')} />
        </div>
      );
    }

    let file = this.props.sourceData.files[0];

    return (
      <div>
        <div className='form__group'>
          <label className='form__label' htmlFor='origins'>{t('Source')}</label>
          <div className='form__input-group'>
            <input type='text' id='origins' name='origins' className='form__control' placeholder={file.name} readOnly />
            <div className='form__input-addon'><button type='button' className='button button--danger-plain button--text-hidden' title={t('Remove file')}><i className='collecticon-trash-bin'></i><span>{t('Remove file')}</span></button></div>
          </div>
        </div>
        {file.data.indicators.map((o, i) => (
          <fieldset className='form__fieldset' key={o.key}>
            <div className='form__inner-header'>
              <div className='form__inner-headline'>
                <legend className='form__legend'>{t('Attribute {idx}', {idx: i + 1})}</legend>
              </div>
              <div className='form__inner-actions'>
                <button type='button' className='fia-trash' title='Delete fieldset'><span>Delete</span></button>
              </div>
            </div>

            <div className='form__hascol form__hascol--2 disabled'>
              <div className='form__group'>
                <label className='form__label' htmlFor={`key-${i}`}>{t('Key')}</label>
                <input type='text' id={`key-${i}`} name={`key-${i}`} className='form__control' placeholder={o.key} />
              </div>
              <div className='form__group'>
                <label className='form__label' htmlFor={`label-${i}`}>{t('Label')}</label>
                <input type='text' id={`label-${i}`} name={`label-${i}`} className='form__control' placeholder={o.label} />
              </div>
            </div>
          </fieldset>
        ))}
      </div>
    );
  }

  renderBody () {
    return (
      <ModalBody>
        <form className='form'>
          {this.renderSourceFile()}
        </form>
      </ModalBody>
    );
  }
}

ModalOrigins.propTypes = {
  sourceData: T.object
};

// ////////////////////////////////////////////////////////////////////////// //
// /////////////                Road Network                    ///////////// //
// ////////////////////////////////////////////////////////////////////////// //

class ModalRoadNetwork extends ModalBase {
  constructor (props) {
    super(props);
    this.state = {
      source: props.sourceData.type || 'file'
    };
  }

  onSubmit () {
    console.log('Submit');
  }

  renderSourceFile () {
    let sourceData = this.props.sourceData;
    let hasFile = !!sourceData.files.length;

    if (!hasFile) {
      return (
        <div className='form__group'>
          <label className='form__label' htmlFor='road-network'>{t('Source')}</label>
          <input type='file' id='road-network' name='road-network' className='form__control' placeholder={t('Select a road network file')} />
        </div>
      );
    }

    return (
      <div className='form__group'>
        <div className='form__input-group'>
          <input type='text' id='road-network' name='road-network' className='form__control' placeholder={sourceData.files[0].name} readOnly />
          <div className='form__input-addon'><button type='button' className='button button--danger-plain button--text-hidden' title={t('Remove file')}><i className='collecticon-trash-bin'></i><span>{t('Remove file')}</span></button></div>
        </div>
      </div>
    );
  }

  renderBody () {
    return (
      <ModalBody>
        <form className='form'>
          <div className='form__group'>
            <label className='form__label'>Source</label>

            <label className='form__option form__option--inline form__option--custom-radio'>
              <input type='radio' name='source-type' id='file' checked={this.state.source === 'file'} />
              <span className='form__option__text'>File upload</span>
              <span className='form__option__ui'></span>
            </label>

            <label className='form__option form__option--inline form__option--custom-radio disabled'>
              <input type='radio' name='source-type' id='osm' checked={this.state.source === 'osm'} />
              <span className='form__option__text'>OSM data</span>
              <span className='form__option__ui'></span>
            </label>
          </div>
          {this.state.source === 'file' ? this.renderSourceFile() : null}
        </form>
      </ModalBody>
    );
  }
}

ModalRoadNetwork.propTypes = {
  sourceData: T.object
};