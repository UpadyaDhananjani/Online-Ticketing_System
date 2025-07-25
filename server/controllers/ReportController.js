import PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import Ticket from '../models/ticketModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

export const generateReportChartImage = async (req, res) => {
    try {
        // Get ticket summary
        const openCount = await Ticket.countDocuments({ status: 'open' });
        const inProgressCount = await Ticket.countDocuments({ status: 'in progress' });
        const resolvedCount = await Ticket.countDocuments({ status: 'resolved' });

        const width = 600; // px
        const height = 400; // px
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

// Download a PDF report with summary table and chart image
export const downloadReportPdf = async (req, res) => {
  try {
    // 1. Gather all data and generate chart buffer BEFORE starting PDF stream
    const openCount = await Ticket.countDocuments({ status: 'open' });
    const inProgressCount = await Ticket.countDocuments({ status: 'in progress' });
    const resolvedCount = await Ticket.countDocuments({ status: 'resolved' });
    const total = openCount + inProgressCount + resolvedCount;

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

    // 2. Now start the PDF stream
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="ticket_report.pdf"');
    doc.pipe(res);

    // 3. Build your PDF (no async code here!)
    // ... your PDF content here ...
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

    // Centered "Status Chart" title
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#222')
       .text('Status Chart', { align: 'center', underline: true, width: 300, align: 'justify' });
    doc.moveDown(0.5);

    // Center the chart image
    const chartWidth = 300; // or 350, but not 400
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const chartX = doc.page.margins.left + (pageWidth - chartWidth) / 2;
    doc.image(chartBuffer, chartX, doc.y, { width: chartWidth });

    doc.moveDown(2);

    doc.fontSize(10).fillColor('gray')
      .text('Confidential - For internal use only', 40, 780, { align: 'center', width: 515 });

    doc.end();
  } catch (err) {
    // Only send error if headers not sent yet
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF report.' });
    } else {
      console.error('PDF generation error after stream started:', err);
    }
  }
};

// 1. Staff/Assignee Performance Table
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
                { $lt: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] } // Overdue if open > 7 days
              ] },
              1, 0
            ]
          }
        }
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'assignee'
      }},
      { $unwind: '$assignee' },
      { $project: {
        assigneeName: '$assignee.name',
        ticketsAssigned: 1,
        ticketsResolved: 1,
        avgResolutionTime: 1,
        ticketsOverdue: 1
      }}
    ];
    const stats = await Ticket.aggregate(pipeline);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Tickets by Assigned Unit/Team
export const getTicketsByUnit = async (req, res) => {
  try {
    const pipeline = [
      { $group: {
        _id: '$assignedUnit',
        tickets: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
      }},
      { $project: {
        unit: '$_id',
        tickets: 1,
        resolved: 1,
        _id: 0
      }}
    ];
    const data = await Ticket.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Average Resolution Time (by month)
export const getAvgResolutionTime = async (req, res) => {
  try {
    const pipeline = [
      { $match: { status: 'resolved' } },
      { $project: {
        month: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
        resolutionTime: { $subtract: ["$updatedAt", "$createdAt"] }
      }},
      { $group: {
        _id: '$month',
        avgResolutionTime: { $avg: '$resolutionTime' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ];
    const data = await Ticket.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Time-based Activity Logs / History Table
export const getTicketActivityLogs = async (req, res) => {
  try {
    // Flatten all ticket messages as activity logs
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

// Status Distribution
export const getTicketStatusDistribution = async (req, res) => {
  try {
    const pipeline = [
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }},
      { $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }}
    ];
    const data = await Ticket.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Type Distribution
export const getTicketTypeDistribution = async (req, res) => {
  try {
    const pipeline = [
      { $group: {
        _id: '$type',
        count: { $sum: 1 }
      }},
      { $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }}
    ];
    const data = await Ticket.aggregate(pipeline);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};