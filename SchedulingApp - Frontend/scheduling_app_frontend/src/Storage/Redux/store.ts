import { configureStore } from "@reduxjs/toolkit";
import { userAuthReducer } from "./userAuthSlice";
import { authApi, filterApi, placanjeApi, rezervacijaApi, shoppingCartApi, sportskiObjekatApi, terminApi } from "../../apis";
import { sportskiObjekatReducer } from "./sportskiObjekatSlice";
import { shoppingCartReducer } from "./shoppingCartSlice";
import { terminReducer } from "./terminSlice";

const store = configureStore({
    reducer: {
        userAuthStore: userAuthReducer,
        sportskiObjekatStore: sportskiObjekatReducer,
        shoppingCartFromStore: shoppingCartReducer,
        terminStore: terminReducer,
        [authApi.reducerPath]: authApi.reducer,
        [sportskiObjekatApi.reducerPath]: sportskiObjekatApi.reducer,
        [terminApi.reducerPath]: terminApi.reducer,
        [shoppingCartApi.reducerPath]: shoppingCartApi.reducer,
        [placanjeApi.reducerPath]: placanjeApi.reducer,
        [rezervacijaApi.reducerPath]: rezervacijaApi.reducer,
        [filterApi.reducerPath]: filterApi.reducer
    },
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