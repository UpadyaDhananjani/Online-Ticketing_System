import { axiosInstance } from './ticketApi';
import { saveAs } from 'file-saver';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const downloadAdminReport = async () => {
  try {
    // Add headers to ensure proper authorization and content type
    const response = await axiosInstance.get('/admin/tickets/report/download', {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Get the filename from the content-disposition header or use a default name
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
      : 'report.pdf';

    // Create a blob from the response data
    const blob = new Blob([response.data], { type: 'application/pdf' });
    
    // Use file-saver to save the file
    saveAs(blob, filename);
    
    return true;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};
