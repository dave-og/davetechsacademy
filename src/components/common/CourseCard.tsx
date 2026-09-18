import React from "react";
import { Link } from "react-router-dom";
import type { Course } from "../../types";
import { formatPrice, renderStars, truncateText } from "../../utils";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card, CardImageWrapper, CardBody, CardFooter } from "../ui/Card";
import { trackApplyClick } from "../../services/analytics";
import "./CourseCard.css";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
  return (
    <Card className={`course-card ${className || ""}`}>
      <CardImageWrapper>
        <img
          src={course.image}
          alt={course.title}
          className="card__image"
          loading="lazy"
        />
        <div className="course-card__badge-overlay">
          <Badge variant="gold">{course.level}</Badge>
        </div>
      </CardImageWrapper>

      <CardBody>
        <div className="course-card__header">
          <span className="course-card__duration">
            ⏱ {course.durationWeeks} Weeks
          </span>
          <div className="course-card__rating">
            <span className="course-card__stars">{renderStars(course.rating)}</span>
            <span className="course-card__rating-num">{course.rating.toFixed(1)}</span>
            <span className="course-card__rating-count">({course.reviewCount})</span>
          </div>
        </div>

        <h3 className="card__title course-card__title">
          <Link to={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>

        <p className="card__description course-card__description">
          {truncateText(course.description, 95)}
        </p>

        <div className="course-card__modes">
          {course.learningModes.map((mode) => (
            <span key={mode} className="course-card__mode-tag">
              {mode === "online" ? "🌐 Online" : "🏫 Physical"}
            </span>
          ))}
        </div>
      </CardBody>

      <CardFooter className="course-card__footer">
        <div className="course-card__price-wrapper">
          <span className="course-card__price-label">Tuition</span>
          <span className="course-card__price">{formatPrice(course.price)}</span>
        </div>

        <div className="course-card__actions">
          <Link to={`/courses/${course.slug}`}>
            <Button variant="ghost" size="sm">
              Details
            </Button>
          </Link>
          <Link to={`/apply?course=${course.slug}`}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => trackApplyClick(course.id, course.title, "course_card", "primary")}
            >
              Apply Now
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
