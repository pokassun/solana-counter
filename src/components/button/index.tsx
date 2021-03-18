import React from "react";

export type IButton = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  warning?: boolean;
};

export const Button: React.FC<IButton> = ({ className = "", children, warning, ...rest }) => {
  const colorClassName = warning
    ? "bg-red-500 hover:bg-red-600"
    : "bg-green-500 hover:bg-green-600";
  return (
    <button
      className={`py-2 px-4 rounded  focus:outline-none ring-opacity-75 ring-green-400 focus:ring text-white text-lg ${
        rest.disabled && "opacity-50"
      } ${colorClassName} ${className}`}
      {...rest}>
      {children}
    </button>
  );
};

export const ButtonRadius: React.FC<IButton> = ({ className = "", children, ...rest }) => {
  return (
    <button
      className={`rounded-full shadow w-14 h-14 text-5xl flex flex-col items-center bg-blue-400 hover:bg-blue-600 focus:outline-none ring-opacity-75 ring-green-400 focus:ring text-white ${
        rest.disabled && "opacity-50"
      } ${className}`}
      {...rest}>
      {children}
    </button>
  );
};
