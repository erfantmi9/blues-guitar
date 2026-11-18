import type { ButtonHTMLAttributes } from "react";
import styles from "./ui.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  block?: boolean;
};

export function Button({ variant = "secondary", block, className = "", type = "button", ...rest }: Props) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${block ? styles.block : ""} ${className}`}
      {...rest}
    />
  );
}
