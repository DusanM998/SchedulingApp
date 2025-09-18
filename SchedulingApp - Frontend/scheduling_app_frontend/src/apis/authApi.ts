import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiResponse, userModel } from "../Interfaces";

const authApi = createApi({ // createApi - f-ja za kreiranje API slice-a (Rexux komponenta za komunikaciju sa backend-om)
    reducerPath: "authApi", // jedinstveno ime za API slice
    baseQuery: fetchBaseQuery({ // fetchBaseQuery - f-ja za kreiranje HTTP requesta
        baseUrl: "https://localhost:7210/api/",
        credentials: "include", // salje cookies sa svakim zahtevom
        prepareHeaders: (headers) => {
            // Automatski dodaje token u header svakog zahteva ako je korisnik ulogovan
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["AuthApi"],
    endpoints: (builder) => ({
        registerUser: builder.mutation({ //mutation - operacije koje menjaju podatke (POST, PUT, DELETE, PATCH)
            query: (userData) => ({ // ovde mi query predstavlja objekat sa svim informacijama o HTTP zahtevu
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
        getCurrentUser: builder.query<apiResponse, void>({
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
        }),
        refreshToken: builder.mutation({
            query: () => ({
                url: "auth/refresh-token",
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
            }),
        }),
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