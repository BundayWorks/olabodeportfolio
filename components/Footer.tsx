export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <span className="nav__logo">Olabode</span>
          <p>Product &amp; Transformation Leader.</p>
          <p className="footer__since">Lagos, Nigeria &middot; Open to opportunities &middot; Since 2012</p>
        </div>
        <div className="footer__nav">
          <div>
            <h5>More</h5>
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <div>
            <h5>Social</h5>
            <a href="https://www.linkedin.com/in/consultjosh/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://x.com/olabode_africa" target="_blank" rel="noopener noreferrer">Twitter / X</a>
            <a href="#">Medium</a>
          </div>
          <div>
            <h5>Contact</h5>
            <a href="mailto:olabode.ogunfuye@gmail.com">Email</a>
            <a href="tel:+2348100694808">+234 810 069 4808</a>
            <a href="#">Book a call</a>
          </div>
        </div>
      </div>
      <div className="footer__copy container">
        <small>&copy; 2026 Olabode Ogunfuye. All rights reserved.</small>
      </div>
    </footer>
  );
}
