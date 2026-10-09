"use client";

import { FolderOpen } from "lucide-react";
import { useParams } from "next/navigation";
import { ProjectForm } from "@/components/project-form";
import { ButtonLink, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const project = useStore().projects.find((p) => p.id === id);

  if (!project)
    return (
      <EmptyState
        icon={<FolderOpen size={22} />}
        title="Project not found"
        action={<ButtonLink href="/dashboard">Back to projects</ButtonLink>}
      />
    );

  return <ProjectForm key={project.id} initial={project} />;
}
