import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ tone = "dark" }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDonorLoggedIn, setIsDonorLoggedIn] = useState(false);

  const onHome = location.pathname === "/";
  const onAbout = location.pathname === "/about";
  const onHowItWorks = location.pathname === "/how-it-works";
  const onContact = location.pathname === "/contact";
  const onFindDonor = location.pathname === "/find-donor";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setIsDonorLoggedIn(!!localStorage.getItem("donor_token"));
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className={`site-topbar site-topbar--${tone}`}>
      <Link to="/" className="site-mark">
        COMMUNITY<span>BLOOD</span>
      </Link>

      <ul className="site-nav">
        <li>
          <Link to="/" className={onHome ? "is-active" : ""}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" className={onAbout ? "is-active" : ""}>
            About
          </Link>
        </li>
        <li>
          <Link to="/how-it-works" className={onHowItWorks ? "is-active" : ""}>
            How It Works
          </Link>
        </li>
        <li>
          <Link to="/contact" className={onContact ? "is-active" : ""}>
            Contact
          </Link>
        </li>
        <li>
          <Link to="/find-donor" className={onFindDonor ? "is-active" : ""}>
            Find a donor
          </Link>
        </li>
      </ul>

      <div className="site-mark-actions">
        <svg
          width="52"
          height="52"
          viewBox="240 60 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ borderRadius: "12px", flexShrink: 0 }}
        >
          <rect
            x="240"
            y="60"
            width="200"
            height="200"
            rx="16"
            fill="#F3E9D8"
          />
          <path
            d="M340 90 C340 90 288 168 288 202 C288 234 311 260 340 260 C369 260 392 234 392 202 C392 168 340 90 340 90 Z"
            fill="#A3232B"
          />
          <polyline
            points="298,202 320,202 330,180 344,224 356,196 364,202 382,202"
            fill="none"
            stroke="#F3E9D8"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {isDonorLoggedIn ? (
          <div className="site-mark-auth">
            <Link to="/dashboard" className="btn btn-ghost-dark btn-sm">
              Dashboard
            </Link>
          </div>
        ) : (
          <div className="site-mark-auth">
            <Link to="/donor/login" className="btn btn-ghost-dark btn-sm">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile hamburger toggle */}
      <button
        type="button"
        className={`site-nav-toggle${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav-menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Backdrop, click to close */}
      <div
        className={`site-nav-backdrop${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <div
        id="mobile-nav-menu"
        className={`site-nav-mobile${menuOpen ? " is-open" : ""}`}
      >
        <ul>
          <li>
            <Link to="/" className={onHome ? "is-active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={onAbout ? "is-active" : ""}>
              About
            </Link>
          </li>
          <li>
            <Link
              to="/how-it-works"
              className={onHowItWorks ? "is-active" : ""}
            >
              How It Works
            </Link>
          </li>
          <li>
            <Link to="/contact" className={onContact ? "is-active" : ""}>
              Contact
            </Link>
          </li>
          <li>
            <Link to="/find-donor" className={onFindDonor ? "is-active" : ""}>
              Find a donor
            </Link>
          </li>
        </ul>

        <div className="site-nav-mobile-auth">
          {isDonorLoggedIn ? (
            <Link
              to="/dashboard"
              className="btn btn-ghost-dark btn-sm"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/donor/login"
                className="btn btn-ghost-dark btn-sm"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
