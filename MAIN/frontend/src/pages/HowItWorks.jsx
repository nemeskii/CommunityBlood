import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/theme.css";
import "./Home.css";

const steps = [
  {
    n: "01",
    title: "Register",
    body: "Create a donor profile with your blood type and contact details. Two minutes, done.",
  },
  {
    n: "02",
    title: "Get matched",
    body: "We call when someone nearby needs your type, or when a drive lands in your area.",
  },
  {
    n: "03",
    title: "Donate",
    body: "Show up. Give blood. One donation can help up to three patients.",
  },
];

export default function HowItWorks() {
  return (
    <div className="site">
      <div className="band-ink">
        <Navbar tone="dark" />
        <div className="section" style={{ paddingTop: 40 }}>
          <div className="site-inner">
            <div className="site-eyebrow" style={{ color: "#AB1D2E" }}>
              The process
            </div>
            <h1 className="section-title" style={{ marginTop: 12 }}>
              How it works
            </h1>
            <p className="about-teaser-text" style={{ marginTop: 12, maxWidth: 560 }}>
              Three simple steps stand between a donor and a patient who
              needs them.
            </p>
          </div>
        </div>

        <div className="section" style={{ paddingTop: 0 }}>
          <div className="steps">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="step-n">{s.n}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="band-blood cta-band">
        <h2 className="cta-heading">
          Ready to
          <br />
          <em>get started?</em>
        </h2>
        <Link
          to="/register"
          className="btn btn-ghost-dark"
          style={{ borderColor: "#F6F1E4", color: "#F6F1E4" }}
        >
          Register as a donor
        </Link>
      </div>

      <Footer />
    </div>
  );
}