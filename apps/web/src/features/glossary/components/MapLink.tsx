import { Link } from "react-router";
import { Map as MapIcon } from "lucide-react";
import styles from "../glossary.module.css";

/** Link to the interactive instrument map */
export function MapLink() {
  return (
    <Link to="/glossary/instrument" className={styles.mapLink}>
      <MapIcon size={18} aria-hidden />
      نقشه‌ی ساز
    </Link>
  );
}
