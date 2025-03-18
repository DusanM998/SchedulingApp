import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const shoppingCartApi = createApi({
    reducerPath: "korpa",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:7210/api/"
    }),
    tagTypes: ["Korpe"],
    endpoints: (builder) => ({
        getShoppingCartById: builder.query({
            query: (userId) => ({
                url: `korpa`,
                params: {
                    userId: userId
                }
            }),
            providesTags: ["Korpe"],
        }),
        updateShoppingCart: builder.mutation({
            query: ({ sportskiObjekatId, kolicina, userId }) => ({
                url: "korpa",
                method: "POST",
                params: {
                    sportskiObjekatId,
                    kolicina,
                    userId,
                },
            }),
            invalidatesTags: ["Korpe"],
        }),
    }),
});

export const { useGetShoppingCartByIdQuery, useUpdateShoppingCartMutation } = shoppingCartApi;
export default shoppingCartApi;