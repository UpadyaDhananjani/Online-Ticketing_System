import React, { useState, useEffect } from "react";
import { Modal, Button, Card, Spinner } from "react-bootstrap";
import { toast } from 'react-toastify';
import { updateTicketPriority } from '../api/ticketApi';

function EscalatePriorityModal({ show, handleClose, ticketId, currentPriority, onPriorityUpdated }) {
  const [selectedPriority, setSelectedPriority] = useState(currentPriority);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset selected priority when the modal is opened or currentPriority changes
    setSelectedPriority(currentPriority);
  }, [show, currentPriority]);

  const priorityOptions = [
    {
      level: 'Low',
      description: 'Non-urgent issues, can wait 24-48 hours',
      responseTime: '4-8h',
      variant: 'success',
    },
    {
      level: 'Medium',
      description: 'Standard business issues, resolve within business day',
      responseTime: '2-4h',
      variant: 'warning',
    },
    {
      level: 'High',
      description: 'Urgent issues affecting productivity',
      responseTime: '30m-1h',
      variant: 'danger',
    },
    {
      level: 'Critical',
      description: 'System down, immediate attention required',
      responseTime: '15m',
      variant: 'dark',
    },
  ];

  const handleUpdate = async () => {
    if (!selectedPriority || selectedPriority === currentPriority) {
      toast.info("Please select a new priority level.");
      return;
    }

    setLoading(true);
    try {
      await updateTicketPriority(ticketId, selectedPriority);
      toast.success(`Ticket priority updated to ${selectedPriority}.`);
      if (onPriorityUpdated) {
        onPriorityUpdated();
      }
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update ticket priority.");
    } finally {
      setLoading(false);
    }
  };

  const getCardVariant = (priority) => {
    if (priority === selectedPriority) {
      return 'primary';
    }
    return 'light';
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Ticket Priority</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted">Updating priority for ticket: **{ticketId}**</p>
        <p>Select new priority level:</p>
        {priorityOptions.map((option) => (
          <Card
            key={option.level}
            className={`mb-2 cursor-pointer ${selectedPriority === option.level ? 'border-primary border-2' : ''}`}
            onClick={() => setSelectedPriority(option.level)}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">{option.level} Priority</h6>
                  <small className="text-muted">{option.description}</small>
                </div>
                <div>
                  <Button variant={option.variant} size="sm" disabled>
                    {option.responseTime}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdate} disabled={loading}>
          {loading ? (
            <Spinner animation="border" size="sm" className="me-2" />
          ) : (
            'Update Priority'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EscalatePriorityModal;