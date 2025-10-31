import React from "react";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
}) => (
  <div className="mb-4 w-full max-w-lg">
    <label
      htmlFor={name}
      className="block font-bold text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full px-3 py-2 border rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition
        ${error ? "border-red-500" : "border-gray-300"}
        text-base
      `}
    />
    {error && (
      <span className="text-red-500 text-sm">{error}</span>
    )}
  </div>
);

export default FormInput;