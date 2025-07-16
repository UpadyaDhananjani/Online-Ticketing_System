import React, { useState, useContext } from 'react';
import TicketList from '../components/TicketList';
import { Tabs, Tab } from 'react-bootstrap';
import { BsSend, BsInbox, BsArrowRepeat } from 'react-icons/bs';
import { AppContent } from '../context/AppContext';

function TicketsPage({ token, filter }) {
  const [tabKey, setTabKey] = useState('created');
  const { userData } = useContext(AppContent);
  const userId = userData?.id;

  return (
    <div>
      <Tabs
        id="tickets-tabs"
        activeKey={tabKey}
        onSelect={k => setTabKey(k)}
        className="mb-3 custom-tabs"
        transition
        mountOnEnter
        unmountOnExit
        variant="pills"
        style={{ maxWidth: 900, margin: '0 auto' }}
      >
        <Tab
          eventKey="created"
          title={
            <span className="d-flex align-items-center gap-2">
              <BsSend size={18} />
              <span>Tickets Issued</span>
            </span>
          }
        >
          <div className="tab-pane-fade-in">
            <TicketList mode="created" userId={userId} />
          </div>
        </Tab>
        <Tab
          eventKey="received"
          title={
            <span className="d-flex align-items-center gap-2">
              <BsInbox size={18} />
              <span>Tickets Received</span>
            </span>
          }
        >
          <div className="tab-pane-fade-in">
            <TicketList mode="received" userId={userId} />
          </div>
        </Tab>
        <Tab
          eventKey="reassigned"
          title={
            <span className="d-flex align-items-center gap-2">
              <BsArrowRepeat size={18} />
              <span>Reassigned</span>
            </span>
          }
        >
          <div className="tab-pane-fade-in">
            {/* No logic or TicketList here, just an empty tab or placeholder */}
          </div>
        </Tab>
      </Tabs>
      <style>{`
        .custom-tabs .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          font-weight: 500;
          color: #495057;
          background: none;
          border: none;
          border-radius: 8px 8px 0 0;
          margin-right: 8px;
          padding: 10px 20px;
          transition: background 0.2s, color 0.2s;
        }
        .custom-tabs .nav-link.active, .custom-tabs .nav-link:focus, .custom-tabs .nav-link:hover {
          background: #f5f6fa;
          color: #007bff !important;
          font-weight: 700;
        }
        .tab-pane-fade-in {
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default TicketsPage;