import React from "react";
import { cn } from "../../utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ className, children, onClick }) => {
  return (
    <div className={cn("card", className)} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardImageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="card__image-wrapper">{children}</div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("card__body", className)}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("card__footer", className)}>{children}</div>;
