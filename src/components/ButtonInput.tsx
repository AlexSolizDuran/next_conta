import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

const ButtonInput: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) => {
  const base =
    "px-4 py-2 rounded-md font-medium focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-primario text-white hover:bg-secundario focus:ring-2 focus:ring-indigo-500",
    secondary:
      "bg-gray-300 text-gray-800 hover:bg-gray-400",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <span>
          <svg
            className="animate-spin h-5 w-5 inline-block mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default ButtonInput;