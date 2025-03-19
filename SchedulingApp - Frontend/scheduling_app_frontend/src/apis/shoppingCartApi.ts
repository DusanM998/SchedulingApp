import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const shoppingCartApi = createApi({
    reducerPath: "korpa",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://localhost:7210/api/"
    }),
    tagTypes: ["ShoppingCart"],
    endpoints: (builder) => ({
        getShoppingCartById: builder.query({
            query: (userId) => ({
                url: `korpa`,
                params: {
                    userId: userId
                }
            }),
            providesTags: ["ShoppingCart"],
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
            invalidatesTags: ["ShoppingCart"],
        }),
    }),
});

export const { useGetShoppingCartByIdQuery, useUpdateShoppingCartMutation } = shoppingCartApi;
export default shoppingCartApi;