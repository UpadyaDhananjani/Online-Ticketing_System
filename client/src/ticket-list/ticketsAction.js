// // client/src/ticket-list/ticketsAction.js
// import { createAsyncThunk } from '@reduxjs/toolkit';

// export const fetchSingleTicket = createAsyncThunk(
//   'tickets/fetchSingleTicket',
//   async (id) => {
//     const res = await fetch(`/api/tickets/${id}`);
//     if (!res.ok) throw new Error('Failed to fetch ticket');
//     return res.json();
//   }
// );