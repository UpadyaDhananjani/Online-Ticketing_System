import React, { useEffect, useState } from "react";
import { Modal, Spinner, Alert, ListGroup, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";

const UnitUsersModal = ({ show, unit, onHide, token, userData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!show || !unit) return;
    setLoading(true);
    setError("");
    setUsers([]);
    let url = "";
    if (userData?.role === "admin") {
      url = `/api/admin/users?unit=${encodeURIComponent(unit)}`;
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
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
            {Array.isArray(users) && users.map((user) => (
              <ListGroup.Item key={user._id} className="d-flex justify-content-between align-items-center" style={{ position: 'relative' }}>
                <div>
                  <div className="fw-bold">{user.name}</div>
                  <div className="text-muted" style={{ fontSize: 14 }}>{user.email}</div>
                </div>
                {userData?.role === 'admin' && (
                  <OverlayTrigger placement="left" overlay={<Tooltip>Delete user</Tooltip>}>
                    <span>
                      <Button
                        variant="danger"
                        size="sm"
                        style={{ opacity: 0.85, marginLeft: 8 }}
                        disabled={deletingId === user._id}
                        onClick={() => handleDelete(user._id)}
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
    </Modal>
  );
};

export default UnitUsersModal; 