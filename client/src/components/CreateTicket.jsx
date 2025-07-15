import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import axios from 'axios';


const UNIT_OPTIONS = [
  "System and Network Administration",
  "Asyhub Unit",
  "Statistics Unit",
  "Audit Unit",
  "Helpdesk Unit",
  "Functional Unit"
];

function CreateTicket() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('incident');
  const [assignedUnit, setAssignedUnit] = useState(UNIT_OPTIONS[0]);
  const [images, setImages] = useState([]);
  const [unitUsers, setUnitUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!assignedUnit) {
      setUnitUsers([]);
      setAssignedTo("");
      return;
    }
    axios.get(`/api/user/by-unit/${encodeURIComponent(assignedUnit)}`, { withCredentials: true })
      .then(res => {
        setUnitUsers(res.data.users || []);
        setAssignedTo(""); // Reset assigned person when unit changes
      })
      .catch(() => setUnitUsers([]));
  }, [assignedUnit]);

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('assignedUnit', assignedUnit);
    formData.append('assignedTo', assignedTo);
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append('attachments', images[i]);
      }
    }

    try {
      const res = await axios.post('/api/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (res.status === 201) {
        toast.success("Ticket created successfully!");
        navigate('/tickets'); // Navigate to the ticket list page
      } else {
        toast.error(res.data.error || "Failed to create ticket.");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error(error.response?.data?.error || "An error occurred while creating ticket.");
    }

    setSubject('');
    setDescription('');
    setType('incident');
    setAssignedUnit(UNIT_OPTIONS[0]);
    setImages([]);
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', background: '#F0F8FF' }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow" style={{ borderRadius: 16, maxWidth: 600 }}>
            <Card.Body style={{ padding: '2rem', background: 'white' }}>
              <Card.Title className="mb-4 text-center" style={{ fontWeight: 600, fontSize: 24 }}>
                Create Ticket
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formSubject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formType">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={type} onChange={e => setType(e.target.value)}>
                    <option value="incident">Incident</option>
                    <option value="bug">Bug</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="request">Request</option>
                    <option value="service">Service</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formAssignedUnit">
                  <Form.Label>Assign to Unit</Form.Label>
                  <Form.Select value={assignedUnit} onChange={e => setAssignedUnit(e.target.value)}>
                    {UNIT_OPTIONS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formAssignedTo">
                  <Form.Label>Assign to Person</Form.Label>
                  <Form.Select
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    required={unitUsers.length > 0}
                  >
                    <option value="">Select a person</option>
                    {unitUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4" controlId="formImage">
                  <Form.Label>Image (jpg, jpeg, png)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    onChange={handleImageChange}
                  />
                </Form.Group>
                {images && images.length > 0 && (
                  <div className="mt-2 text-success">
                    <i className="bi bi-image me-1"></i>
                    {images.length} files selected
                  </div>
                )}
                <div className="d-grid">
                  <Button variant="primary" type="submit" size="lg">
                    Create Ticket
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CreateTicket;
