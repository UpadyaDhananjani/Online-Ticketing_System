import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  error: "",
  selectedTicket: {},
  replyMsg: "",
  replyTicketError: "",
};

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    // Add your reducers here
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setSelectedTicket(state, action) {
      state.selectedTicket = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setReplyMsg(state, action) {
      state.replyMsg = action.payload;
    },
    setReplyTicketError(state, action) {
      state.replyTicketError = action.payload;
    },
    // ...other reducers as needed
  },
});

export const {
  setLoading,
  setSelectedTicket,
  setError,
  setReplyMsg,
  setReplyTicketError,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;