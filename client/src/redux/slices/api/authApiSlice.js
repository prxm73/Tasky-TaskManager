import { apiSlice } from "../apiSlice"

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: "/api/users/login",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        register: builder.mutation({
            query: (data) => ({
                url: "/api/users/register",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/api/users/logout",
                method: "POST",
            }),
            invalidatesTags: ["User"],
        }),
        updateProfile: builder.mutation({
            query: (data) => ({
                url: "/api/users/profile",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
    })
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useUpdateProfileMutation,
} = authApiSlice

JSON.parse(localStorage.getItem("userInfo"))