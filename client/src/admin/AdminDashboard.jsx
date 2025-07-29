// client/src/admin/AdminDashboard.jsx
// (Admin Dashboard)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AllTickets from "../Data/AllTickets.jsx";
import TicketReply from "./adminTicketReply.jsx"; // Path confirmed from previous steps

function AdminDashboard({ token }) {
    const { statusFilter: urlStatusFilter, id: ticketIdFromUrl } = useParams(); // Get statusFilter and ticketId from URL
    const navigate = useNavigate();

    // Normalize the URL parameter for filtering AllTickets
    const normalizedUrlStatusFilter = urlStatusFilter ?
        urlStatusFilter.replace('-', ' ').toLowerCase() :
        "all";

    // For display purposes in the AllTickets component header/dropdown
    const displayStatusFilter = normalizedUrlStatusFilter === "all" ? "All" : normalizedUrlStatusFilter;

    console.log("AdminDashboard: urlStatusFilter from URL:", urlStatusFilter);
    console.log("AdminDashboard: ticketIdFromUrl from URL:", ticketIdFromUrl);
    console.log("AdminDashboard: Passing initialStatusFilter to AllTickets (for logic):", normalizedUrlStatusFilter);
    console.log("AdminDashboard: Passing displayStatusFilter to AllTickets (for UI):", displayStatusFilter);

    // We no longer need selectedTicket state in AdminDashboard for TicketReply
    // const [selectedTicket, setSelectedTicket] = useState(null); // REMOVED
    const [refresh, setRefresh] = useState(0); // Still used for AllTickets refresh

    // No need to reset selectedTicket here anymore, as TicketReply will fetch its own data
    // useEffect(() => {
    //     setSelectedTicket(null);
    // }, [normalizedUrlStatusFilter]);

    // handleTicketUpdate is still relevant if AllTickets needs to refresh after a reply
    const handleTicketUpdate = () => {
        // This function will now just trigger a refresh of the AllTickets list
        // after a ticket has been updated (e.g., replied to, resolved).
        setRefresh((r) => r + 1);
        // We don't need to update selectedTicket here anymore as TicketReply manages its own state
    };

    const handleSelectTicket = (ticket) => {
        console.log("AdminDashboard: Ticket selected via onSelect (navigating to reply page):", ticket);
        // Navigate to the specific ticket reply page using its ID
        navigate(`/admin/tickets/${ticket._id}/reply`);
    };

    const handleBackToList = () => {
        console.log("AdminDashboard: Back to list clicked. Navigating to:", `/admin/tickets/${urlStatusFilter || 'all'}`);
        // Navigate back to the appropriate filtered list based on the original URL filter
        navigate(`/admin/tickets/${urlStatusFilter || 'all'}`);
        // Ensure the AllTickets component refreshes when returning to the list
        setRefresh((r) => r + 1);
    };

    // Determine which component to render based on whether a ticket ID is present in the URL
    // If ticketIdFromUrl exists, render TicketReply; otherwise, render AllTickets.
    return (
        <div>
            {ticketIdFromUrl ? (
                // Render TicketReply, passing the ID from the URL
                <TicketReply
                    token={token}
                    ticketId={ticketIdFromUrl} // Pass the ID from the URL
                    onBack={handleBackToList}
                    onTicketUpdate={handleTicketUpdate}
                />
            ) : (
                // Render AllTickets
                <AllTickets
                    token={token}
                    onSelect={handleSelectTicket}
                    refresh={refresh}
                    initialStatusFilter={normalizedUrlStatusFilter}
                    displayStatusFilter={displayStatusFilter}
                />
            )}
        </div>
    );
}

export default AdminDashboard;
