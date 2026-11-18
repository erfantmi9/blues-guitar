import { Link } from "react-router";
import { PageHeader } from "@/components/ui/PageHeader";

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="صفحه پیدا نشد" />
      <Link to="/">بازگشت به خانه</Link>
    </>
  );
}
