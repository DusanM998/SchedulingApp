import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const sportskiObjekatApi = createApi({
    reducerPath: "sportskiObjektiApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:7210/api/",
        prepareHeaders: (headers: Headers, api) => {
            const token = localStorage.getItem("token");
            token && headers.append("Authorization", "Bearer" + token);
        },
    }),
    tagTypes: ["SportskiObjekti"],
    endpoints: (builder) => ({
        getSportskiObjekti: builder.query({
            query: () => ({
                url:"sportskiObjektiApi"
            }),
            providesTags: ["SportskiObjekti"]
        }),
        getSportskiObjekatById: builder.query({
            query: (id) => ({
                url:`sportskiObjektiApi/${id}`,
            }),
            providesTags: ["SportskiObjekti"],
        }),
        updateSportskiObjekat: builder.mutation({
            query: ({data, id}) => ({
                url: "sportskiObjektiApi/" + id,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["SportskiObjekti"],
        }),
        createSportskiObjekat: builder.mutation({
            query: (data) => ({
                url: "sportskiObjektiApi",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["SportskiObjekti"],
        }),
        deleteSportskiObjekat: builder.mutation({
            query: (id) => ({
                url: "sportskiObjektiApi/" + id,
                method: "DELETE",
            }),
            invalidatesTags: ["SportskiObjekti"],
        }),
    }),
});

export const { 
    useGetSportskiObjektiQuery,
    useGetSportskiObjekatByIdQuery,
    useUpdateSportskiObjekatMutation,
    useCreateSportskiObjekatMutation,
    useDeleteSportskiObjekatMutation
} = sportskiObjekatApi;

export default sportskiObjekatApi;