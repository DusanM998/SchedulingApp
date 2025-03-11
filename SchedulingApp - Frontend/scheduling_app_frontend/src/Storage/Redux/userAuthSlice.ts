import { createSlice } from "@reduxjs/toolkit";
import { userModel } from "../../Interfaces";

export const emptyUserState: userModel = {
    name: "",
    id: "",
    email: "",
    role: "",
    image: ""
};

export const userAuthSlice = createSlice({
    name: "userAuth",
    initialState: emptyUserState,
    reducers: {
        setLoggedInUser: (state, action) => {
            state.name = action.payload.name;
            state.id = action.payload.id;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.image = action.payload.image;
        },
    },
});

export const { setLoggedInUser } = userAuthSlice.actions;
export const userAuthReducer = userAuthSlice.reducer;