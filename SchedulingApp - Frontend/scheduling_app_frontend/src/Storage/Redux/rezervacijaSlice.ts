import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RezervacijaState {
  apiResult: any | null;
  userInput: any | null;
}

const initialState: RezervacijaState = {
  apiResult: null,
  userInput: null,
};

const rezervacijaSlice = createSlice({
  name: "rezervacija",
  initialState,
  reducers: {
    setRezervacija: (
      state,
      action: PayloadAction<{ apiResult: any; userInput: any }>
    ) => {
      state.apiResult = action.payload.apiResult;
      state.userInput = action.payload.userInput;
    },
    clearRezervacija: (state) => {
      state.apiResult = null;
      state.userInput = null;
    },
  },
});

export const { setRezervacija, clearRezervacija } = rezervacijaSlice.actions;
export const rezervacijaReducer = rezervacijaSlice.reducer;
