import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getTicketPriorityDistribution } from "../api/ticketApi";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PriorityChart = () => {
  const [priorityData, setPriorityData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPriorityData();
  }, []);

  const fetchPriorityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getTicketPriorityDistribution();
      console.log("Priority distribution data:", data);
      
      // Define priority order and colors
      const priorityOrder = ['Low', 'Medium', 'High', 'Critical'];
      const priorityColors = {
        'Low': '#10b981',      // Green
        'Medium': '#f59e0b',   // Yellow
        'High': '#ef4444',     // Red
        'Critical': '#7c2d12'  // Dark Red
      };
      
      // Create ordered data arrays
      const orderedLabels = [];
      const orderedData = [];
      const orderedColors = [];
      
      priorityOrder.forEach(priority => {
        const found = data.find(item => item.priority === priority);
        if (found) {
          orderedLabels.push(priority);
          orderedData.push(found.count);
          orderedColors.push(priorityColors[priority]);
        }
      });
      
      // Add any priorities not in the standard order
      data.forEach(item => {
        if (!priorityOrder.includes(item.priority)) {
          orderedLabels.push(item.priority);
          orderedData.push(item.count);
          orderedColors.push('#6b7280'); // Gray for unknown priorities
        }
      });

      setPriorityData({
        labels: orderedLabels,
        datasets: [
          {
            label: "Number of Tickets",
            data: orderedData,
            backgroundColor: orderedColors,
            borderColor: orderedColors.map(color => color),
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      });
    } catch (err) {
      console.error("Error fetching priority distribution:", err);
      setError("Failed to load priority distribution data");
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since colors are self-explanatory
      },
      title: {
        display: true,
        text: 'Ticket Priority Distribution',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.y} tickets (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false,
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    hover: {
      animationDuration: 200
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading priority data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-500 font-medium">{error}</p>
          <button 
            onClick={fetchPriorityData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <Bar data={priorityData} options={options} />
    </div>
  );
};

export default PriorityChart;


