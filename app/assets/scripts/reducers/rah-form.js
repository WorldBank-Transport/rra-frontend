import {
  RESET_RAH_FORM,
  START_SUBMIT_RAH,
  FINISH_SUBMIT_RAH
} from '../actions';

const initialState = {
  processing: false,
  error: null,
  data: {}
};

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case RESET_RAH_FORM:
      return Object.assign({}, state, initialState);
    case START_SUBMIT_RAH:
      return Object.assign({}, state, initialState, {processing: true});
    case FINISH_SUBMIT_RAH:
      state = Object.assign({}, state, { processing: false });
      if (action.error) {
        state.error = action.error;
      } else {
        state.data = action.data;
      }
      break;
  }
  return state;
}
