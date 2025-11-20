import React from "react";
import { Trash } from "lucide-react";

interface ButtonDeleteProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children?: React.ReactNode;
}

const ButtonDelete: React.FC<ButtonDeleteProps> = ({
  loading = false,
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`p-2 rounded hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-red-600"
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
      ) : (
        children ?? <Trash className="w-5 h-5 text-red-600" />
      )}
    </button>
  );
};

export default ButtonDelete;