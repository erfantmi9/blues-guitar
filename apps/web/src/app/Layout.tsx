import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigation } from "react-router";
import { Ellipsis } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "./Footer";
import { navItems, type NavItem } from "./navItems";
import styles from "./Layout.module.css";

/** /lesson/:id belongs to «درس‌ها» */
const isActive = (item: NavItem, pathname: string) =>
  item.to === "/"
    ? pathname === "/"
    : pathname === item.to || pathname.startsWith(`${item.to}/`) || (item.to === "/path" && pathname.startsWith("/lesson/"));

export function Layout() {
  const navigation = useNavigation();
  const location = useLocation();
  const more = navItems.filter((i) => i.place === "more");
  const moreActive = more.some((i) => isActive(i, location.pathname));

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand} aria-label="Slow Bend، خانه">
          <Logo size={34} animate compact />
        </Link>
      </header>

      <nav className={styles.nav} aria-label="ناوبری اصلی">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item, location.pathname);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`${styles.navItem} ${active ? styles.active : ""} ${item.place === "more" ? styles.inMore : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={1.8} aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <MoreMenu items={more} active={moreActive} pathname={location.pathname} />
      </nav>

      <main className={styles.main} aria-busy={navigation.state === "loading"}>
        {/* key = path: page change → short fade (search params like ?exercise don't trigger it) */}
        <div key={location.pathname} className={styles.page}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}

/** Phone only: the items that don't fit the bottom bar, in a small panel above it */
function MoreMenu({ items, active, pathname }: { items: NavItem[]; active: boolean; pathname: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when the page changes
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.navItem} ${styles.moreButton} ${active || open ? styles.active : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <Ellipsis size={22} strokeWidth={1.8} aria-hidden />
        <span>بیشتر</span>
      </button>
      {open && <button type="button" className={styles.backdrop} aria-label="بستن" tabIndex={-1} onClick={() => setOpen(false)} />}
      <div ref={panelRef} id={panelId} className={styles.morePanel} data-open={open || undefined} hidden={!open}>
        {items.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className={styles.moreLink} aria-current={pathname.startsWith(to) ? "page" : undefined}>
            <Icon size={20} aria-hidden />
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
