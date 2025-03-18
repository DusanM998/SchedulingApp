import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sportskiObjekat: [],
    searchSportskiObjekat: "",
}

export const sportskiObjekatSlice = createSlice({
    name: "SportskiObjekti",
    initialState: initialState,
    reducers: {
        setSportskiObjekat: (state, action) => {
            console.log("Reducer setSportskiObjekat:", action.payload);
            state.sportskiObjekat = action.payload;
        },
        setSearchSportskiObjekat: (state, action) => {
            state.searchSportskiObjekat = action.payload;
        },
    },
});

export const { setSportskiObjekat, setSearchSportskiObjekat } = sportskiObjekatSlice.actions;
export const sportskiObjekatReducer = sportskiObjekatSlice.reducer;