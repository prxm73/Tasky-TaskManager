import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8800";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Task", "User", "Notification"],
  endpoints: (builder) => ({
    // Notification endpoints
    getNotifications: builder.query({
      query: () => "/notifications",
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/read/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
    createSystemNotification: builder.mutation({
      query: (notificationData) => ({
        url: "/notifications/system",
        method: "POST",
        body: notificationData,
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useCreateSystemNotificationMutation,
} = apiSlice;
