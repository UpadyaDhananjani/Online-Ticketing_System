import Ticket from '../models/ticketModel.js';

export const getTicketStats = async (req, res) => {
    try {
        // Get open tickets count
        const openCount = await Ticket.countDocuments({ status: 'Open' });

        // Get in-progress tickets count
        const inProgressCount = await Ticket.countDocuments({ status: 'In Progress' });

        // Get resolved tickets count (for today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedCount = await Ticket.countDocuments({
            status: 'Resolved',
            updatedAt: { $gte: today }
        });

        // Calculate average response time (in hours)
        const tickets = await Ticket.find({ status: 'Resolved' });
        let totalResponseTime = 0;
        let ticketsWithResponse = 0;

        tickets.forEach(ticket => {
            if (ticket.createdAt && ticket.updatedAt) {
                const responseTime = ticket.updatedAt - ticket.createdAt;
                totalResponseTime += responseTime;
                ticketsWithResponse++;
            }
        });

        const avgResponseTime = ticketsWithResponse > 0 
            ? Math.round((totalResponseTime / ticketsWithResponse) / (1000 * 60 * 60)) // Convert to hours
            : 0;

        res.json({
            success: true,
            openCount,
            inProgressCount,
            resolvedCount,
            avgResponseTime
        });
    } catch (error) {
        console.error('Error getting ticket stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket statistics',
            error: error.message
        });
    }
};
