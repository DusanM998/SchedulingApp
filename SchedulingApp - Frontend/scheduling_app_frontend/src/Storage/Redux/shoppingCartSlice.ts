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
        }
    }
});

export const { setShoppingCart, azurirajKolicinu, removeFromCart } = shoppingCartSlice.actions;
export const shoppingCartReducer = shoppingCartSlice.reducer;