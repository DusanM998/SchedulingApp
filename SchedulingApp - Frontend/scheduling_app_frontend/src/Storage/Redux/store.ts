import { configureStore } from "@reduxjs/toolkit";
import { userAuthReducer } from "./userAuthSlice";
import { authApi, shoppingCartApi, sportskiObjekatApi, terminApi } from "../../apis";
import { sportskiObjekatReducer } from "./sportskiObjekatSlice";
import { shoppingCartReducer } from "./shoppingCartSlice";

const store = configureStore({
    reducer: {
        userAuthStore: userAuthReducer,
        sportskiObjekatStore: sportskiObjekatReducer,
        shoppingCartFromStore: shoppingCartReducer,
        [authApi.reducerPath]: authApi.reducer,
        [sportskiObjekatApi.reducerPath]: sportskiObjekatApi.reducer,
        [terminApi.reducerPath]: terminApi.reducer,
        [shoppingCartApi.reducerPath]: shoppingCartApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(sportskiObjekatApi.middleware)
            .concat(shoppingCartApi.middleware)
            .concat(terminApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;

export default store;