import React from "react";
import "./FormInput.css";

const FormInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  label,
  name,
  error,
  className = "",
  disabled = false,
  autoComplete,
  min,
  max,
  pattern,
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`form-input ${error ? "error" : ""}`}
        disabled={disabled}
        autoComplete={autoComplete}
        min={min}
        max={max}
        pattern={pattern}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormInput;
