// Home.jsx
import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { BsTicketPerforated, BsLightningCharge, BsShieldLock, BsPeople, BsArrowRight } from 'react-icons/bs';
import './Home.css'; // We'll add a CSS file for custom animations

const features = [
  {
    icon: <BsTicketPerforated size={36} className="text-primary" />,
    title: 'Easy Ticketing',
    desc: 'Create, track, and manage your IT issues with just a few clicks.'
  },
  {
    icon: <BsLightningCharge size={36} className="text-warning" />,
    title: 'Fast Response',
    desc: 'Get quick support from our dedicated IT team.'
  },
  {
    icon: <BsShieldLock size={36} className="text-success" />,
    title: 'Secure & Reliable',
    desc: 'Your data is protected with enterprise-grade security.'
  },
  {
    icon: <BsPeople size={36} className="text-info" />,
    title: 'Collaborative',
    desc: 'Work together with IT and your team to resolve issues.'
  }
];

const Home = () => {
  return (
    <div className="home-bg d-flex align-items-center min-vh-100">
      <Container>
        <Row className="justify-content-center align-items-center text-center mb-5 fade-in">
          <Col md={8}>
            <h1 className="display-3 fw-bold mb-3 animate-pop">
              Welcome to <span className="text-primary">ICT Online Ticketing</span>
            </h1>
            <p className="lead mb-4 animate-fade">
              Seamlessly manage your IT support requests and track progress in real time.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="shadow-lg animate-bounce"
              href="/tickets"
            >
              Get Started <BsArrowRight className="ms-2" />
            </Button>
          </Col>
        </Row>
        <Row className="g-4 justify-content-center">
          {features.map((feature, idx) => (
            <Col xs={12} md={6} lg={3} key={feature.title}>
              <Card className="feature-card h-100 text-center border-0 shadow-sm animate-fade" style={{ animationDelay: `${0.2 * idx}s` }}>
                <Card.Body>
                  <div className="mb-3">{feature.icon}</div>
                  <Card.Title className="fw-semibold mb-2">{feature.title}</Card.Title>
                  <Card.Text className="text-muted">{feature.desc}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Home;