"use client";

import { Lock } from "lucide-react";
import { useParams } from "next/navigation";
import { ProjectView } from "@/components/project-view";
import { ButtonLink, EmptyState, GlassCard } from "@/components/ui";
import { useStore } from "@/lib/store";
import { expiryLabel, isGrantLive, viewerAccess } from "@/lib/utils";

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
          icon={<Lock size={22} />}
          title={grant ? "Your access has ended" : "This project isn't shared with you"}
          body={grant ? `${expiryLabel(grant)}. Contact Jake if you need more time.` : "Only projects shared with your email can be viewed."}
          action={<ButtonLink href="/viewer">Back to shared projects</ButtonLink>}
        />
      </GlassCard>
    );

  return <ProjectView project={project} mode="viewer" backHref="/viewer" grant={grant} watermark={session.email} />;
}
