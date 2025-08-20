import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import axios from 'axios';
import { BsCardText, BsChatDots, BsTag, BsDiagram3, BsPerson, BsImage, BsCheckCircle } from 'react-icons/bs';


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
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!assignedUnit) {
            setUnitUsers([]);
            setAssignedTo("");
            return;
        }
        axios.get(`/api/user/by-unit/${encodeURIComponent(assignedUnit)}`, { withCredentials: true })
            .then(res => {
                setUnitUsers(res.data.users || []);
                setAssignedTo("");
            })
            .catch(() => setUnitUsers([]));
    }, [assignedUnit]);

    const validate = () => {
        const newErrors = {};
        if (!subject || subject.trim().length < 5) newErrors.subject = "Subject must be at least 5 characters.";
        if (!description || description.trim().length < 10) newErrors.description = "Description must be at least 10 characters.";
        if (!type) newErrors.type = "Type is required.";
        if (!assignedUnit) newErrors.assignedUnit = "Unit is required.";
        if (unitUsers.length > 0 && !assignedTo) newErrors.assignedTo = "Please select a person to assign.";
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const file = images[i];
                const allowedTypes = [
                    'image/jpeg', 'image/png', 'image/jpg',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ];
                if (!allowedTypes.includes(file.type)) {
                    newErrors.images = "Only JPG, JPEG, PNG, PDF, DOC, DOCX files are allowed.";
                    break;
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
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
                toast.success(<span className="flex items-center gap-2"><BsCheckCircle className="text-green-500" /> Ticket created successfully!</span>);
                navigate('/tickets');
            } else {
                toast.error(res.data.error || "Failed to create ticket.");
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error(error.response?.data?.error || "An error occurred while creating ticket.");
        }
        setSubmitting(false);
    };

    return (
        <Container
            className="d-flex justify-content-center align-items-center animate-fade-in"
            style={{ minHeight: '100vh' }}
        >
            <Row className="w-100 justify-content-center">
                <Col xs={12}>
                    {/* Added 'hover-effect' class for interactive 3D lift */}
                    <Card className="shadow-lg border-0 animate-pop hover-effect" style={{ borderRadius: 20, width: '100%', animation: 'popIn 0.6s cubic-bezier(.68,-0.55,.27,1.55)' }}>
                        <Card.Body className="p-5">
                            <Card.Title className="mb-4 text-center font-bold text-2xl flex items-center justify-center gap-2">
                                <BsCardText className="text-blue-500" size={28} /> Create Ticket
                            </Card.Title>
                            <Form onSubmit={handleSubmit} className="space-y-4">
                                <Form.Group className="mb-4" controlId="formSubject">
                                    <Form.Label className="flex items-center gap-2 font-semibold">
                                        <BsCardText className="text-blue-400" /> Subject
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter subject"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        required
                                        minLength={5}
                                        className={`transition-all focus:ring-2 focus:ring-blue-300 ${errors.subject ? 'border-red-500' : ''}`}
                                    />
                                    {errors.subject && <div className="text-red-500 text-xs mt-1 animate-fade-in">{errors.subject}</div>}
                                </Form.Group>
                                <Form.Group className="mb-4" controlId="formDescription">
                                    <Form.Label className="flex items-center gap-2 font-semibold">
                                        <BsChatDots className="text-blue-400" /> Description
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={10}
                                        placeholder="Enter description"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        required
                                        minLength={10}
                                        className={`transition-all focus:ring-2 focus:ring-blue-300 ${errors.description ? 'border-red-500' : ''}`}
                                    />
                                    {errors.description && <div className="text-red-500 text-xs mt-1 animate-fade-in">{errors.description}</div>}
                                </Form.Group>
                                <Form.Group className="mb-4" controlId="formType">
                                    <Form.Label className="flex items-center gap-2 font-semibold">
                                        <BsTag className="text-blue-400" /> Type
                                    </Form.Label>
                                    <Form.Select value={type} onChange={e => setType(e.target.value)} className="transition-all focus:ring-2 focus:ring-blue-300">
                                        <option value="incident">Incident</option>
                                        <option value="bug">Bug</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="request">Request</option>
                                        <option value="service">Service</option>
                                    </Form.Select>
                                    {errors.type && <div className="text-red-500 text-xs mt-1 animate-fade-in">{errors.type}</div>}
                                </Form.Group>
                                <Form.Group className="mb-4" controlId="formAssignedUnit">
                                    <Form.Label className="flex items-center gap-2 font-semibold">
                                        <BsDiagram3 className="text-blue-400" /> Assign to Unit
                                    </Form.Label>
                                    <Form.Select value={assignedUnit} onChange={e => setAssignedUnit(e.target.value)} className="transition-all focus:ring-2 focus:ring-blue-300">
                                        {UNIT_OPTIONS.map(unit => (
                                            <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                    </Form.Select>
                                    {errors.assignedUnit && <div className="text-red-500 text-xs mt-1 animate-fade-in">{errors.assignedUnit}</div>}
                                </Form.Group>
                                <Form.Group className="mb-4" controlId="formAssignedTo">
                                    <Form.Label className="flex items-center gap-2 font-semibold">
                                        <BsPerson className="text-blue-400" /> Assign to Person
                                    </Form.Label>
                                    <Form.Select
                                        value={assignedTo}
                                        onChange={e => setAssignedTo(e.target.value)}
                                        required={unitUsers.length > 0}
                                        className={`transition-all focus:ring-2 focus:ring-blue-300 ${errors.assignedTo ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Select a person</option>
                                        {unitUsers.map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {errors.assignedTo && <div className="text-red-500 text-xs mt-1 animate-fade-in">{errors.assignedTo}</div>}
                                </Form.Group>
                                <Form.Group className="mb-5" controlId="formImage">
                                    <Form.Label className="flex items-center gap-2 font-semibold">
                                        <BsImage className="text-blue-400" /> Image (jpg, jpeg, png)
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                        multiple
                                        onChange={handleImageChange}
                                        className={`transition-all focus:ring-2 focus:ring-blue-300 ${errors.images ? 'border-red-500' : ''}`}
                                    />
                                    {images && images.length > 0 && !errors.images && (
                                        <div className="mt-2 text-green-600 flex items-center gap-2 animate-fade-in">
                                            <BsImage /> {images.length} files selected
                                        </div>
                                    )}
                                    {errors.images && <div className="text-red-500 text-xs mt-1 animate-fade-in">{errors.images}</div>}
                                </Form.Group>
                                <div className="d-grid">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        size="lg"
                                        className="transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2"><BsCardText className="animate-spin" /> Creating...</span>
                                        ) : (
                                            <span className="flex items-center gap-2"><BsCheckCircle /> Create Ticket</span>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop { animation: popIn 0.6s cubic-bezier(.68,-0.55,.27,1.55); }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.5s; }
            `}</style>
        </Container>
    );
}

export default CreateTicket;