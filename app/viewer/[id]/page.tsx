"use client";

import { FolderOpen } from "lucide-react";
import { useParams } from "next/navigation";
import { ProjectView } from "@/components/project-view";
import { ButtonLink, EmptyState, GlassCard } from "@/components/ui";
import { useStore } from "@/lib/store";
import { isGrantLive, viewerAccess } from "@/lib/utils";

export default function ViewerProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { session, grants, projects } = useStore();
  if (!session) return null;

  const project = projects.find((p) => p.id === id);
  const grant = viewerAccess(grants, session.email).get(id);

  // Access is enforced here: no live grant, no content.
  if (!project || !grant || !isGrantLive(grant))
    return (
      <GlassCard className="mx-auto mt-10 max-w-lg">
        <EmptyState
          icon={<FolderOpen size={22} />}
          title="This project isn't available"
          body="If you think this is a mistake, please contact Jake."
          action={<ButtonLink href="/viewer">Back to projects</ButtonLink>}
        />
      </GlassCard>
    );

  // The full film needs a live grant for this project that explicitly includes it.
  const canWatchFilm = grants.some((g) => g.email === session.email && g.projectIds.includes(project.id) && g.includeFilm && isGrantLive(g));

  return <ProjectView project={project} mode="viewer" backHref="/viewer" watermark={session.email} canWatchFilm={canWatchFilm} />;
}
