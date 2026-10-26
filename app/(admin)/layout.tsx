import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();
  return (
    <div className="shell">
      <aside>
        <Link className="brand" href="/">
          punchline<span>®</span>
        </Link>
        <span className="workspace">CONTROL ROOM</span>
        <nav>
          <Link href="/">
            ◈ <span>Overview</span>
          </Link>
          <Link href="/media">
            ▧ <span>Media library</span>
          </Link>
          <Link href="/profiles">
            ◉ <span>People</span>
          </Link>
          <Link href="/ratings">
            ↗ <span>Ratings</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <a
            href="https://humor-project-eta.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            Open live app ↗
          </a>
          <div className="account">
            <span className="avatar">
              {(profile.first_name || user.email || "A")[0].toUpperCase()}
            </span>
            <div>
              <b>{profile.first_name || "Administrator"}</b>
              <small>Superadmin</small>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-button">Sign out →</button>
          </form>
        </div>
      </aside>
      <div className="main">
        <header>
          <span>
            Workspace / <b>Punchline</b>
          </span>
          <span className="status">● Restricted workspace</span>
        </header>
        <main>{children}</main>
        <footer>
          PUNCHLINE CONTROL ROOM <span>Live database · All times UTC</span>
        </footer>
      </div>
    </div>
  );
}
