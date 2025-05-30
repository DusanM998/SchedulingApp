import { createSlice } from "@reduxjs/toolkit";
import { userModel } from "../../Interfaces";

export const emptyUserState: userModel = {
    name: "",
    id: "",
    email: "",
    role: "",
    image: "",
    phoneNumber: ""
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
            state.phoneNumber = action.payload.phoneNumber;
        },
        logoutUser: (state) => {
            return emptyUserState;
        }
    },
});

export const { setLoggedInUser, logoutUser } = userAuthSlice.actions;
export const userAuthReducer = userAuthSlice.reducer;