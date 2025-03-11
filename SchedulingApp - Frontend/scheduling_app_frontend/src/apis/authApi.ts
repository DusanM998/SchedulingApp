import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:7210/api/"
    }),
    tagTypes: ["AuthApi"],
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (userData) => ({
                url: "auth/register",
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: userData
            }),
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
        getUserByUserId: builder.query({ //query su operacije koje se koriste za preuzimanje podataka sa servera
            query: (id) => ({
                url: `auth/${id}`,
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
    useUpdateUserDetailsMutation,
    useGetUserByUserIdQuery,
    useVerifyPasswordMutation
} = authApi;
export default authApi;