import React, { useState } from 'react';
import '../styles/chatbotStyle.css';

export default function ChatBot({ showChatbot, setShowChatbot }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm Raph, Christian's ChatBot assistant. Ask me anything about his background, skills, or what he has built!" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    
    // Normalize string: clear out punctuation marks to isolate true words
    const cleanText = userText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "");
    
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInputMessage('');
    
    setIsAnalyzing(true);

    setTimeout(() => {
      let reply = "I'm not quite sure about that. Could you ask in a different way?";

      // 1. SPECIFIC INTENT CHECKS FIRST (Prevents greeting hijacking)
      
      // Skills & Expertise Route
      if (cleanText.includes('skill') || cleanText.includes('expertise') || cleanText.includes('tech stack') || cleanText.includes('languages') || cleanText.includes('what can he do')) {
        reply = "Christian specializes in Frontend development (C#, React, CSS, Java), 3D & Designs (3D Modeling, Animation, Rigging, Game Design, UI/UX Design), and uses software pipelines like Unity Engine, Blender, Figma, and VSCode.";
      } 
      // Experience Route (Catches typos like 'experieces' or 'experiece')
      else if (cleanText.includes('experien') || cleanText.includes('experiec') || cleanText.includes('job') || cleanText.includes('work') || cleanText.includes('history')) {
        reply = "Christian has held positions as Logistics Director for JBECP Laguna (2025), Logistics Officer for AWS Cloud Club - UC (2024-2025), and structural assignments as a Data Encoder, Volunteered as Logistics, Registration, and Usher Staff in DEVCON Laguna, and joined SIKAPTala as a Front-end Developer for their virtual hackathon project in 2026.";
      } 
      // Projects Route
      else if (cleanText.includes('project') || cleanText.includes('portfolio') || cleanText.includes('what did he make') || cleanText.includes('what has he built')) {
        reply = "Christian has built multiple platforms, notably this interactive Portfolio Website and a custom Unity-based 3D Game Project!";
      } 
      // Biography Route
      else if (cleanText.includes('who is christian') || cleanText.includes('about christian') || cleanText.includes('tell me about him') || cleanText.includes('his background')) {
        reply = "Christian Raphael A. Carandang is a Computer Science student at the University of Cabuyao. He is highly passionate about Front-End development, Game Design, and UI/UX engineering, blending logical systems with digital creativity.";
      } 
      // Education Route
      else if (cleanText.includes('education') || cleanText.includes('school') || cleanText.includes('college') || cleanText.includes('where does he study')) {
        reply = "He is currently pursuing his Bachelor of Science in Computer Science (2023–2027) at the University of Cabuyao. He also completed his STEM track studies there.";
      } 
      // Contact Route
      else if (cleanText.includes('contact') || cleanText.includes('email') || cleanText.includes('hire') || cleanText.includes('reach out')) {
        reply = "You can contact Christian by clicking the 'Email Me' button in the main hero frame or link with him directly using his GitHub and LinkedIn handles.";
      }
      // Certificates Route
      else if (cleanText.includes('certificates') || cleanText.includes('certificate') || cleanText.includes('award')) {
        reply = "Christian has earned several certificates, including Entrepreneurship & Soft Skills (2026), Thesis & Capstone Ready – Preparing 3rd Year Students(2026), and SIKAPTala 2026: Virtual Hackathon.";
      }
      // Kalokohan Route
      else if (cleanText.includes('gay') || cleanText.includes('bading') || cleanText.includes('tuli')) {
        reply = "Taenamo, parang gago. yung maayos na tanong kasi HAHAHAHA.";
      } 
      
      // 2. FALL THROUGH TO GENERAL GREETINGS LAST
      else if (cleanText.includes('hello') || cleanText.includes('hi') || cleanText.includes('hey') || cleanText.includes('who are you')) {
        reply = "Hello, I'm Raph! Christian's Chatbot assistant. Feel free to ask me about his work, background, or skill sets!";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Chat Window */}
      {showChatbot && (
        <div className="chatbot-window messenger-dark">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-header-badge">R</div>
              <span>Raph</span>
            </div>
            <button onClick={() => setShowChatbot(false)} className="chatbot-close-btn">
              <i className="ri-close-line"></i>
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                {msg.text}
              </div>
            ))}

            {isAnalyzing && (
              <div className="chat-bubble bot typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="chatbot-input-area">
            <input 
              type="text" 
              placeholder="Ask me something..." 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button type="submit"><i className="ri-send-plane-fill"></i></button>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) Trigger */}
      {!showChatbot && (
        <div className="floating-chatbot-container">
          <button 
            onClick={() => setShowChatbot(true)} 
            className="uiverse-kabak-btn"
            title="Chat with Christian's AI"
          >
            R
          </button>
        </div>
      )}
    </>
  );
}