import { configureStore } from "@reduxjs/toolkit";
// Import your ticket slice reducer (adjust the path as needed)
import ticketsReducer from "./ticket-list/ticketsSlice";

const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    // Add other reducers here if needed
  },
});

export default store;