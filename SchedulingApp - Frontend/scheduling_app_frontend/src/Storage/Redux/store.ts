import { configureStore } from "@reduxjs/toolkit";
import { userAuthReducer } from "./userAuthSlice";
import { authApi } from "../../apis";

const store = configureStore({
    reducer: {
        userAuthStore: userAuthReducer,
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;

export default store;