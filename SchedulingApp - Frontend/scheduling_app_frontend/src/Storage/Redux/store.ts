import { configureStore } from "@reduxjs/toolkit";
import { userAuthReducer } from "./userAuthSlice";
import { authApi, filterApi, placanjeApi, rezervacijaApi, shoppingCartApi, sportskiObjekatApi, terminApi } from "../../apis";
import { sportskiObjekatReducer } from "./sportskiObjekatSlice";
import { shoppingCartReducer } from "./shoppingCartSlice";
import { terminReducer } from "./terminSlice";
import {rezervacijaReducer} from './rezervacijaSlice';

// Store - mesto za cuvanje stanja cele aplikacije (kombinacija svih slice-ova)
const store = configureStore({
    reducer: { // reducer - funkcija koja prima trenutno stanje i akciju, i vraca novo stanje
        userAuthStore: userAuthReducer, // podaci o ulogovanom korisniku
        sportskiObjekatStore: sportskiObjekatReducer, // lista sportskih objekata
        shoppingCartFromStore: shoppingCartReducer, // podaci o korpi za kupovinu
        terminStore: terminReducer, // podaci o terminima
        rezervacijaStore: rezervacijaReducer, // podaci o rezervacijama
        // Dodavanje API slice-ova u store
        // Svaki API slice automatski kreira svoj reducer i middleware
        // Ovi reducer-i i middleware-i se moraju dodati u store da bi API slice-ovi radili
        [authApi.reducerPath]: authApi.reducer,
        [sportskiObjekatApi.reducerPath]: sportskiObjekatApi.reducer,
        [terminApi.reducerPath]: terminApi.reducer,
        [shoppingCartApi.reducerPath]: shoppingCartApi.reducer,
        [placanjeApi.reducerPath]: placanjeApi.reducer,
        [rezervacijaApi.reducerPath]: rezervacijaApi.reducer,
        [filterApi.reducerPath]: filterApi.reducer
    },
    // Middleware - funkcije koje se izvrsavaju izmedju akcije i reducer-a
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(sportskiObjekatApi.middleware)
            .concat(shoppingCartApi.middleware)
            .concat(terminApi.middleware)
            .concat(placanjeApi.middleware)
            .concat(rezervacijaApi.middleware)
            .concat(filterApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;

export default store;