import type { LucideIcon } from "lucide-react";
import { AudioLines, BookOpen, Drum, GraduationCap, Guitar, House, Info, Lightbulb, ListChecks, Settings } from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /**
   * bar: in the phone's bottom bar. more: on a phone, inside «بیشتر».
   * On desktop every item is in the sidebar, in this order.
   */
  place: "bar" | "more";
};

// To add a new section: add an item here and a route in router.tsx.
export const navItems: NavItem[] = [
  { to: "/", label: "خانه", icon: House, place: "bar" },
  { to: "/path", label: "درس‌ها", icon: GraduationCap, place: "bar" },
  { to: "/practice", label: "تمرین", icon: Drum, place: "bar" },
  { to: "/backing", label: "بکینگ‌ترک", icon: AudioLines, place: "bar" },
  { to: "/glossary", label: "اصطلاحات", icon: BookOpen, place: "bar" },
  { to: "/fretboard", label: "نمودار دسته", icon: Guitar, place: "more" },
  { to: "/log", label: "گزارش‌ها", icon: ListChecks, place: "more" },
  { to: "/learn", label: "مفاهیم", icon: Lightbulb, place: "more" },
  { to: "/settings", label: "تنظیمات", icon: Settings, place: "more" },
  { to: "/about", label: "درباره", icon: Info, place: "more" },
];
