import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { CourseCard } from "../../components/common/CourseCard";
import { Button } from "../../components/ui/Button";
import { courses, courseCategories } from "../../data/courses";
import type { LearningMode } from "../../types";
import { trackSearch, trackFilter } from "../../services/analytics";
import "./Courses.css";

type SortOption = "popular" | "newest" | "price-asc" | "price-desc" | "rating" | "duration";
type PriceRangeOption = "all" | "under-50" | "50-75" | "above-75";
type DurationOption = "all" | "short" | "medium" | "long";

export const Courses: React.FC = () => {
  useSEO({
    title: "Explore Technology Courses & Programs",
    description:
      "Explore 20+ in-demand practical technology courses at Dave Techs Academy. Learn Frontend, Backend, UI/UX, AI, Data Science, Cybersecurity and more with online & physical options.",
  });

  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<PriceRangeOption>("all");
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync URL search params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Track search query with debounce
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      trackSearch(searchQuery.trim(), filteredCourses.length);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Track filter adjustments
  useEffect(() => {
    if (selectedCategory !== "all" || selectedLevel !== "all" || selectedMode !== "all") {
      trackFilter(selectedCategory, selectedLevel, selectedMode, filteredCourses.length);
    }
  }, [selectedCategory, selectedLevel, selectedMode]);

  // Simulate subtle loading state when switching categories
  const handleCategoryChange = (cat: string) => {
    setIsLoading(true);
    setSelectedCategory(cat);
    if (cat === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedMode("all");
    setSelectedPrice("all");
    setSelectedDuration("all");
    setSortBy("popular");
    setSearchParams({});
  };

  // Filter and sort logic
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.level.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (selectedCategory !== "all") {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // 3. Level filter
    if (selectedLevel !== "all") {
      result = result.filter((c) => c.level === selectedLevel);
    }

    // 4. Mode filter
    if (selectedMode !== "all") {
      result = result.filter((c) => c.learningModes.includes(selectedMode as LearningMode));
    }

    // 5. Price filter
    if (selectedPrice === "under-50") {
      result = result.filter((c) => c.price < 50_000);
    } else if (selectedPrice === "50-75") {
      result = result.filter((c) => c.price >= 50_000 && c.price <= 75_000);
    } else if (selectedPrice === "above-75") {
      result = result.filter((c) => c.price > 75_000);
    }

    // 6. Duration filter
    if (selectedDuration === "short") {
      result = result.filter((c) => c.durationWeeks <= 6);
    } else if (selectedDuration === "medium") {
      result = result.filter((c) => c.durationWeeks >= 7 && c.durationWeeks <= 10);
    } else if (selectedDuration === "long") {
      result = result.filter((c) => c.durationWeeks >= 11);
    }

    // 7. Sorting
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        result.sort((a, b) => b.price - a.price); // Deterministic ordering
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "duration":
        result.sort((a, b) => a.durationWeeks - b.durationWeeks);
        break;
      default:
        break;
    }

    return result;
  }, [
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedMode,
    selectedPrice,
    selectedDuration,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedLevel !== "all" ? 1 : 0) +
    (selectedMode !== "all" ? 1 : 0) +
    (selectedPrice !== "all" ? 1 : 0) +
    (selectedDuration !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="courses-page">
      {/* ─── Hero Header ─────────────────────────────────── */}
      <section className="courses-page__hero">
        <div className="container">
          <div className="courses-page__hero-content">
            <span className="courses-page__badge">Explore 20+ Tech Tracks</span>
            <h1 className="courses-page__title">
              Our Professional <span className="text-gold">Course Catalogue</span>
            </h1>
            <p className="courses-page__subtitle">
              Choose from industry-standard programs in software engineering, data, design, cybersecurity, and emerging technologies. Study online or in-person at our physical branches.
            </p>
          </div>

          {/* Search & Quick Category Strip */}
          <div className="courses-page__search-bar">
            <div className="courses-page__search-input-wrapper">
              <span className="courses-page__search-icon">🔍</span>
              <input
                type="text"
                className="courses-page__search-input"
                placeholder="Search courses by skill, title, or keyword (e.g. Python, React, Cybersecurity)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search courses"
              />
              {searchQuery && (
                <button
                  className="courses-page__search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              className={`courses-page__filter-toggle-btn ${mobileFilterOpen ? "courses-page__filter-toggle-btn--active" : ""}`}
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              aria-label="Toggle filter sidebar"
            >
              <span>⚙️ Filters</span>
              {activeFiltersCount > 0 && (
                <span className="courses-page__filter-count-badge">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Category Quick Chips */}
          <div className="courses-page__category-chips">
            <button
              className={`courses-page__category-chip ${selectedCategory === "all" ? "courses-page__category-chip--active" : ""}`}
              onClick={() => handleCategoryChange("all")}
            >
              All Courses ({courses.length})
            </button>
            {courseCategories.map((cat) => {
              const count = courses.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  className={`courses-page__category-chip ${selectedCategory === cat ? "courses-page__category-chip--active" : ""}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Main Content ────────────────────────────────── */}
      <section className="courses-page__main section">
        <div className="container courses-page__layout">
          {/* Filters Sidebar */}
          <aside
            className={`courses-page__sidebar ${mobileFilterOpen ? "courses-page__sidebar--open" : ""}`}
          >
            <div className="courses-page__sidebar-header">
              <h3 className="courses-page__sidebar-title">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  className="courses-page__reset-btn"
                  onClick={handleResetFilters}
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div className="filter-group">
              <h4 className="filter-group__title">Skill Level</h4>
              <div className="filter-group__options">
                {[
                  { value: "all", label: "All Levels" },
                  { value: "Beginner", label: "Beginner" },
                  { value: "Intermediate", label: "Intermediate" },
                  { value: "Beginner/Intermediate", label: "Beginner / Intermediate" },
                ].map((opt) => (
                  <label key={opt.value} className="filter-option">
                    <input
                      type="radio"
                      name="level"
                      value={opt.value}
                      checked={selectedLevel === opt.value}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    />
                    <span className="filter-option__label">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Learning Mode Filter */}
            <div className="filter-group">
              <h4 className="filter-group__title">Learning Mode</h4>
              <div className="filter-group__options">
                {[
                  { value: "all", label: "All Modes" },
                  { value: "online", label: "🌐 Online Only / Hybrid" },
                  { value: "physical", label: "🏫 Physical Classes" },
                ].map((opt) => (
                  <label key={opt.value} className="filter-option">
                    <input
                      type="radio"
                      name="mode"
                      value={opt.value}
                      checked={selectedMode === opt.value}
                      onChange={(e) => setSelectedMode(e.target.value)}
                    />
                    <span className="filter-option__label">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h4 className="filter-group__title">Tuition Price</h4>
              <div className="filter-group__options">
                {[
                  { value: "all", label: "All Prices" },
                  { value: "under-50", label: "Under ₦50,000" },
                  { value: "50-75", label: "₦50,000 – ₦75,000" },
                  { value: "above-75", label: "₦75,000 & Above" },
                ].map((opt) => (
                  <label key={opt.value} className="filter-option">
                    <input
                      type="radio"
                      name="price"
                      value={opt.value}
                      checked={selectedPrice === opt.value}
                      onChange={(e) => setSelectedPrice(e.target.value as PriceRangeOption)}
                    />
                    <span className="filter-option__label">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div className="filter-group">
              <h4 className="filter-group__title">Duration</h4>
              <div className="filter-group__options">
                {[
                  { value: "all", label: "All Durations" },
                  { value: "short", label: "Up to 6 Weeks" },
                  { value: "medium", label: "7 – 10 Weeks" },
                  { value: "long", label: "11+ Weeks" },
                ].map((opt) => (
                  <label key={opt.value} className="filter-option">
                    <input
                      type="radio"
                      name="duration"
                      value={opt.value}
                      checked={selectedDuration === opt.value}
                      onChange={(e) => setSelectedDuration(e.target.value as DurationOption)}
                    />
                    <span className="filter-option__label">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Close button for mobile */}
            <div className="courses-page__sidebar-mobile-close">
              <Button
                variant="primary"
                size="md"
                className="courses-page__apply-filters-btn"
                onClick={() => setMobileFilterOpen(false)}
              >
                View {filteredCourses.length} Courses
              </Button>
            </div>
          </aside>

          {/* Catalog Grid Area */}
          <div className="courses-page__content">
            {/* Toolbar */}
            <div className="courses-page__toolbar">
              <div className="courses-page__results-count">
                Showing <strong>{filteredCourses.length}</strong> of {courses.length} courses
                {selectedCategory !== "all" && (
                  <span className="courses-page__active-chip">
                    in <em>{selectedCategory}</em>
                  </span>
                )}
              </div>

              <div className="courses-page__sort-wrapper">
                <label htmlFor="course-sort" className="courses-page__sort-label">
                  Sort By:
                </label>
                <select
                  id="course-sort"
                  className="courses-page__sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="duration">Shortest Duration</option>
                </select>
              </div>
            </div>

            {/* Loading Skeletons */}
            {isLoading ? (
              <div className="grid grid--3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="course-card-skeleton">
                    <div className="skeleton" style={{ height: "180px" }} />
                    <div style={{ padding: "var(--sp-4)" }}>
                      <div className="skeleton" style={{ height: "20px", width: "70%", marginBottom: "var(--sp-3)" }} />
                      <div className="skeleton" style={{ height: "14px", width: "100%", marginBottom: "var(--sp-2)" }} />
                      <div className="skeleton" style={{ height: "14px", width: "85%", marginBottom: "var(--sp-4)" }} />
                      <div className="skeleton" style={{ height: "36px", width: "100%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid--3">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              /* Empty Search State */
              <div className="courses-page__empty-state">
                <div className="courses-page__empty-icon">🔎</div>
                <h3 className="courses-page__empty-title">No Courses Found</h3>
                <p className="courses-page__empty-desc">
                  We couldn't find any courses matching your current search criteria or active filters. Try clearing some filters or searching for another keyword.
                </p>
                <Button variant="primary" size="md" onClick={handleResetFilters}>
                  Reset All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
