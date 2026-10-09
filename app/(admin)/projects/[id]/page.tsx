"use client";

import { FolderOpen } from "lucide-react";
import { useParams } from "next/navigation";
import { ProjectView } from "@/components/project-view";
import { ButtonLink, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, session } = useStore();
  const project = projects.find((p) => p.id === id);

  if (!project)
    return (
      <EmptyState
        icon={<FolderOpen size={22} />}
        title="Project not found"
        action={<ButtonLink href="/dashboard">Back to projects</ButtonLink>}
      />
    );

  // Owner sees their own watermark, mirroring what viewers see.
  return <ProjectView project={project} mode="admin" backHref="/dashboard" watermark={session?.email} />;
}
