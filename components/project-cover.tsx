"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PosterArt } from "./poster-art";

/** Project artwork: the real cover image when there is one, otherwise generated key art. */
export function ProjectCover({
  project,
  className,
  compact,
  hideTitle,
}: {
  project: Project;
  className?: string;
  compact?: boolean;
  hideTitle?: boolean;
}) {
  // Falls back to generated art if the cover file is missing (e.g. demo pages not generated yet).
  const [failed, setFailed] = useState(false);
  if (project.cover && !failed)
    return (
      <div className={cn("relative overflow-hidden bg-black/5", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.cover}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-left"
          onContextMenu={(e) => e.preventDefault()}
          onError={() => setFailed(true)}
        />
      </div>
    );

  return (
    <PosterArt
      title={hideTitle ? "" : project.title}
      palette={project.palette}
      variant={project.posters[0]?.variant ?? 0}
      compact={compact}
      className={className}
    />
  );
}
