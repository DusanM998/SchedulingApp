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
        getSportskiObjektiWithPagination: builder.query({
            query: ({pageNumber, pageSize}) => ({
                url: "sportskiObjektiWithPagination",
                params: {
                    ...(pageNumber && { pageNumber }),
                    ...(pageSize && {pageSize})
                },
            }),
            transformResponse(apiResponse: { result: any }, meta: any) {
                return {
                    apiResponse,
                    totalRecords: meta.response.headers.get("X-Pagination"),
                }
            },
        }),
        getSportskiObjekatById: builder.query({
            query: (sportskiObjekatId) => ({
                url:`sportskiObjektiApi/${sportskiObjekatId}`,
            }),
            providesTags: ["SportskiObjekti"],
        }),
        updateSportskiObjekat: builder.mutation({
            query: ({data, sportskiObjekatId}) => ({
                url: "sportskiObjektiApi/" + sportskiObjekatId,
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
    useDeleteSportskiObjekatMutation,
    useGetSportskiObjektiWithPaginationQuery
} = sportskiObjekatApi;

export default sportskiObjekatApi;