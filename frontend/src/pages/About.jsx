import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/theme.css";
import "./About.css";

const eligibility = [
  { num: "18–65", label: "Age range for first-time donors" },
  { num: "50kg+", label: "Minimum body weight" },
  { num: "56 days", label: "Minimum gap between whole-blood donations" },
  { num: "ID", label: "Government-issued ID required at check-in" },
];

const testimonials = [
  {
    tag: "Donor · O-negative",
    quote:
      "I registered on a Tuesday and got a call by Thursday. It felt real in a way a poster on a wall never did.",
    name: "Ato Kuotsu, 4-time donor",
    initial: "A",
    photo: "/photo.png",
  },
  {
    tag: "Donor · A-negative",
    quote:
      "My father needed three units within a day of surgery. Community Blood found donors before the hospital's own list did.",
    name: "Kevikietuo Yietsu",
    initial: "T",
    photo: "/22.jpg",
  },
  {
    tag: "Donor · A-positive",
    quote:
      "The two-minute registration wasn't a marketing line. It genuinely took two minutes, and I still get matched months later.",
    name: "Bauang Phom",
    initial: "P",
    photo: "/55.jpg"
  },
  {
    tag: "Donor · B-negative",
    quote:
      "Donating blood became a habit after my first experience. Knowing it could help save someone's life is reason enough to keep coming back.",
    name: "Limasanen Lemtor",
    initial: "T",
    photo: "/1.jpg",
  },
  {
    tag: "Donor · A-negative",
    quote:
      "I never imagined such a simple act could make such a big difference. Every donation reminds me that helping others doesn't have to be complicated.",

    name: "Vizhakuo Khezhie",
    initial: "T",
    photo: "/44.jpeg",
    objectPosition: "center top",
  },
  {
    tag: "Donor · A-negative",
    quote:
      "A single unit of blood can save a life, but a willing heart can inspire many more. To every blood donor—your selfless act is a gift of hope, compassion, and humanity. Thank you for making a life-saving difference.",

    name: "Marikho",
    initial: "M",
    photo: "/321.jpg",
    objectPosition: "center top",
  },
];

const faqs = [
  {
    q: "Does it hurt, and how long does it take?",
    a: "A whole-blood donation itself takes about 8–10 minutes; the full visit, including registration and a short rest afterward, usually runs 30–45 minutes. Most donors describe the needle as a brief pinch rather than ongoing pain.",
  },
  {
    q: "How often can I donate?",
    a: "Most healthy adults can give whole blood roughly every 56 days. If you donate plasma or platelets instead, the interval is shorter — the staff at your drive will confirm what applies to you.",
  },
  {
    q: "What should I do before donating?",
    a: "Eat a normal meal, drink extra water in the hours before, and get a reasonable night's sleep. Avoid donating on an empty stomach.",
  },
  {
    q: "Can I donate if I'm on medication?",
    a: "Many common medications don't disqualify you, but some do. Bring a list of what you're taking and the staff will check it against current guidelines when you arrive.",
  },
  {
    q: "Is my information kept private?",
    a: "Your contact and medical details are used only to match you to nearby requests and drives, and are never sold or shared with third parties.",
  },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="site">
      {/* Hero */}
      <div className="band-ink">
        <Navbar tone="dark" />
        <div className="about-hero">
          <div className="site-eyebrow" style={{ color: "#AB1D2E", justifyContent: "center" }}>
            Our story
          </div>
          <h1 className="about-hero-heading">
            Why we built a <em>standing network</em>, not another drive.
          </h1>
        </div>
      </div>

      {/* Story */}
      <div className="band-paper section">
        <div className="site-inner story-grid">
          <div className="story-media">
            <img
              src="/neiphiu.jpg"
              alt="Volunteers coordinating a blood donation match"
              className="story-image"
            />
            <blockquote className="story-note">
              <p className="story-note-quote">
                "Every blood donation is a priceless gift of hope and life. I
                salute our community blood donors for their selfless
                compassion and unwavering commitment to saving lives.
                Together, let us continue to build a healthier, stronger, and
                more caring Nagaland."
              </p>
              <footer className="story-note-attribution">
                Hon'ble Shri Neiphiu Rio 
                <br /> Chief Minister of Nagaland
              </footer>
            </blockquote>
          </div>
          <div className="story">
            <p>
              Most blood donation efforts run on a calendar: a drive gets
              scheduled, volunteers show up, and then the list goes quiet until
              the next one. That works for planned surgeries. It doesn't work
              for the 2 a.m. emergency, the sudden complication, the patient who
              can't wait three weeks for the next scheduled event.
            </p>
            <p>
              Community Blood was built to close that gap. Instead of asking
              people to remember a drive date, we ask them to register once —
              their blood type, their contact details, where they are — and we
              keep that on file. When a real, verified request comes in that
              matches their type, we reach out directly. No newsletter, no
              guesswork, just a call when it actually matters.
            </p>
            <p>
              We're a small, local operation, not a hospital system or a
              national charity. That's deliberate: it lets us move fast, verify
              requests directly with the people asking for help, and keep the
              whole process transparent to the donors who make it possible.
            </p>
          </div>
        </div>
      </div>

      {/* Eligibility quick facts */}
      <div className="band-paper section" style={{ paddingTop: 0 }}>
        <div className="site-inner">
          <div className="section-kicker">Before you register</div>
          <h2 className="section-title">Who can donate</h2>
          <div className="eligibility-grid" style={{ marginTop: 36 }}>
            {eligibility.map((e) => (
              <div className="eligibility-card" key={e.label}>
                <span className="eligibility-num">{e.num}</span>
                <div className="eligibility-label">{e.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="band-ink section">
        <div className="site-inner">
          <div className="section-kicker" style={{ color: "#AB1D2E" }}>
            From the network
          </div>
          <h2 className="section-title" style={{ color: "#F6F1E4" }}>
            Donors and families, in their own words
          </h2>
          <div className="testimonial-grid" style={{ marginTop: 36 }}>
            {testimonials.map((t) => (
              <div className="testimonial-card" key={t.name}>
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="testimonial-avatar testimonial-avatar--photo"
                    style={{ objectPosition: t.objectPosition || "center" }}
                  />
                ) : (
                  <div className="testimonial-avatar">{t.initial}</div>
                )}
                <span className="testimonial-tag">{t.tag}</span>
                <p className="testimonial-quote">“{t.quote}”</p>
                <div className="testimonial-name">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="band-paper section">
        <div className="site-inner">
          <div className="section-kicker" style={{ textAlign: "center" }}>
            Common questions
          </div>
          <h2 className="section-title" style={{ textAlign: "center" }}>
            Frequently asked questions
          </h2>
          <div className="faq-list" style={{ marginTop: 36 }}>
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  className={`faq-item${isOpen ? " faq-item--open" : ""}`}
                  key={f.q}
                >
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    {f.q}
                    <Plus className="faq-icon" />
                  </button>
                  <div className="faq-answer">
                    <div className="faq-answer-inner">
                      <p className="faq-answer-text">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="band-blood about-cta">
        <h2 className="about-cta-heading">Ready to be on the list?</h2>
        <Link to="/register" className="btn btn-ghost-dark" style={{ borderColor: "#F6F1E4", color: "#F6F1E4" }}>
          Register as a donor
        </Link>
      </div>

      <Footer />
    </div>
  );
}