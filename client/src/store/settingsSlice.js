import { createSlice } from '@reduxjs/toolkit';

const loadInitialState = () => {
  const saved = localStorage.getItem('scraper-settings');
  return saved ? JSON.parse(saved) : {
    proxyIps: [],
    aiModel: 'gemini',
    customModel: '',
    openaiKey: '',
    geminiKey: '',
    huggingfaceKey: '',
  };
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadInitialState(),
  reducers: {
    updateSettings: (state, action) => {
      const newState = { ...state, ...action.payload };
      localStorage.setItem('scraper-settings', JSON.stringify(newState));
      return newState;
    },
  },
});

export const { updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;