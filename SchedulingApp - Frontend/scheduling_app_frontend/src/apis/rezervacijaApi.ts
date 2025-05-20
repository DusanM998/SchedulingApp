import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rezervacijaApi = createApi({
    reducerPath: "rezervacijaApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:7210/api/",
        prepareHeaders: (headers: Headers, api) => {
            const token = localStorage.getItem("token");
            token && headers.append("Authorization", "Bearer " + token);
        },
    }),
    tagTypes: ["Rezervacije"],
    endpoints: (builder) => ({
        kreirajRezervaciju: builder.mutation({
            query: (rezervacijaDetalji) => ({
                url: "rezervacija",
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: rezervacijaDetalji
            }),
            invalidatesTags: ["Rezervacije"],
        }),
        getRezervacijaDetalji: builder.query({
            query: (id) => ({
                url:`rezervacija/${id}`,
            }),
            providesTags: ["Rezervacije"],
        }),
        getSveRezervacije: builder.query({
            query: ({ userId, searchString, status, pageSize, pageNumber }) => ({
                url: "rezervacija",
                params: {
                    ...(userId && { userId }),
                    ...(searchString && { searchString }),
                    ...(status && { status }),
                    ...(pageSize && { pageSize }),
                    ...(pageNumber && { pageNumber }),
                },
            }),
            transformResponse(apiResponse: { result: any }, meta: any) {
                return {
                    apiResponse,
                    totalRecords: meta.response.headers.get("X-Pagination"),
                }
            },
            providesTags: ["Rezervacije"]
        }),
        updateRezervacijaHeader: builder.mutation({
            query: (rezevacijaDetalji) => ({
                url: "rezervacija/" + rezevacijaDetalji.rezervacijaHeaderId,
                method: "PUT",
                headers: {
                    "Content-type" : "application/json",
                },
                body: rezevacijaDetalji
            }),
            invalidatesTags: ["Rezervacije"]
        })
    })
})

export const {
    useKreirajRezervacijuMutation,
    useGetRezervacijaDetaljiQuery,
    useUpdateRezervacijaHeaderMutation,
    useGetSveRezervacijeQuery
} = rezervacijaApi;

export default rezervacijaApi;