import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { increaseValue, decreaseValue } from '../actions/counter.actions';

export interface CounterState {
  count: number;
  show: boolean;
}

const initialState: CounterState = { count: 10, show: true };

const selectCounterState = createFeatureSelector<CounterState>('counter');
export const selectCount = createSelector(selectCounterState, (s) => s.count);

export const counterReducer = createReducer<CounterState>(
  initialState,
  on(increaseValue, (state, a): CounterState => ({
    ...state,
    count: state.count + a.increaseBy,
  })),
  on(decreaseValue, (state, a): CounterState => ({
    ...state,
    count: state.count - a.decreaseBy,
  })),
);
