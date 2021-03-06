import {
  RESET_PROJECT_FORM,
  START_SUBMIT_PROJECT,
  FINISH_SUBMIT_PROJECT,
  START_DELETE_PROJECT,
  FINISH_DELETE_PROJECT
} from '../actions';

const initialState = {
  processing: false,
  action: null,
  error: null,
  data: {}
};

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case RESET_PROJECT_FORM:
      return Object.assign({}, state, initialState);
    case START_SUBMIT_PROJECT:
      return Object.assign({}, state, initialState, {processing: true, action: 'edit'});
    case FINISH_SUBMIT_PROJECT:
      state = Object.assign({}, state, { processing: false });
      if (action.error) {
        state.error = action.error;
      } else {
        state.data = action.data.results || action.data;
      }
      break;
    case START_DELETE_PROJECT:
      return Object.assign({}, state, initialState, {processing: true, action: 'delete'});
    case FINISH_DELETE_PROJECT:
      state = Object.assign({}, state, { processing: false });
      if (action.error) {
        state.error = action.error;
      } else {
        state.data = action.data.results || action.data;
      }
      break;
  }
  return state;
}
