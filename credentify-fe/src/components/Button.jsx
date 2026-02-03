import React from "react";

//reusable komponenta koja ce nam pomoci da lakse prosledimo kog je tipa dugme i da stilizujemo
export default function Button({ variant = "primary", className = "", ...props }) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
      ? "btn-secondary"
      : variant === "danger"
      ? "btn-danger"
      : "btn-ghost";

  return <button className={`btn ${variantClass} ${className}`} {...props} />;
}
