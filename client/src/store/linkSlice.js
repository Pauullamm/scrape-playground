import { createSlice } from '@reduxjs/toolkit';

const loadInitialState = () => {
    const saved = localStorage.getItem('startingUrl');
    return saved ? JSON.parse(saved) : {
        startingUrl: ''
    };
};

const linkSlice = createSlice({
    name: 'startingUrl',
    initialState: loadInitialState(),
    reducers: {
        updateLink: (state, action) => {
            const newState = { ...state, ...action.payload };
            localStorage.setItem('startingUrl', JSON.stringify(newState));
            return newState;
        },
    },
});

export const { updateLink } = linkSlice.actions;
export default linkSlice.reducer;
