//UnitUserModal.jsx


import React, { useEffect, useState } from "react";
import { Modal, Spinner, Alert, ListGroup, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { deleteAdminUser } from "../api/ticketApi";


const UnitUsersModal = ({ show, unit, onHide, token, userData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (!show || !unit) {
      setUsers([]);
      setError("No unit selected.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    setUsers([]);
    let url = "";
    if (userData?.role === "admin") {
      if (unit) {
        url = `/api/admin/users?unit=${encodeURIComponent(unit)}`;
      } else {
        setError("No unit selected.");
        setLoading(false);
        return;
      }
    } else {
      url = `/api/user/by-unit/${encodeURIComponent(unit)}`;
    }
    fetch(url, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setUsers(Array.isArray(data.users) ? data.users : []);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch users");
      })
      .finally(() => setLoading(false));
  }, [show, unit, token, userData]);

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeletingId(userToDelete);
    setError("");
    try {
      const res = await deleteAdminUser(userToDelete);
      if (!res.success) throw new Error(res.message || "Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete));
      setShowConfirmModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Users in {unit}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 80 }}>
            <Spinner animation="border" />
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && users.length === 0 && (
          <div className="text-center text-muted">No users found in this unit.</div>
        )}
        {!loading && !error && users.length > 0 && (
          <ListGroup>
            {users.map((user) => (
              <ListGroup.Item key={user._id}>
                <div className="fw-bold">{user.name}</div>
                <div className="text-muted" style={{ fontSize: 14 }}>{user.email}</div>
                {userData?.role === 'admin' && (
                  <OverlayTrigger placement="left" overlay={<Tooltip>Delete user</Tooltip>}>
                    <span>
                      <Button
                        variant="danger"
                        size="sm"
                        style={{ opacity: 0.85, marginLeft: 8 }}
                        disabled={deletingId === user._id}
                        onClick={() => handleDeleteClick(user._id)}
                      >
                        {deletingId === user._id ? <Spinner size="sm" animation="border" /> : <BsTrash />}
                      </Button>
                    </span>
                  </OverlayTrigger>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal show={showConfirmModal} onHide={handleCancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this user? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete} disabled={deletingId !== null}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deletingId !== null}>
            {deletingId !== null ? <Spinner size="sm" animation="border" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default UnitUsersModal;