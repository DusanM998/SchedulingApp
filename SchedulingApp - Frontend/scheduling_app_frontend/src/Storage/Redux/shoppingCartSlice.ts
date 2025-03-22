import { createSlice } from "@reduxjs/toolkit";
import { korpaModel } from "../../Interfaces";

const initialState: korpaModel = {
    stavkaKorpe: []
};

export const shoppingCartSlice = createSlice({
    name: "stavkaKorpe",
    initialState: initialState,
    reducers: {
        setShoppingCart: (state, action) => {
            state.stavkaKorpe = action.payload;
        },
        azurirajKolicinu: (state, action) => {
            state.stavkaKorpe = state.stavkaKorpe?.map((item) => {
                if (item.id === action.payload.stavkaKorpe.id) {
                    item.kolicina = action.payload.kolicina;
                }
                return item;
            });
        },
        removeFromCart: (state, action) => {
            state.stavkaKorpe = state.stavkaKorpe?.filter((item) => {
                if (item.id === action.payload.stavkaKorpe.id) {
                    return null;
                }
                return item;
            })
        },
        setTerminForObjekat: (state, action) => { // Cuva stanje izabranog termina za odredjeni sportski objekat
            state.stavkaKorpe = state.stavkaKorpe?.map((item) => {
                if (item.sportskiObjekat?.sportskiObjekatId === action.payload.sportskiObjekatId) {
                    if (item.sportskiObjekat) {
                        item.sportskiObjekat.selectedTerminId = action.payload.terminId;
                        item.sportskiObjekat.selectedTermin = action.payload.termin; // Cuvamo ceo termin
                    }
                }
                return item;
            });
        }
    }
});

export const { setShoppingCart, azurirajKolicinu, removeFromCart, setTerminForObjekat } = shoppingCartSlice.actions;
export const shoppingCartReducer = shoppingCartSlice.reducer;