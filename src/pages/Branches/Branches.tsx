import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { branches } from "../../data/branches";
import { BranchCard } from "../../components/common/BranchCard";
import { Button } from "../../components/ui/Button";
import "./Branches.css";

export const Branches: React.FC = () => {
  useSEO({
    title: "Physical Academy Branches & Campus Hubs",
    description:
      "Find Dave Techs Academy physical hubs and learning branches in Abeokuta, Lagos, and Ibadan for hands-on, face-to-face technology training.",
  });

  const [selectedState, setSelectedState] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const stateFilters = [
    { id: "all", label: "All Campuses" },
    { id: "Ogun", label: "Ogun State (Abeokuta)" },
    { id: "Lagos", label: "Lagos State (VI & Ikeja)" },
    { id: "Oyo", label: "Oyo State (Ibadan)" },
  ];

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        branch.name.toLowerCase().includes(q) ||
        branch.location.toLowerCase().includes(q) ||
        branch.address.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedState === "all") return true;
      return branch.location.toLowerCase().includes(selectedState.toLowerCase());
    });
  }, [selectedState, searchQuery]);

  return (
    <div className="branches-page">
      {/* Hero Section */}
      <section className="branches-hero">
        <div className="container">
          <div className="branches-hero__badge">PHYSICAL HUBS & CAMPUSES</div>
          <h1 className="branches-hero__title">
            State-of-the-Art <span className="logo__accent">Academy Hubs</span>
          </h1>
          <p className="branches-hero__subtitle">
            Experience world-class technology learning with dedicated workstations, high-speed Starlink Wi-Fi,
            uninterrupted solar power, and face-to-face mentorship across Nigeria.
          </p>

          {/* Campus Highlights Grid */}
          <div className="branches-stats-grid">
            <div className="branch-stat-item">
              <span className="branch-stat-val">4</span>
              <span className="branch-stat-lbl">Modern Tech Campuses</span>
            </div>
            <div className="branch-stat-item">
              <span className="branch-stat-val">24/7</span>
              <span className="branch-stat-lbl">Solar & Inverter Power</span>
            </div>
            <div className="branch-stat-item">
              <span className="branch-stat-val">Gigabit</span>
              <span className="branch-stat-lbl">Starlink & Fiber Internet</span>
            </div>
            <div className="branch-stat-item">
              <span className="branch-stat-val">100%</span>
              <span className="branch-stat-lbl">In-Person Mentor Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Roster Section */}
      <section className="branches-roster-section">
        <div className="container">
          {/* Controls Bar */}
          <div className="branches-controls">
            <div className="branches-tabs">
              {stateFilters.map((tab) => (
                <button
                  key={tab.id}
                  className={`branches-tab ${selectedState === tab.id ? "branches-tab--active" : ""}`}
                  onClick={() => setSelectedState(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="branches-search-box">
              <input
                type="text"
                className="branches-search-input"
                placeholder="Search campus by city, address, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Branch Cards Grid */}
          {filteredBranches.length > 0 ? (
            <div className="branches-grid">
              {filteredBranches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
          ) : (
            <div className="branches-empty">
              <div className="branches-empty-icon">📍</div>
              <h3 className="branches-empty-title">No Campus Locations Found</h3>
              <p className="branches-empty-desc">
                No campuses match your search query "{searchQuery}". Try selecting "All Campuses" or request a new branch.
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSelectedState("all");
                  setSearchQuery("");
                }}
              >
                Reset Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Why Attend Physical Classes Section */}
      <section className="branches-why-physical">
        <div className="container">
          <div className="why-physical-header">
            <span className="why-tag">THE PHYSICAL EXPERIENCE</span>
            <h2 className="why-title">Why Attend Classes Physically at Dave Techs?</h2>
            <p className="why-subtitle">
              While our online live platform is comprehensive, our physical campuses offer an immersive hands-on environment designed for maximum focus and rapid skill acquisition.
            </p>
          </div>

          <div className="why-physical-grid">
            <div className="why-card">
              <div className="why-card__icon">🖥️</div>
              <h3 className="why-card__title">High-Spec Workstations</h3>
              <p className="why-card__desc">
                Learn on dedicated dual-monitor desktop rigs preloaded with developer tools, SDKs, and design suites so you can build without hardware limitations.
              </p>
            </div>

            <div className="why-card">
              <div className="why-card__icon">⚡</div>
              <h3 className="why-card__title">Zero Downtime Guarantee</h3>
              <p className="why-card__desc">
                Never worry about power outages or data drops. All hubs run on hybrid solar inverter systems with Starlink and fiber broadband redundancy.
              </p>
            </div>

            <div className="why-card">
              <div className="why-card__icon">👨‍🏫</div>
              <h3 className="why-card__title">Over-the-Shoulder Mentorship</h3>
              <p className="why-card__desc">
                Instructors walk through your code live, assist with hard bugs in real time, and conduct weekly face-to-face sprint reviews.
              </p>
            </div>

            <div className="why-card">
              <div className="why-card__icon">🤝</div>
              <h3 className="why-card__title">Peer Network & Hackathons</h3>
              <p className="why-card__desc">
                Form study squads, collaborate on group projects, participate in weekend campus hackathons, and build lifelong professional tech connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Request a Branch CTA */}
      <section className="branches-request-cta">
        <div className="container">
          <div className="request-card">
            <div className="request-card__content">
              <span className="request-card__tag">ACADEMY EXPANSION</span>
              <h2 className="request-card__title">Want Dave Techs in Your City?</h2>
              <p className="request-card__desc">
                We are actively expanding our campus footprint across major technology corridors in Nigeria.
                If there is no physical campus in your state, you can enroll in our <strong>🌐 Online Live Training</strong> or let us know where to open next!
              </p>
            </div>

            <div className="request-card__actions">
              <Link to="/courses">
                <Button variant="primary" size="lg">
                  Explore Online Live Courses →
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">
                  Request a Branch / Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
