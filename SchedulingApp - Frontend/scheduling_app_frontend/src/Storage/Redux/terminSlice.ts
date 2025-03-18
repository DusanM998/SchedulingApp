import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    termin: [],
}

export const terminSlice = createSlice({
    name: "Termini",
    initialState: initialState,
    reducers: {
        setTermin: (state, action) => {
            console.log("Reducer setTermini:", action.payload);
            state.termin = action.payload;
        }
    },
});

export const { setTermin } = terminSlice.actions;
export const terminReducer = terminSlice.reducer;