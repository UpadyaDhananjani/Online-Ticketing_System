import PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

// Generate chart image (doughnut) of ticket status distribution
export const generateReportChartImage = async (req, res) => {
  try {
    const openCount = await Ticket.countDocuments({ status: 'open' });
    const inProgressCount = await Ticket.countDocuments({ status: 'in progress' });
    const resolvedCount = await Ticket.countDocuments({ status: 'resolved' });

    const width = 600;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
    const configuration = {
      type: 'doughnut',
      data: {
        labels: ['Open', 'In Progress', 'Resolved'],
        datasets: [{
          data: [openCount, inProgressCount, resolvedCount],
          backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0'],
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Ticket Status Distribution' }
        }
      }
    };
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    res.set('Content-Type', 'image/png');
    res.send(image);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate chart image.' });
  }
};

// Download PDF report with summary table and embedded chart image
export const downloadReportPdf = async (req, res) => {
  try {
    // Gather ticket counts
    const openCount = await Ticket.countDocuments({ status: 'open' });
    const inProgressCount = await Ticket.countDocuments({ status: 'in progress' });
    const resolvedCount = await Ticket.countDocuments({ status: 'resolved' });
    const total = openCount + inProgressCount + resolvedCount;

    // Chart config and buffer generation
    const width = 600, height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
    const configuration = {
      type: 'doughnut',
      data: {
        labels: ['Open', 'In Progress', 'Resolved'],
        datasets: [{
          data: [openCount, inProgressCount, resolvedCount],
          backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0'],
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Ticket Status Distribution' }
        }
      }
    };
    const chartBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Create PDF document and pipe to the response
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="ticket_report.pdf"');
    doc.pipe(res);

    // Add PDF contents
    doc.fontSize(24).font('Helvetica-Bold').text('Ticket Report', 110, 40, { align: 'left' });
    doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, 110, 70, { align: 'left' });
    doc.moveDown(2);
    doc.moveTo(40, 100).lineTo(555, 100).stroke('#007bff');
    doc.moveDown(2);

    doc.fontSize(16).font('Helvetica-Bold').text('Summary Table', { underline: true });
    doc.moveDown(0.5);
    const tableTop = doc.y + 10;
    const itemX = 60;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Status', itemX, tableTop);
    doc.text('Count', itemX + 200, tableTop);
    doc.text('Percent', itemX + 300, tableTop);

    doc.font('Helvetica');
    const rowHeight = 20;
    let y = tableTop + rowHeight;
    const rows = [
      ['Open', openCount, ((openCount / total) * 100).toFixed(1) + '%'],
      ['In Progress', inProgressCount, ((inProgressCount / total) * 100).toFixed(1) + '%'],
      ['Resolved', resolvedCount, ((resolvedCount / total) * 100).toFixed(1) + '%'],
      ['Total', total, '100%']
    ];
    rows.forEach(row => {
      doc.text(row[0], itemX, y);
      doc.text(row[1].toString(), itemX + 200, y);
      doc.text(row[2], itemX + 300, y);
      y += rowHeight;
    });

    doc.moveDown(2);

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#222')
       .text('Status Chart', { align: 'center', underline: true, width: 300, align: 'justify' });
    doc.moveDown(0.5);

    const chartWidth = 300;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const chartX = doc.page.margins.left + (pageWidth - chartWidth) / 2;
    doc.image(chartBuffer, chartX, doc.y, { width: chartWidth });

    doc.moveDown(2);

    doc.fontSize(10).fillColor('gray')
       .text('Confidential - For internal use only', 40, 780, { align: 'center', width: 515 });

    doc.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF report.' });
    } else {
      console.error('PDF generation error after stream started:', err);
    }
  }
};

// Staff/Assignee Performance (aggregated stats)
export const getAssigneePerformance = async (req, res) => {
  try {
    const pipeline = [
      { $match: { assignedTo: { $ne: null } } },
      { $group: {
          _id: '$assignedTo',
          ticketsAssigned: { $sum: 1 },
          ticketsResolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'resolved'] },
                { $subtract: ['$updatedAt', '$createdAt'] },
                null
              ]
            }
          },
          ticketsOverdue: {
            $sum: {
              $cond: [
                { $and: [
                    { $eq: ['$status', 'open'] },
                    { $lt: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }
                  ] 
                },
                1, 0
              ]
            }
          }
        }
      },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'assignee'
        }
      },
      { $unwind: '$assignee' },
      { $project: {
          assigneeName: '$assignee.name',
          ticketsAssigned: 1,
          ticketsResolved: 1,
          avgResolutionTime: 1,
          ticketsOverdue: 1
        }
      }
    ];
    const stats = await Ticket.aggregate(pipeline);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tickets by Assigned Unit/Team
export const getTicketsByUnit = async (req, res) => {
  try {
    // Mock data for tickets by unit/team
    const mockData = [
      { unit: "Hardware Support Team", tickets: 45, resolved: 38 },
      { unit: "System and Network Administration", tickets: 32, resolved: 25 },
      { unit: "Helpdesk Unit", tickets: 28, resolved: 24 },
      { unit: "Software Development", tickets: 18, resolved: 15 },
      { unit: "Database Administration", tickets: 12, resolved: 10 }
    ];
    
    console.log("Mock tickets by unit data returned:", mockData.length);
    res.json(mockData);
  } catch (err) {
    console.error("Error returning mock tickets by unit:", err);
    res.status(500).json({ error: err.message });
  }
};

// Average Resolution Time by Month
export const getAvgResolutionTime = async (req, res) => {
  try {
    const pipeline = [
      { $match: { status: 'resolved' } },
      { $project: {
          month: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
          resolutionTime: { $subtract: ["$updatedAt", "$createdAt"] }
        }
      },
      { $group: {
          _id: '$month',
          avgResolutionTime: { $avg: '$resolutionTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
    const data = await Ticket.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Time-based Activity Logs / History Table
export const getTicketActivityLogs = async (req, res) => {
  try {
    const tickets = await Ticket.find({}, 'messages').populate('messages.author', 'name');
    const logs = [];
    tickets.forEach(ticket => {
      ticket.messages.forEach(msg => {
        logs.push({
          ticketId: ticket._id,
          action: msg.content.slice(0, 30) + (msg.content.length > 30 ? '...' : ''),
          by: msg.author?.name || 'Unknown',
          date: msg.date,
          comments: msg.content
        });
      });
    });
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tickets by Category (Type) Distribution
export const getTicketTypeDistribution = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const typeCounts = {};
    tickets.forEach(ticket => {
      const key = ticket.category || ticket.type || 'Unknown';
      typeCounts[key] = (typeCounts[key] || 0) + 1;
    });
    res.json(Object.entries(typeCounts).map(([type, count]) => ({ type, count })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Priority Distribution (Status was misnamed here, corrected to priority)
export const getTicketPriorityDistribution = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const priorityCounts = {};
    tickets.forEach(ticket => {
      priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;
    });
    res.json(Object.entries(priorityCounts).map(([priority, count]) => ({ priority, count })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Recent Tickets for dashboard table


// Status distribution for chart
export const getTicketStatusDistribution = async (req, res) => {
  try {
    const statusData = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);
    res.json(statusData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


