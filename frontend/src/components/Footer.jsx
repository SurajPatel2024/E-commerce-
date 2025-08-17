import React from "react";
import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        {/* Left Section */}
        <div className="footer-left">
          <div className="footer-logo">
            <img
              src="https://i.postimg.cc/D0G8zN3d/20250813-201436.png"
              alt="Electronic Dukaan Logo"
              className="footer-logo-img"
            />
           
          </div>

          <p>© {new Date().getFullYear()} Electronic Dukaan. All Rights Reserved.</p>
        </div>

        {/* Right Section */}
        <div className="footer-right">
          <h3>Follow Us</h3>
          <div className="footer-icons">
            <a href="https://github.com/SurajPatel2024" aria-label="Github"><i class="fab fa-github"></i></a>
            <a href="https://www.linkedin.com/in/suraj-patel-webdev?original_referer=https%3A%2F%2Fchatgpt.com%2F" aria-label="Linkdin"><i class="fab fa-linkedin" ></i></a>
            <a href="https://whatsapp.com/channel/0029Vb6lcf00rGiO0xkjye3P" aria-label="WhatsAppIcon"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>Designed with ❤️ by Suraj Patel </p>
      </div>
    </footer>
  );
}

export default Footer;
