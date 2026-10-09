"use client";

import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProjectsBrowser } from "@/components/projects-browser";
import { ButtonLink, PageHeader } from "@/components/ui";

function ProjectsInner() {
  const q = useSearchParams().get("q") ?? "";
  // Keyed on the query so a new top-bar search resets the browser.
  return <ProjectsBrowser key={q} initialQuery={q} />;
}

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="All Projects"
        subtitle="Every film, deck, poster and trailer in your private library."
        actions={
          <ButtonLink href="/projects/new">
            <Plus size={16} /> New Project
          </ButtonLink>
        }
      />
      <Suspense>
        <ProjectsInner />
      </Suspense>
    </>
  );
}
