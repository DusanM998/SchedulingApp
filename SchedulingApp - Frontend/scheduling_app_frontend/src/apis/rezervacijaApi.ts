import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rezervacijaApi = createApi({
    reducerPath: "rezervacija",
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

    })
})

export const {
    useKreirajRezervacijuMutation
} = rezervacijaApi;

export default rezervacijaApi;