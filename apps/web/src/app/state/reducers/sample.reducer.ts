import { createReducer, on } from '@ngrx/store';
import { toggleForm } from '../actions/sample.actions';

export interface SampleState {
  showForm: boolean;
}

const initialState: SampleState = { showForm: false };

export const sampleReducer = createReducer<SampleState>(
  initialState,
  on(toggleForm, (state): SampleState => ({ ...state, showForm: !state.showForm })),
);
