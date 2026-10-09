"use client";

import { FolderOpen, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { ProjectStatus } from "@/lib/types";
import { ProjectCard } from "./project-card";
import { ButtonLink, EmptyState, Segmented, inputClass } from "./ui";
import { cn } from "@/lib/utils";

type Filter = "All" | ProjectStatus;

export function ProjectsBrowser({ initialQuery = "" }: { initialQuery?: string }) {
  const { projects, viewerCount } = useStore();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter !== "All" && p.status !== filter) return false;
      if (!q) return true;
      return [p.title, p.description, p.genre, ...p.pdfs.map((d) => d.title)].some((s) => s.toLowerCase().includes(q));
    });
  }, [projects, query, filter]);

  const count = (s: Filter) => (s === "All" ? projects.length : projects.filter((p) => p.status === s).length);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search size={17} className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects"
            className={cn(inputClass, "glass rounded-full pl-11")}
          />
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={(["All", "Active", "Draft", "Archived"] as Filter[]).map((s) => ({ value: s, label: s, count: count(s) }))}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={22} />}
          title="No projects found"
          body={query ? `Nothing matches “${query}”. Try a different search.` : "Create your first project to get started."}
          action={
            <ButtonLink href="/projects/new">
              <Plus size={16} /> New Project
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p, i) => (
            <ProjectCard key={p.id} project={p} href={`/projects/${p.id}`} viewerCount={viewerCount(p.id)} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
