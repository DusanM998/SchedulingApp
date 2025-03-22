import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const placanjeApi = createApi({
    reducerPath: "placanjeApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:7210/api/"
    }),
    endpoints: (builder) => ({
        inicirajPlacanje: builder.mutation({
            query: (userId) => ({
                url: "placanje",
                method: "POST",
                params: {
                    userId: userId,
                }
            }),
        }),
    }),
});

export const { useInicirajPlacanjeMutation } = placanjeApi;
export default placanjeApi;