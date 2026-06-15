import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { IntegrationsClient } from "./client";
import { getProviderLogoUrl } from "@/lib/integration-logos";

export const metadata = { title: "Integrations" };

const RAW_INTEGRATIONS: any[] = [
  { provider: "gmail", name: "Gmail", description: "Sync emails, draft replies, surface context from threads.", category: "Communication", popular: true, authType: "oauth" },
  { provider: "google_calendar", name: "Google Calendar", description: "Protect focus time, surface meeting prep, detect scheduling conflicts.", category: "Communication", popular: true, authType: "oauth" },
  { provider: "notion", name: "Notion", description: "Find relevant pages, auto-link tasks, surface docs before meetings.", category: "Knowledge", popular: true, authType: "oauth" },
  { provider: "slack", name: "Slack", description: "Surface relevant threads, draft responses, track action items.", category: "Communication", popular: true, authType: "oauth" },
  { provider: "linear", name: "Linear", description: "Track issues, predict blockers, auto-prioritize your queue.", category: "Project Management", popular: false, authType: "oauth" },
  { provider: "github", name: "GitHub", description: "Monitor PRs, link code to tasks, surface relevant commits.", category: "Development", popular: false, authType: "oauth" },
  { provider: "figma", name: "Figma", description: "Surface design specs before reviews, link designs to tickets.", category: "Design", popular: false, authType: "oauth" },
  { provider: "hubspot", name: "HubSpot", description: "Sync contacts, prep for calls, surface deal context automatically.", category: "Sales & CRM", popular: false, authType: "oauth" },
  { provider: "asana", name: "Asana", description: "Track project health, surface overdue items, predict timeline risks.", category: "Project Management", popular: false, authType: "oauth" },
  { provider: "jira", name: "Jira", description: "Monitor sprint velocity, surface blocked issues, update statuses automatically.", category: "Development", popular: false, authType: "oauth" },
  { provider: "trello", name: "Trello", description: "Track cards, surface stalled tasks, auto-move completed items.", category: "Project Management", popular: false, authType: "oauth" },
  { provider: "google_drive", name: "Google Drive", description: "Find files instantly, surface relevant docs, auto-organize uploads.", category: "Knowledge", popular: false, authType: "oauth" },
];

const AVAILABLE_INTEGRATIONS = RAW_INTEGRATIONS.map((i) => ({
  ...i,
  logoUrl: getProviderLogoUrl(i.provider),
}));

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const connectedRaw = await prisma.integration.findMany({
    where: { userId: session.user.id, isActive: true },
    select: { provider: true, name: true, lastSyncAt: true, createdAt: true },
  });

  const connected = connectedRaw.map(c => ({
    ...c,
    provider: c.provider.toLowerCase(),
  }));

  const connectedProviders = connected.map(i => i.provider);

  return (
    <IntegrationsClient
      integrations={AVAILABLE_INTEGRATIONS}
      connected={connected}
      connectedProviders={[...connectedProviders]}
    />
  );
}
