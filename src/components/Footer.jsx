import { useState, useEffect } from 'react';
import './Footer.css';

function Footer() {
  const [times, setTimes] = useState({ newYork: '', melbourne: '' });

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();

      const nyOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York'
      };

      const melbOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Australia/Melbourne'
      };

      setTimes({
        newYork: now.toLocaleTimeString('en-US', nyOptions),
        melbourne: now.toLocaleTimeString('en-US', melbOptions)
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-copyright">
          <p>&copy; 2025 A Guy Called Kirill</p>
        </div>

        <div className="footer-times">
          <div className="footer-time">
            <span className="time-label">New York,</span>
            <span className="time-value">{times.newYork}</span>
          </div>
          <div className="footer-time">
            <span className="time-label">Melbourne,</span>
            <span className="time-value">{times.melbourne}</span>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-link-group">
            <a href="#work">Work</a>
            <a href="#feed">Feed</a>
            <a href="#profile">Profile</a>
            <a href="#photography">Photography</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-link-group">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer">Dribbble</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:hello@aguycalledkirill.com">Email</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
