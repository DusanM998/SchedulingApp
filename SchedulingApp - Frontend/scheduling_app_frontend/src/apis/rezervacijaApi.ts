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
        updateRezervacijaHeader: builder.mutation({
            query: (rezevacijaDetalji) => ({
                url: "order/" + rezevacijaDetalji.rezervacijaHeaderId,
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
    useUpdateRezervacijaHeaderMutation

} = rezervacijaApi;

export default rezervacijaApi;