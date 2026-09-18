import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Testimonial } from "../../types";
import { renderStars } from "../../utils";
import "./TestimonialsCarousel.css";

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = testimonials.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-scroll effect with pause on hover
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, total]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (total === 0) return null;

  return (
    <div
      className="testimonials-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Student Testimonials"
    >
      <div className="testimonials-carousel__track-container">
        <div
          className="testimonials-carousel__track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((t) => (
            <div className="testimonials-carousel__slide" key={t.id}>
              <div className="testimonial-card">
                <div className="testimonial-card__header">
                  <div className="testimonial-card__avatar-wrapper">
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={t.studentName}
                        className="testimonial-card__avatar"
                        loading="lazy"
                      />
                    ) : (
                      <div className="testimonial-card__avatar-placeholder">
                        {t.studentName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="testimonial-card__meta">
                    <h4 className="testimonial-card__name">{t.studentName}</h4>
                    <p className="testimonial-card__course">{t.course}</p>
                    {t.location && (
                      <span className="testimonial-card__location">
                        📍 {t.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="testimonial-card__rating">
                  <span className="testimonial-card__stars">
                    {renderStars(t.rating)}
                  </span>
                </div>

                <p className="testimonial-card__content">"{t.content}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="testimonials-carousel__controls">
        <button
          className="testimonials-carousel__arrow testimonials-carousel__arrow--prev"
          onClick={prevSlide}
          aria-label="Previous testimonial"
        >
          ‹
        </button>

        <div className="testimonials-carousel__dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`testimonials-carousel__dot ${i === currentIndex ? "testimonials-carousel__dot--active" : ""}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentIndex ? "true" : undefined}
            />
          ))}
        </div>

        <button
          className="testimonials-carousel__arrow testimonials-carousel__arrow--next"
          onClick={nextSlide}
          aria-label="Next testimonial"
        >
          ›
        </button>
      </div>
    </div>
  );
};
