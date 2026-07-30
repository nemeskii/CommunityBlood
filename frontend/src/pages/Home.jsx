import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/theme.css";
import "./Home.css";

const BLOOD_TYPE_ORDER = ["O-", "O+", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const INVENTORY_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/blood-inventory`;

function getLevel(units) {
  if (units <= 0) return "none";
  if (units < 10) return "critical";
  return "adequate";
}

const FULL_STOCK_REFERENCE = 50;
function getPct(units) {
  return Math.max(
    0,
    Math.min(100, Math.round((units / FULL_STOCK_REFERENCE) * 100)),
  );
}

const levelColor = {
  critical: "#AB1D2E",
  low: "#A8642A",
  adequate: "#2F6B4F",
  none: "#9A9280",
};

const levelLabel = {
  critical: "",
  low: "Running low",
  adequate: "Adequate",
  none: "Not available",
};

function getStatusText(level, units) {
  if (level === "none") return levelLabel.none;
  const unitWord = units === 1 ? "unit" : "units";
  if (level === "critical") return `${units} ${unitWord}`;
  return `${levelLabel[level]} — ${units} ${unitWord}`;
}

const upcomingDrives = [
  {
    day: "12",
    month: "Jul",
    name: "NMH Blood Drive",
    location: "Kohima, Nagaland Medical College Auditorium",
    time: "9:00 AM – 3:00 PM",
    photo: "/nmh.jpg",
  },
  {
    day: "19",
    month: "Jul",
    name: "Naga Hospital Blood Drive",
    location: "Naga Hospital, OPD Lobby",
    time: "10:00 AM – 2:00 PM",
    photo: "/naga.jpeg",
  },
  {
    day: "02",
    month: "Aug",
    name: "Kohima Civil Hospital Drive",
    location: "Civil Hospital, OPD Block",
    time: "8:30 AM – 1:00 PM",
    photo: "/kohimas.avif",
  },
];

const heroGallery = [
  { src: "/photo.jpeg.jpg", caption: "Kohima, Nagaland" },
  { src: "/download.jpg", caption: "pew" },
  { src: "/2.jpg", caption: "Community Blood" },
  { src: "/3.jpg", caption: "Community Blood" },
];

export default function Home() {
  const [openType, setOpenType] = useState(null);
  const [inventory, setInventory] = useState(
    Object.fromEntries(BLOOD_TYPE_ORDER.map((t) => [t, 0])),
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);

  useEffect(() => {
    const galleryInterval = setInterval(() => {
      setHeroPhotoIndex((i) => (i + 1) % heroGallery.length);
    }, 3500);
    return () => clearInterval(galleryInterval);
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch(INVENTORY_ENDPOINT);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const next = { ...inventory };
      data.forEach((row) => {
        if (BLOOD_TYPE_ORDER.includes(row.type))
          next[row.type] = row.units ?? 0;
      });
      setInventory(next);
      setLoadError(false);
    } catch (err) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();

    const interval = setInterval(fetchInventory, 20000);

    const onFocus = () => fetchInventory();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchInventory]);

  const bloodTypes = BLOOD_TYPE_ORDER.map((type) => {
    const units = inventory[type] ?? 0;
    return { type, units, level: getLevel(units), pct: getPct(units) };
  });

  // Cycle the hero card through each blood type every 3s.
  // slideIndex is in the dependency array so manual nav resets the timer.
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setSlideIndex((i) => (i + 1) % BLOOD_TYPE_ORDER.length);
    }, 3000);
    return () => clearInterval(slideInterval);
  }, [slideIndex]);

  const activeSlide = bloodTypes[slideIndex] ?? bloodTypes[0];

  const goToSlide = useCallback((index) => {
    setSlideIndex(
      ((index % BLOOD_TYPE_ORDER.length) + BLOOD_TYPE_ORDER.length) %
        BLOOD_TYPE_ORDER.length,
    );
  }, []);

  const handlePrevSlide = () => goToSlide(slideIndex - 1);
  const handleNextSlide = () => goToSlide(slideIndex + 1);

  return (
    <div className="site">
      {/* Hero (dark ink band) */}
      <div className="band-ink">
        <Navbar tone="dark" />
        <div className="hero" id="top">
          <div className="hero-copy">
            <div className="site-eyebrow" style={{ color: "#AB1D2E" }}>
              Live donor network
            </div>
            <h1 className="hero-heading">
              Someone needs
              <br />
              your blood type
              <br />
              <em>today.</em>
            </h1>
            <p className="hero-text">
              Join a network of donors matched to real, local need. Register
              once, get called when it matters, and see the impact of every
              donation.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">
                Register now
              </Link>
              <Link to="/how-it-works" className="btn btn-ghost-dark">
                How it works
              </Link>
            </div>
            <div className="hero-trust-strip">
              <span>
                <strong>120+</strong> donors
              </span>
              <span className="hero-trust-divider" aria-hidden="true" />
              <span>
                <strong>3</strong> hospitals
              </span>
              <span className="hero-trust-divider" aria-hidden="true" />
              <span>
                <strong>24/7</strong> request line
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-visual-group">
              <div
                className="donor-card"
                key={activeSlide.type}
                role="group"
                aria-label={`Inventory status for blood type ${activeSlide.type}`}
              >
                <button
                  type="button"
                  className="donor-card-nav donor-card-nav--prev"
                  onClick={handlePrevSlide}
                  aria-label="Previous blood type"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="donor-card-nav donor-card-nav--next"
                  onClick={handleNextSlide}
                  aria-label="Next blood type"
                >
                  ›
                </button>

                <div className="donor-card-label">Live Inventory</div>
                <div
                  className="donor-card-stamp"
                  style={{ color: levelColor[activeSlide.level] }}
                >
                  {activeSlide.type}
                </div>
                <div className="donor-card-row">
                  <span>Status</span>
                  <span style={{ color: levelColor[activeSlide.level] }}>
                    {loading
                      ? "Loading…"
                      : getStatusText(activeSlide.level, activeSlide.units)}
                  </span>
                </div>
                <div className="donor-card-dots">
                  {bloodTypes.map((b, i) => (
                    <button
                      type="button"
                      key={b.type}
                      className={`donor-card-dot${i === slideIndex ? " donor-card-dot--active" : ""}`}
                      onClick={() => goToSlide(i)}
                      aria-label={`Show ${b.type}`}
                      aria-current={i === slideIndex}
                    />
                  ))}
                </div>
              </div>
              <div className="hero-photo-feature" aria-hidden="true">
                <img
                  key={heroPhotoIndex}
                  src={heroGallery[heroPhotoIndex].src}
                  alt=""
                  className="hero-photo-fade"
                />
                <span className="photo-plate-caption">
                  {heroGallery[heroPhotoIndex].caption}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pulse-wrap">
        <svg
          className="pulse-svg"
          viewBox="0 0 900 44"
          preserveAspectRatio="none"
        >
          <path
            className="pulse-path pulse-path--base"
            d="M0 22 H320 L345 22 L360 5 L378 39 L396 22 L420 22 H580 L605 22 L620 5 L638 39 L656 22 L680 22 H900"
            fill="none"
            stroke="#AB1D2E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          />
          <path
            className="pulse-path pulse-path--sweep"
            d="M0 22 H320 L345 22 L360 5 L378 39 L396 22 L420 22 H580 L605 22 L620 5 L638 39 L656 22 L680 22 H900"
            fill="none"
            stroke="#AB1D2E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
          />
        </svg>
      </div>

      <div className="band-paper section" id="about">
        <div className="about-teaser">
          <div className="section-kicker">About this network</div>
          <h2 className="section-title">
            Not a one-off drive. A standing network.
          </h2>
          <div className="about-teaser-row">
            <div className="photo-plate photo-plate--about">
              <img
                src="/modi.jpg"
                alt="Donors and volunteers at a Community Blood drive"
              />
              <span className="photo-plate-caption">Shri Narendra Modi</span>
            </div>
            <div className="about-teaser-copy">
              <p className="about-teaser-text about-teaser-text--details">
                Community Blood connects donors and patients directly, so help
                doesn't wait for the next scheduled drive to arrive.
              </p>
              <Link to="/about" className="about-teaser-link">
                Read our story →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="band-blood stats-band">
        <div className="stats">
          <div>
            <span className="stat-num">3</span>
            <div className="stat-label">Lives helped per donation</div>
          </div>
          <div>
            <span className="stat-num">90</span>
            <div className="stat-label">Days between donations</div>
          </div>
          <div>
            <span className="stat-num">24/7</span>
            <div className="stat-label">Emergency request line</div>
          </div>
        </div>
      </div>
      <div className="band-paper section">
        <div className="site-inner">
          <div className="section-kicker">Live inventory</div>
          <h2 className="section-title">Current need by blood type</h2>
          {loadError && (
            <p className="inventory-note">
              Couldn't load live inventory right now — showing the last known
              status.
            </p>
          )}
          <div className="blood-grid" style={{ marginTop: 36 }}>
            {bloodTypes.map((b) => {
              const isOpen = openType === b.type;
              const unavailable = b.level === "none";
              return (
                <button
                  type="button"
                  key={b.type}
                  className={`blood-card${isOpen ? " blood-card--active" : ""}${unavailable ? " blood-card--empty" : ""}`}
                  onClick={() => setOpenType(isOpen ? null : b.type)}
                  aria-expanded={isOpen}
                >
                  <div className="blood-type">{b.type}</div>
                  <div className="blood-bar-track">
                    <div
                      className="blood-bar-fill"
                      style={{
                        width: `${b.pct}%`,
                        background: levelColor[b.level],
                      }}
                    />
                  </div>
                  <div
                    className="blood-level"
                    style={{ color: levelColor[b.level] }}
                  >
                    {loading ? "Loading…" : getStatusText(b.level, b.units)}
                  </div>
                  <div className="blood-units">
                    <div className="blood-units-inner">
                      <div className="blood-units-text">
                        {unavailable ? (
                          "No units currently available"
                        ) : (
                          <>
                            <span className="blood-units-num">
                              {b.units} units
                            </span>{" "}
                            available now
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="band-paper section" style={{ paddingTop: 0 }}>
        <div className="site-inner">
          <div className="section-kicker">Get involved in person</div>
          <h2 className="section-title">Upcoming blood drives</h2>
          <div className="drives-list" style={{ marginTop: 36 }}>
            {upcomingDrives.map((d) => (
              <div className="drive-card" key={`${d.day}-${d.month}-${d.name}`}>
                <div className="drive-photo">
                  <img src={d.photo} alt={d.name} />
                </div>
                <div className="drive-date">
                  <span className="drive-date-day">{d.day}</span>
                  <span className="drive-date-month">{d.month}</span>
                </div>
                <div className="drive-info">
                  <p className="drive-name">{d.name}</p>
                  <div className="drive-meta">
                    {d.location}
                    <br />
                    {d.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="band-blood cta-band cta-band--photo">
        <h2 className="cta-heading">
          Be someone's
          <br />
          <em>reason to live.</em>
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
