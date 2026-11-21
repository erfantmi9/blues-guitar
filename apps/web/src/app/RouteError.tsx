import { Component, type ErrorInfo, type ReactNode } from "react";
import { isRouteErrorResponse, useLocation, useNavigate, useRouteError } from "react-router";
import { RefreshCw, RotateCcw } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { isChunkLoadError } from "./errors";
import { NotFoundPage } from "./NotFoundPage";
import styles from "./Fallback.module.css";

function Fallback({ chunk, onRetry }: { chunk: boolean; onRetry: () => void }) {
  return (
    <section className={styles.box} role="alert" aria-labelledby="error-title">
      <Logo variant="mark" size={64} />
      <h1 id="error-title" className={styles.title}>
        {chunk ? "صفحه بارگذاری نشد" : "مشکلی پیش آمد"}
      </h1>
      <p className={styles.text}>
        {chunk
          ? "شاید اینترنت قطع شده، یا نسخه‌ی تازه‌ای از سایت منتشر شده است."
          : "این صفحه درست نمایش داده نشد. پیشرفت تو سر جایش است."}
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onRetry}>
          <RotateCcw size={18} aria-hidden />
          دوباره تلاش
        </button>
        <button type="button" className={styles.secondary} onClick={() => window.location.reload()}>
          <RefreshCw size={18} aria-hidden />
          بارگذاری مجدد سایت
        </button>
      </div>
    </section>
  );
}

/** errorElement of every page: inside the layout, so the menu stays usable */
export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  if (import.meta.env.DEV) console.error(error);
  // Failed module imports can be cached by the browser; a fresh document retries their download.
  const retry = () => isChunkLoadError(error)
    ? window.location.reload()
    : navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true });
  return <Fallback chunk={isChunkLoadError(error)} onRetry={retry} />;
}

/** Last resort around the whole app (e.g. the layout itself fails): never a blank page */
export class AppErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error === null) return this.props.children;
    return (
      <main className={styles.standalone}>
        <Fallback chunk={isChunkLoadError(this.state.error)} onRetry={() => this.setState({ error: null })} />
      </main>
    );
  }
}
