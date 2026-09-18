import React, { useState, useEffect } from "react";
import { lmsService } from "../../services/lmsService";
import { useAuth } from "../../hooks/useAuth";
import { useSEO } from "../../hooks/useSEO";
import type { JobListing } from "../../types/lms";
import "./JobBoard.css";

export const JobBoard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [activeJob, setActiveJob] = useState<JobListing | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Application Form State
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useSEO({
    title: "Tech Careers & Job Marketplace | Dave Techs Academy",
    description: "Exclusive job opportunities, internships, and hiring partnerships for Dave Techs Academy graduates and technology professionals.",
  });

  const loadJobs = () => {
    const list = lmsService.getJobs({
      workLocation: selectedLocation,
      jobType: selectedType,
      experienceLevel: selectedLevel,
      search: searchQuery,
    });
    setJobs(list);
  };

  useEffect(() => {
    loadJobs();
    if (user?.id) {
      const myApps = lmsService.getStudentJobApplications(user.id);
      setAppliedJobs(myApps.map((a) => a.jobId));
    }
  }, [selectedLocation, selectedType, selectedLevel, searchQuery, user?.id]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    const studentId = user?.id || `guest-${Date.now()}`;
    const studentName = user?.fullName || "Dave Techs Graduate";
    const studentEmail = user?.email || "candidate@davetechs.com";
    const studentPhone = user?.phone || "+2348000000000";

    lmsService.applyForJob({
      jobId: activeJob.id,
      jobTitle: activeJob.title,
      company: activeJob.company,
      studentId,
      studentName,
      studentEmail,
      studentPhone,
      portfolioUrl: portfolioUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      coverNote: coverNote.trim() || undefined,
    });

    setAppliedJobs((prev) => [...prev, activeJob.id]);
    setApplySuccess(`Application submitted to ${activeJob.company}! Your profile has been sent to the recruiter.`);
    setTimeout(() => {
      setIsApplyModalOpen(false);
      setApplySuccess(null);
      setCoverNote("");
    }, 2000);
  };

  return (
    <div className="jobs-page section container">
      {/* Hero */}
      <div className="jobs-hero">
        <span className="badge badge--active">Dave Techs Career Marketplace</span>
        <h1 className="section__title" style={{ marginTop: "var(--sp-2)" }}>
          Launch Your Next High-Impact Tech Role
        </h1>
        <p className="section__subtitle">
          Connect directly with top tech companies, startups, and hiring partners actively seeking Dave Techs Academy trained talent.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="jobs-filter-bar card">
        <div className="jobs-search-wrap">
          <input
            type="text"
            className="form-input"
            placeholder="Search roles by title, company, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="jobs-filters-group">
          <select
            className="form-select jobs-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="all">📍 All Locations</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          <select
            className="form-select jobs-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">💼 All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>

          <select
            className="form-select jobs-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="all">🎯 All Levels</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Junior">Junior</option>
            <option value="Mid">Mid Level</option>
            <option value="Senior">Senior</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid: List & Preview */}
      <div className="jobs-layout-grid">
        {/* Left: Job Cards */}
        <div className="jobs-list">
          {jobs.length === 0 ? (
            <div className="card" style={{ padding: "var(--sp-8)", textAlign: "center" }}>
              <h3>No job listings match your current filters.</h3>
              <p className="text-muted" style={{ marginTop: "var(--sp-2)" }}>
                Try resetting your filters or search keywords.
              </p>
            </div>
          ) : (
            jobs.map((job) => {
              const isSelected = activeJob?.id === job.id;
              const hasApplied = appliedJobs.includes(job.id);

              return (
                <div
                  key={job.id}
                  className={`job-card card ${isSelected ? "job-card--selected" : ""}`}
                  onClick={() => setActiveJob(job)}
                >
                  <div className="job-card-header">
                    <div>
                      <span className="job-company">{job.company}</span>
                      <h3 className="job-title">{job.title}</h3>
                    </div>
                    {job.featured && <span className="badge badge--active">⭐ Featured</span>}
                  </div>

                  <div className="job-pills">
                    <span className="job-pill">📍 {job.location} ({job.workLocation})</span>
                    <span className="job-pill">💼 {job.jobType}</span>
                    <span className="job-pill">💰 {job.salaryRange}</span>
                  </div>

                  <div className="job-tech-stack">
                    {job.techStack.map((tech, tIdx) => (
                      <span key={tIdx} className="job-tech-chip">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="job-card-footer">
                    <span className="text-muted" style={{ fontSize: "11px" }}>
                      Posted on {job.postedDate}
                    </span>
                    {hasApplied ? (
                      <span className="badge badge--outline text-success">✓ Applied</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveJob(job);
                          setIsApplyModalOpen(true);
                        }}
                      >
                        Apply Now →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Job Full Details Preview */}
        <div className="job-preview-container">
          {activeJob ? (
            <div className="job-preview-card card">
              <div className="job-preview-header">
                <div>
                  <span className="job-company-large">{activeJob.company}</span>
                  <h2 className="job-preview-title">{activeJob.title}</h2>
                  <div className="job-preview-meta">
                    <span>📍 {activeJob.location} • {activeJob.workLocation}</span>
                    <span>💼 {activeJob.jobType}</span>
                    <span className="text-gold">💰 {activeJob.salaryRange}</span>
                  </div>
                </div>

                <div style={{ marginTop: "var(--sp-4)" }}>
                  {appliedJobs.includes(activeJob.id) ? (
                    <div className="alert alert--success">✓ You have applied for this position</div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--primary btn--glow"
                      onClick={() => setIsApplyModalOpen(true)}
                    >
                      🚀 1-Click Fast Application
                    </button>
                  )}
                </div>
              </div>

              <div className="job-preview-section">
                <h4>Role Overview</h4>
                <p>{activeJob.description}</p>
              </div>

              <div className="job-preview-section">
                <h4>Key Responsibilities</h4>
                <ul>
                  {activeJob.responsibilities.map((r, rIdx) => (
                    <li key={rIdx}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="job-preview-section">
                <h4>Candidate Requirements</h4>
                <ul>
                  {activeJob.requirements.map((req, reqIdx) => (
                    <li key={reqIdx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="job-preview-section">
                <h4>Tech Stack</h4>
                <div className="job-tech-stack">
                  {activeJob.techStack.map((tech, tIdx) => (
                    <span key={tIdx} className="job-tech-chip">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card job-preview-empty">
              <h3>Select a job opening to view full details</h3>
              <p className="text-muted">Explore partner roles and apply directly with your verified credentials.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fast Apply Modal */}
      {isApplyModalOpen && activeJob && (
        <div className="modal-overlay" onClick={() => setIsApplyModalOpen(false)}>
          <div className="modal modal--md" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Apply for {activeJob.title}</h3>
              <button
                type="button"
                className="modal__close"
                onClick={() => setIsApplyModalOpen(false)}
              >
                ×
              </button>
            </div>

            {applySuccess ? (
              <div className="alert alert--success" style={{ margin: "var(--sp-4) 0" }}>
                {applySuccess}
              </div>
            ) : (
              <form onSubmit={handleApply}>
                <p className="text-muted" style={{ fontSize: "var(--fs-xs)", marginBottom: "var(--sp-4)" }}>
                  Recruiting Company: <strong>{activeJob.company}</strong> ({activeJob.location})
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="app-portfolio">
                    Portfolio / Website URL
                  </label>
                  <input
                    id="app-portfolio"
                    type="url"
                    className="form-input"
                    placeholder="https://yourportfolio.dev"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginTop: "var(--sp-3)" }}>
                  <label className="form-label" htmlFor="app-github">
                    GitHub Profile / Capstone Repo
                  </label>
                  <input
                    id="app-github"
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginTop: "var(--sp-3)" }}>
                  <label className="form-label" htmlFor="app-cover">
                    Short Pitch / Cover Note
                  </label>
                  <textarea
                    id="app-cover"
                    className="form-input form-textarea"
                    rows={4}
                    placeholder="Why are you a great fit for this role?"
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: "var(--sp-6)", display: "flex", gap: "var(--sp-4)" }}>
                  <button type="submit" className="btn btn--primary btn--glow">
                    Confirm & Send Application
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setIsApplyModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
