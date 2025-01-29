import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import linkReducer from './linkSlice'

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    startingUrl: linkReducer,
  },
});