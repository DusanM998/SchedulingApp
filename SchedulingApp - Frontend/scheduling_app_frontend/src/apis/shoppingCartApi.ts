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
            query: ({ sportskiObjekatId, brojUcesnika, userId }) => ({
                url: "korpa",
                method: "POST",
                params: {
                    sportskiObjekatId,
                    brojUcesnika,
                    userId,
                },
            }),
            invalidatesTags: ["ShoppingCart"],
        }),
        removeShoppingCartItem: builder.mutation({
            query: ({ sportskiObjekatId, userId }) => ({
                url: "korpa/ukloniStavku",
                method: "POST",
                params: { sportskiObjekatId, userId },
              }),
              invalidatesTags: ["ShoppingCart"],
        }),
        updateShoppingCartWithTermini: builder.mutation({
            query: ({ userId, sportskiObjekatId, kolicina, terminIds }) => ({
                url: `korpa/dodajIliAzurirajKorpuSaTerminima?userId=${userId}&sportskiObjekatId=${sportskiObjekatId}&brojUcesnika=${kolicina}`,
                method: "POST",
                body: terminIds,
            }),
            invalidatesTags: ["ShoppingCart"],
        }),
    }),
});

export const { useGetShoppingCartByIdQuery,
    useUpdateShoppingCartMutation,
    useUpdateShoppingCartWithTerminiMutation,
    useRemoveShoppingCartItemMutation
} = shoppingCartApi;
export default shoppingCartApi;