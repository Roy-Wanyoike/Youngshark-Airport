import { createAction, props } from '@ngrx/store';

export const increaseValue = createAction(
  '[Counter] increase',
  props<{ increaseBy: number }>(),
);
export const decreaseValue = createAction(
  '[Counter] decrease',
  props<{ decreaseBy: number }>(),
);
