import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

function CreateTicket({ token, onCreated }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('incident');
  const [image, setImage] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('type', type);
    if (image) formData.append('image', image);

    const res = await fetch('/api/tickets', {
      method: 'POST',
      body: formData
    });
    if (res.ok && onCreated) onCreated();
    setSubject('');
    setDescription('');
    setType('incident');
    setImage(null);
  };

  return (
    <Container
      className="d-flex  justify-content-center align-items-center"
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
                <Form.Group className="mb-4" controlId="formImage">
                  <Form.Label>Image (jpg, jpeg, png)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={e => setImage(e.target.files[0])}
                  />
                </Form.Group>
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
