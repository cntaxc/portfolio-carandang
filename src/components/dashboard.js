import React from "react";
import "./dbStyle.css";
import profilePic from "./profilepic.png";

function Dashboard() {
    return (

        <div className="dashboard-container p-4">

            <div className="content-section p-4">
                <div className="row align-items-center mb-5">

                    {/* Profile Image */}
                    <div className="col-md-4 text-center mb-3 mb-md-0">
                        <div className="profile-img-wrapper">
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="profile-img shadow"
                            />
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="col-md-8">
                        <h1 className="hero-title">CHRISTIAN RAPHAEL A. CARANDANG</h1>
                        <p className="hero-subtitle">Web Developer • Game Developer • Designer</p>

                        <p className="hero-description">
                            Student/Educator from Pamantasan ng Cabuyao, City of Cabuyao, Laguna
                        </p>

                        <p className="hero-description">
                            Bachelor of Science in Computer Science
                        </p>

                        {/* Buttons */}
                        <div className="btn-group mt-4">
                            <a className="main-btn" href="">Contact Me</a>

                            <a className="icon-btn" href="https://github.com/cntaxc" target="_blank">
                                <i className="ri-github-fill"></i>
                            </a>

                            <a className="icon-btn" href="https:linkedin.com/in/christian-carandang-b30015334" target="_blank">
                                <i className="ri-linkedin-box-fill"></i>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="custom-divider my-4" />

                {/* ===== Skill Badges Section ===== */}
                <div className="skills-section mt-4">

                    <div className="skills-badges">
                        <span className="skill-badge">
                            Web Dev
                        </span>
                        <span className="skill-badge">
                            Game Dev
                        </span>
                        <span className="skill-badge">
                            UI/UX
                        </span>
                        <span className="skill-badge">
                            Graphic Design
                        </span>
                        <span className="skill-badge">
                            Pixel Arts
                        </span>
                    </div>
                </div>

                {/* ===== Info Cards Section ===== */}
                <div className="info-cards-section mt-5">
                    <div className="row text-center justify-content-center g-4 align-items-stretch">

                        {/* Hobbies Card */}
                        <div className="col-md-4 d-flex">
                            <div className="info-card p-4 w-100 h-100">
                                <h5 className="info-card-title">Hobbies</h5>
                                <ul className="info-card-list">
                                    <li>Playing Games</li>
                                    <li>Watching Movies</li>
                                    <li>Music</li>
                                    <li>Designing</li>
                                    <li>Reading Manga</li>
                                </ul>
                            </div>
                        </div>

                        {/* Ambition Card */}
                        <div className="col-md-4 d-flex">
                            <div className="info-card p-4 w-100 h-100">
                                <h5 className="info-card-title">Ambition</h5>
                                <p className="info-card-text">
                                    My ambition is to become a successful game developer or web developer either path excites me because both allow me to combine happiness, creativity, and technical skills.
                                </p>
                            </div>
                        </div>

                        {/* Interest Card */}
                        <div className="col-md-4 d-flex">
                            <div className="info-card p-4 w-100 h-100">
                                <h5 className="info-card-title">Interest</h5>
                                <ul className="info-card-list">
                                    <li>Unity C#</li>
                                    <li>Web Development</li>
                                    <li>Game Development</li>
                                    <li>Photography</li>
                                    <li>Videography</li>
                                    <li>Video Editing</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="custom-divider my-4" />

                {/* About Me Card */}
                <div className="about-card p-4 mt-4 shadow-sm">
                    <h4 className="section-title">About Me</h4>
                    <p>
                        Hello! I'm Christian Raphael A. Carandang, a 3rd-year college student at Pamantasan ng Cabuyao, currently pursuing a Bachelor of Science in Computer Science. I have a strong passion for creating and planning games, as it brings me joy and a sense of accomplishment when I see ideas come to life. I also enjoy working on web applications, especially taking on roles that combine front-end development with UI/UX design, because I love designing intuitive and visually appealing interfaces.
                    </p>
                </div>

                {/* ===== Projects Section ===== */}
                <div className="projects-section mt-5">
                    <h4 className="smp mb-4">SAMPLE PROJECT</h4>

                    {/* Project 1 */}
                    <div className="row align-items-start mb-4">
                        {/* Left column: image + title */}
                        <div className="col-md-5 text-center mb-3 mb-md-0">
                            <img
                                src={require("./project1.png")}
                                alt="Project 2"
                                className="img-fluid rounded shadow-sm project-img"
                            />
                            <a
                                href="https://www.figma.com/proto/NE740EQbitPrFPVNmf5hq9/DISASTRO?node-id=2001-2&p=f&t=kdWSSyVbqo6yinZn-0&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2001%3A2&show-proto-sidebar=1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-title-link mt-2 d-block"
                            >
                                PLAY DISASTRO
                            </a>
                        </div>

                        {/* Right column: subtitle + description */}
                        <div className="col-md-7 d-flex align-items-center">
                            <div>
                                <h6 className="project-subtitle mb-2">PROJECT BACKGROUND</h6>
                                <p className="project-description">
                                    Disastro from the Latin word for "Disaster" is an educational RPG created in Figma for our CSEG1 - Game Concepts and Production lab exam. The game combines survival mechanics with quiz challenges in a pixelated, dialogue-driven world. Players must survive while answering questions correctly; each wrong answer reduces health by 1 and stars by 5. The game encourages strategic thinking as players balance risk and knowledge to progress. Its pixel art style and engaging dialogues immerse players in a disaster-filled world. By integrating learning into gameplay, Disastro makes education interactive and fun.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* ===== Contact Me Section ===== */}
                <div className="contact-card p-4 mt-5 shadow-sm text-center">
                    <h4 className="section-title">Contact Me</h4>
                    <div className="contact-icons mt-3">
                        <a href="https://www.facebook.com/arey.heys" target="_blank" className="contact-icon">
                            <i className="ri-facebook-circle-fill"></i>
                        </a>
                        <a href="https://www.instagram.com/ctian.ra" target="_blank" className="contact-icon">
                            <i className="ri-instagram-fill"></i>
                        </a>
                        <a href="https://x.com/tiancrnd" target="_blank" className="contact-icon">
                            <i className="ri-twitter-x-line"></i>
                        </a>
                        <a href="https://www.tiktok.com/@yoboiheys?lang=en" target="_blank" className="contact-icon">
                            <i className="ri-tiktok-fill"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
