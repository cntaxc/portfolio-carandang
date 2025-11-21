import React from 'react';
import { Container, Navbar, Nav, Card, Row, Col, Image } from 'react-bootstrap';

const Dashboard = () => {
    return (
        <>
            {/* Header/Navbar */}
            <Navbar bg="dark" variant="dark" expand="lg" className="px-4">
                <Navbar.Brand href="#">MyName/Logo</Navbar.Brand>
                <Navbar.Toggle aria-controls="nav-links" />
                <Navbar.Collapse id="nav-links">
                    <Nav className="ms-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link href="#about">About</Nav.Link>
                        <Nav.Link href="#projects">Projects</Nav.Link>
                        <Nav.Link href="#contact">Contact</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            {/* Main Profile Card */}
            <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
                <Card className="shadow rounded p-4" style={{ maxWidth: '500px', width: '100%' }}>
                    <Card.Body className="text-center">
                        <Image
                            src="https://via.placeholder.com/150"
                            roundedCircle
                            alt="Profile Image"
                            width={150}
                            height={150}
                            className="mb-3"
                        />
                        <Card.Title className="fs-3 fw-bold">Your Name</Card.Title>
                        <Card.Subtitle className="mb-3 text-muted">Your Profession / Title</Card.Subtitle>
                        <Card.Text>
                            [translate:Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur euismod nulla non augue convallis, et varius enim imperdiet.]
                        </Card.Text>
                        <div className="d-flex justify-content-center gap-4 fs-4 mt-4">
                            <a
                                href="https://github.com/yourgithub"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                                className="text-dark fs-4"
                            >
                                <i className="bi bi-github"></i>
                            </a>
                            <a
                                href="mailto:youremail@example.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Email"
                                className="text-dark fs-4"
                            >
                                <i className="bi bi-envelope-fill"></i>
                            </a>
                            <a
                                href="https://linkedin.com/in/yourprofile"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="text-primary fs-4"
                            >
                                <i className="bi bi-linkedin"></i>
                            </a>
                            <a
                                href="https://twitter.com/yourprofile"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                                className="text-info fs-4"
                            >
                                <i className="bi bi-twitter"></i>
                            </a>
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Footer */}
            <footer className="bg-dark text-white text-center py-3">
                <Container className="d-flex justify-content-center gap-4 fs-5">
                    <span>© {new Date().getFullYear()} Your Name</span>
                    <a
                        href="https://github.com/yourgithub"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="text-white"
                    >
                        <RiGithubFill />
                    </a>
                    <a
                        href="https://linkedin.com/in/yourprofile"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="text-white"
                    >
                        <RiLinkedinFill />
                    </a>
                    <a
                        href="https://twitter.com/yourprofile"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter"
                        className="text-white"
                    >
                        <RiTwitterFill />
                    </a>
                </Container>
            </footer>
        </>
    );
};

export default Dashboard;
