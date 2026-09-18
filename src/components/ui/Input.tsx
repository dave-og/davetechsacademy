import React from "react";
import { cn } from "../../utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isLoading?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  isLoading = false,
  id,
  className,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="form-input-wrapper">
        <input
          id={id}
          className={cn(
            "form-input",
            error && "form-input--error",
            isLoading && "form-input--loading",
            className
          )}
          {...props}
        />
        {isLoading && <span className="form-input-spinner" />}
      </div>
      {error && <span className="form-error">{error}</span>}
      {!error && helperText && (
        <span className="form-helper" style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  id,
  className,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn("form-input", "form-textarea", error && "form-input--error", className)}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};
