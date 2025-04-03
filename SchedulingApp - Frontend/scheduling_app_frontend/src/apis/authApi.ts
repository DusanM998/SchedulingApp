import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userModel } from "../Interfaces";

const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:7210/api/",
        credentials: "include"
    }),
    tagTypes: ["AuthApi"],
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (userData) => ({
                url: "auth/register",
                method: "POST",
                body: userData
            }),
            invalidatesTags: ["AuthApi"]
        }),
        loginUser: builder.mutation({
            query: (userCredentials) => ({
                url: "auth/login",
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: userCredentials
            }),
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url: 'auth/logout',
                method: "POST"
            }),
        }),
        getUserByUserId: builder.query({ //query su operacije koje se koriste za preuzimanje podataka sa servera
            query: (id) => ({
                url: `auth/${id}`,
            }),
            providesTags: ["AuthApi"],
        }),
        getCurrentUser: builder.query<userModel, void>({
            query: () => ({
                url: "auth/currentUser",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }), 
            providesTags: ["AuthApi"],
        }),
        updateUserDetails: builder.mutation({
            query: ({data, id}) => ({
                url: "auth/" + id,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["AuthApi"],
        }),
        verifyPassword: builder.mutation({
            query: (userCredentials) => ({
                url: "auth/verify-password",
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: userCredentials,
            }),
        })
    })
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useUpdateUserDetailsMutation,
    useGetUserByUserIdQuery,
    useGetCurrentUserQuery,
    useVerifyPasswordMutation
} = authApi;
export default authApi;