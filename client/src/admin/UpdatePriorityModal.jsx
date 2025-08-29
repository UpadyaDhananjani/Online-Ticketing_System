import React, { useState } from 'react';
import './UpdatePriorityModal.css'; // Import the CSS file

const UpdatePriorityModal = ({ ticketId, onClose, onUpdate }) => {
    const [selectedPriority, setSelectedPriority] = useState('High Priority'); // Default selection

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(selectedPriority);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Update Ticket Priority</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p>Updating priority for ticket: <span>{ticketId}</span></p>
                        <p>Select new priority level:</p>
                        
                        {/* Priority Options (using radio buttons) */}
                        <div className="priority-option">
                            <input 
                                type="radio" 
                                id="low-priority" 
                                name="priority" 
                                value="Low Priority" 
                                checked={selectedPriority === 'Low Priority'} 
                                onChange={(e) => setSelectedPriority(e.target.value)} 
                            />
                            <label htmlFor="low-priority">
                                <h4>Low Priority</h4>
                                <p>Non-urgent issues, can wait 24-48 hours</p>
                            </label>
                        </div>
                        {/* ... Repeat for Medium, High, Critical ... */}

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="update-button">Update Priority</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatePriorityModal;