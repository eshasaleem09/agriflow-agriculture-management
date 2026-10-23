import { createSlice } from '@reduxjs/toolkit';

const initialState = [
{ id: 1, name: 'Wheat', quantity: 2500, health: 88, field: 'Field A' },
{ id: 2, name: 'Rice', quantity: 3200, health: 72, field: 'Field B' },
{ id: 3, name: 'Corn', quantity: 1800, health: 48, field: 'Field C' },
{ id: 4, name: 'Cotton', quantity: 950, health: 25, field: 'Field D' },
];

const cropsSlice = createSlice({
name: 'crops',
initialState,
reducers: {
addCrop: (state, action) => {
state.push(action.payload);
},

updateCrop: (state, action) => {
  const index = state.findIndex(
    (crop) => crop.id === action.payload.id
  );

  if (index !== -1) {
    state[index] = action.payload;
  }
},

deleteCrop: (state, action) => {
  return state.filter((crop) => crop.id !== action.payload);
},

},
});

export const { addCrop, updateCrop, deleteCrop } = cropsSlice.actions;

export default cropsSlice.reducer;
