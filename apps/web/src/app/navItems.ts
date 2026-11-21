import type { LucideIcon } from "lucide-react";
import { AudioLines, BookOpen, Drum, GraduationCap, Guitar, House, Lightbulb, ListChecks, Settings } from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** primary: shown in the main nav (bottom bar on mobile); otherwise only in the header */
  primary: boolean;
};

// To add a new section: add an item here and a route in router.tsx.
export const navItems: NavItem[] = [
  { to: "/", label: "خانه", icon: House, primary: true },
  { to: "/path", label: "درس‌ها", icon: GraduationCap, primary: true },
  { to: "/fretboard", label: "دسته", icon: Guitar, primary: true },
  { to: "/practice", label: "تمرین", icon: Drum, primary: true },
  { to: "/backing", label: "بکینگ‌ترک", icon: AudioLines, primary: true },
  { to: "/log", label: "ثبت", icon: ListChecks, primary: true },
  { to: "/learn", label: "مفاهیم", icon: Lightbulb, primary: false },
  { to: "/glossary", label: "اصطلاحات", icon: BookOpen, primary: false },
  { to: "/settings", label: "تنظیمات", icon: Settings, primary: false },
];
