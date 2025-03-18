import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const terminApi = createApi({
    reducerPath: "termin",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:7210/api/",
        prepareHeaders: (headers: Headers, api) => {
            const token = localStorage.getItem("token");
            token && headers.append("Authorization", "Bearer" + token);
        },
    }),
    tagTypes: ["Termini"],
    endpoints: (builder) => ({
        getTermini: builder.query({
            query: () => ({
                url:"termin"
            }),
            providesTags: ["Termini"]
        }),
        getTerminById: builder.query({
            query: (id) => ({
                url:`termin/${id}`,
            }),
            providesTags: ["Termini"],
        }),
        updateTermin: builder.mutation({
            query: ({data, id}) => ({
                url: "termin/" + id,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Termini"],
        }),
        createTermin: builder.mutation({
            query: (data) => ({
                url: "termin",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Termini"],
        }),
        deleteTermin: builder.mutation({
            query: (id) => ({
                url: "termin/" + id,
                method: "DELETE",
            }),
            invalidatesTags: ["Termini"],
        }),
    }),
});

export const { 
    useGetTerminiQuery,
    useGetTerminByIdQuery,
    useUpdateTerminMutation,
    useCreateTerminMutation,
    useDeleteTerminMutation
} = terminApi;

export default terminApi;