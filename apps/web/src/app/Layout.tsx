import { Link, NavLink, Outlet, useNavigation } from "react-router";
import { navItems } from "./navItems";
import styles from "./Layout.module.css";

export function Layout() {
  const navigation = useNavigation();
  const primary = navItems.filter((i) => i.primary);
  const secondary = navItems.filter((i) => !i.primary);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo} aria-hidden>♪</span>
          تمرین بلوز
        </Link>
        <div className={styles.headerLinks}>
          {secondary.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={styles.iconLink} aria-label={label} title={label}>
              <Icon size={20} />
            </NavLink>
          ))}
        </div>
      </header>

      <nav className={styles.nav} aria-label="ناوبری اصلی">
        {primary.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
          >
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <main className={styles.main} aria-busy={navigation.state === "loading"}>
        <Outlet />
      </main>
    </div>
  );
}
