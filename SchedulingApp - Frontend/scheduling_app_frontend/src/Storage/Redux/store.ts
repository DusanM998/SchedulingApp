import { configureStore } from "@reduxjs/toolkit";
import { userAuthReducer } from "./userAuthSlice";
import { authApi, sportskiObjekatApi, terminApi } from "../../apis";
import { sportskiObjekatReducer } from "./sportskiObjekatSlice";

const store = configureStore({
    reducer: {
        userAuthStore: userAuthReducer,
        sportskiObjekatStore: sportskiObjekatReducer,
        [authApi.reducerPath]: authApi.reducer,
        [sportskiObjekatApi.reducerPath]: sportskiObjekatApi.reducer,
        [terminApi.reducerPath]: terminApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(sportskiObjekatApi.middleware)
            .concat(terminApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;

export default store;