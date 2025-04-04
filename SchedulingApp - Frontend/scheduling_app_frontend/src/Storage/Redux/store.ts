import { configureStore } from "@reduxjs/toolkit";
import { userAuthReducer } from "./userAuthSlice";
import { authApi, placanjeApi, shoppingCartApi, sportskiObjekatApi, terminApi } from "../../apis";
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
        [placanjeApi.reducerPath]: placanjeApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(sportskiObjekatApi.middleware)
            .concat(shoppingCartApi.middleware)
            .concat(terminApi.middleware)
            .concat(placanjeApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;

export default store;