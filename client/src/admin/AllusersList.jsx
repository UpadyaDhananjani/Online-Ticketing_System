import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Table, Button, Form, Spinner, Alert } from 'react-bootstrap';
import '../styles/custom.css';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AllUsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [units, setUnits] = useState([]);
  const { userData, backendUrl } = useContext(AppContent);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userData) {
        setLoading(false);
        setUsers([]);
        setFilteredUsers([]);
        return;
      }

      setLoading(true);
      setError("");
      
      // Add debug logging in the fetchUsers function
      try {
        console.log('Starting to fetch users...');
        console.log('Backend URL:', backendUrl);
        console.log('User Data:', userData);
        console.log('Token from localStorage:', localStorage.getItem('token'));
        
        const response = await axios.get(`${backendUrl}/api/admin/users`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Raw response:', response);
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        if (Array.isArray(response.data)) {
          console.log('Setting users array, length:', response.data.length);
          setUsers(response.data);
          setFilteredUsers(response.data);
        } else {
          console.log('Response data is not an array:', response.data);
          // If the data is wrapped in an object
          const usersArray = response.data.users || response.data.data || [];
          console.log('Extracted users array:', usersArray);
          setUsers(usersArray);
          setFilteredUsers(usersArray);
          
          // Extract unique units from users
          const uniqueUnits = [...new Set(usersArray.map(user => user.unit).filter(Boolean))];
          setUnits(uniqueUnits);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch users');
        toast.error('Failed to fetch users list');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userData, backendUrl]);

  const handleFilterChange = (selectedUnit) => {
    setFilterUnit(selectedUnit);
    if (!selectedUnit) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => user.unit === selectedUnit);
      setFilteredUsers(filtered);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/admin/users/${userId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('User deleted successfully');
        // Remove user from state
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setFilteredUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      } else {
        toast.error(response.data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          {error}
          <Button variant="outline-danger" size="sm" className="ms-3" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <div className="bg-white rounded shadow-sm p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            <i className="bi bi-people me-2"></i>
            All Users
          </h4>
        </div>

        <div className="mb-3">
          <Form.Group>
            <Form.Label className="fw-semibold">Filter by Unit</Form.Label>
            <div className="d-flex gap-2">
              <Form.Select 
                value={filterUnit} 
                onChange={(e) => handleFilterChange(e.target.value)}
                className="form-select-sm w-auto"
              >
                <option value="">All Units</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </Form.Select>
              {filterUnit && (
                <Button 
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleFilterChange("")}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </Form.Group>
        </div>
          
        <div className="table-responsive">
          {filteredUsers.length > 0 ? (
            <Table hover className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold">Name</th>
                  <th className="fw-semibold">Email</th>
                  <th className="fw-semibold">Unit</th>
                  <th className="fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="fw-semibold">{user.name}</div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.unit ? (
                        <span className="badge bg-info-subtle text-info rounded-pill px-2">
                          {user.unit}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteUser(user._id)}
                        className="rounded-pill px-3"
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox fs-4 d-block mb-2"></i>
              No users found
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AllUsersList;