import { BookingState } from './reducers/booking.reducer';
import { CounterState } from './reducers/counter.reducer';
import { SampleState } from './reducers/sample.reducer';

export interface AppState {
  sample: SampleState;
  counter: CounterState;
  booking: BookingState;
}
