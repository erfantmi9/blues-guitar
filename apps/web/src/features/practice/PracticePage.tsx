import { PageHeader } from "@/components/ui/PageHeader";
import { ExercisesSection } from "./components/ExercisesSection";
import { Metronome } from "./components/Metronome";

export function PracticePage() {
  return (
    <>
      <PageHeader title="استودیوی تمرین" subtitle="مترونوم و تمرین‌های تب" />
      <Metronome />
      <ExercisesSection />
    </>
  );
}
