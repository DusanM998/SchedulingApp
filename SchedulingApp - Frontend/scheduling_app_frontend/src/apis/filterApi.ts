import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const filterApi = createApi({
    reducerPath: "filterApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:7210/api/",
        prepareHeaders: (headers: Headers, api) => {
            const token = localStorage.getItem("token");
            token && headers.append("Authorization", "Bearer " + token);
        },
    }),
    tagTypes: ["Filter"],
    endpoints: (builder) => ({
        getRecords: builder.query({
            query: ({ lokacija, datum, vremePocetka, vremeZavrsetka, pageNumber, pageSize }) => ({
                url: "rezervacija",
                params: {
                    ...(lokacija && { lokacija }),
                    ...(datum && { datum }),
                    ...(vremePocetka && { vremePocetka }),
                    ...(vremeZavrsetka && { vremeZavrsetka }),
                    ...(pageNumber && (pageNumber)),
                    ...(pageSize && (pageSize)),
                },
            }),
            transformResponse(apiResponse: { result: any }, meta: any) {
                return {
                    apiResponse,
                    totalRecords: meta.response.headers.get("X-Pagination"),
                }
            },
            providesTags: ["Filter"]
        }),
    })
})

export const {
    useGetRecordsQuery
} = filterApi;

export default filterApi;