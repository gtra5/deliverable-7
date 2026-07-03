import { configureStore } from '@reduxjs/toolkit';
import gridReducer from './gridSlice';

export const store = configureStore({
  reducer: {
    grid: gridReducer,
  },
});

// Only needed if you're writing hooks in plain JS with autocompletion
// via JSDoc; skip entirely in a .ts project and use RootState/AppDispatch types instead.
