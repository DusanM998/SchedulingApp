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
        setTerminForObjekat: (state, action) => {
            state.stavkaKorpe = state.stavkaKorpe?.map((item) => {
              if (item.sportskiObjekat?.sportskiObjekatId === action.payload.sportskiObjekatId) {
                return {
                  ...item,
                  termini: action.payload.termin, // ovde cuvamo ceo niz termina
                };
              }
              return item;
            });
        },
        azurirajCenu: (state, action) => {
            state.stavkaKorpe = state.stavkaKorpe?.map((stavka) => 
                stavka.sportskiObjekat?.sportskiObjekatId === action.payload.sportskiObjekatId 
                ? { ...stavka, cenaZaSportskiObjekat: action.payload.cenaZaSportskiObjekat }
                : stavka
            );
        },
        azurirajStatusTermina: (state, action) => {
            state.stavkaKorpe = state.stavkaKorpe?.map((item) => {
                if (item.sportskiObjekat?.sportskiObjekatId === action.payload.sportskiObjekatId) {
                    if (item.sportskiObjekat?.selectedTermin) {
                        item.sportskiObjekat.selectedTermin.status = "Zauzet";
                    }
                }
                return item;
            });
        }
    }
});

export const { setShoppingCart, azurirajKolicinu, removeFromCart, setTerminForObjekat, azurirajCenu, azurirajStatusTermina } = shoppingCartSlice.actions;
export const shoppingCartReducer = shoppingCartSlice.reducer;