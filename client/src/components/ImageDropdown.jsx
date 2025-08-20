import React from 'react';
import { Dropdown, Button, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Sample data for the dropdown
const dropdownItems = [
  {
    id: 1,
    name: 'User 1',
    image: 'https://via.placeholder.com/40', // Replace with your image URLs
    unit: 'IT Department'
  },
  {
    id: 2,
    name: 'User 2',
    image: 'https://via.placeholder.com/40',
    unit: 'HR Department'
  },
  {
    id: 3,
    name: 'User 3',
    image: 'https://via.placeholder.com/40',
    unit: 'Finance Department'
  },
];

// Custom CSS for the dropdown
const customStyles = `
  .custom-dropdown-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
  }
  .custom-dropdown-item:hover {
    background-color: #f8f9fa;
  }
  .custom-dropdown-item .user-image {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 10px;
    object-fit: cover;
  }
  .custom-dropdown-item .user-details {
    display: flex;
    flex-direction: column;
  }
  .custom-dropdown-item .user-details span {
    font-size: 0.9rem;
    color: #6c757d;
  }
`;

function ImageDropdown() {
  const [selectedUser, setSelectedUser] = React.useState(null);

  const handleSelect = (user) => {
    setSelectedUser(user);
    // You can perform other actions here, like calling an API
    console.log('Selected User:', user);
  };

  return (
    <>
      {/* Inject custom styles */}
      <style>{customStyles}</style>

      <Dropdown onSelect={(id) => handleSelect(dropdownItems.find(item => item.id.toString() === id))}>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          {selectedUser ? (
            <div className="d-flex align-items-center">
              <Image src={selectedUser.image} className="user-image" />
              <span>{selectedUser.name}</span>
            </div>
          ) : (
            'Select a User'
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {dropdownItems.map((item) => (
            <Dropdown.Item
              key={item.id}
              eventKey={item.id}
              className="custom-dropdown-item"
            >
              <Image src={item.image} className="user-image" />
              <div className="user-details">
                <strong>{item.name}</strong>
                <span>{item.unit}</span>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}

export default ImageDropdown;