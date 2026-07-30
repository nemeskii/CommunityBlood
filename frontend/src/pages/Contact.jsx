import { useState } from "react";
import emailjs from "@emailjs/browser";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/theme.css";
import "./Home.css";

const EMAILJS_SERVICE_ID = "service_vgozpvy";
const EMAILJS_TEMPLATE_ID = "template_agx2w6j";
const EMAILJS_PUBLIC_KEY = "47UzJlkukcVvJQNxl";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          message: form.message,
        },
        EMAILJS_PUBLIC_KEY,
      );
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  };

  return (
    <div className="site">
      <div className="band-ink">
        <Navbar tone="dark" />
        <div className="section" style={{ paddingTop: 40 }}>
          <div className="site-inner">
            <div className="site-eyebrow" style={{ color: "#AB1D2E" }}>
              Get in touch
            </div>
            <h1 className="section-title" style={{ marginTop: 12 }}>
              Contact us
            </h1>
            <p
              className="about-teaser-text about-teaser-text--hero"
              style={{ marginTop: 12, maxWidth: 560 }}
            >
              Questions about donating, hosting a drive, or an emergency
              request? Reach out below.
            </p>
          </div>
        </div>
      </div>

      <div className="band-paper section">
        <div
          className="site-inner"
          style={{ display: "grid", gap: 48, gridTemplateColumns: "1fr 1fr" }}
        >
          <div>
            <div className="section-kicker">Contact details</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Talk to the team
            </h2>
            <p
              className="about-teaser-text about-teaser-text--details"
              style={{ marginBottom: 8 }}
            >
              Emergency request line: 24/7
            </p>
            <p
              className="about-teaser-text about-teaser-text--details"
              style={{ marginBottom: 8 }}
            >
              Phone: +91 8259030753
            </p>
            <p
              className="about-teaser-text about-teaser-text--details"
              style={{ marginBottom: 8 }}
            >
              Email: kuotsuato59@gmail.com
            </p>
            <p className="about-teaser-text about-teaser-text--details">
              Office: Civil Secretariat, Kohima, Nagaland
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div>
              <label
                htmlFor="name"
                style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #9A9280",
                  borderRadius: 6,
                  fontSize: 15,
                }}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #9A9280",
                  borderRadius: 6,
                  fontSize: 15,
                }}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #9A9280",
                  borderRadius: 6,
                  fontSize: 15,
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "sending"}
              style={{ justifySelf: "start" }}
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>

            {status === "sent" && (
              <p style={{ color: "#2F6B4F", margin: 0 }}>
                Message sent — we'll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p style={{ color: "#AB1D2E", margin: 0 }}>
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
