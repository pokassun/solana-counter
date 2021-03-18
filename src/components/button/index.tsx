import React from "react";

export type IButton = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const Button: React.FC<IButton> = ({ className = "", children, ...rest }) => {
  return (
    <button
      className={`rounded bg-green-500 hover:bg-green-600 focus:outline-none ring-opacity-75 ring-green-400 focus:ring text-white text-lg ${
        rest.disabled && "opacity-50"
      } ${className}`}
      {...rest}>
      {children}
    </button>
  );
};
