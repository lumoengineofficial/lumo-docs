import { requireAdmin } from "@/lib/auth";
import { listAssetsForModeration, listUsers } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { UsersPanel } from "@/components/admin/UsersPanel";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Manage users",
  description: "Administer accounts on the Lumo Asset Store.",
  path: "/admin/users",
});

export default async function AdminUsersPage() {
  const { profile } = await requireAdmin();
  const [users] = await Promise.all([listUsers(), listAssetsForModeration("all")]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-title">Users</h2>
        <p className="mt-1 text-sm text-muted">
          Promote trusted publishers to admin, or suspend accounts that break the guidelines.
        </p>
      </div>

      <UsersPanel users={users} currentUserId={profile.id} />
    </div>
  );
}
