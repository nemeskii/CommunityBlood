import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { InstagramIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div>
            <h2 className="site-footer-title">Get in touch.</h2>
            <p className="site-footer-sub">
              Questions, partnerships, or press — reach out directly and a
              real person will get back to you.
            </p>
          </div>
          <div className="site-footer-links">
            <a
              className="site-footer-link"
              href="https://www.instagram.com/nemeskii/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon />
              Instagram
            </a>
            <a className="site-footer-link" href="mailto:kuotsuato58@gmail.com">
              <Mail /> kuotsuato58@gmail.com
            </a>
            <a className="site-footer-link" href="tel:+918259030753">
              <Phone /> +91 8259030753
            </a>
          </div>
        </div>
        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} Community Blood Donation Network</span>
          <span>
            <Link to="/">Home</Link> · <Link to="/about">About</Link> ·{" "}
            <Link to="/register">Register</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
