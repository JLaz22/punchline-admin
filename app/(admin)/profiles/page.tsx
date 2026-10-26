import { allRows, Profile, name, date } from "@/lib/data";
export default async function Profiles({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const q = await searchParams;
  const rows = await allRows<Profile>(
    "profiles",
    "id,first_name,last_name,is_superadmin,created_at",
  );
  const filtered = rows.filter((p) =>
    (name(p) + " " + p.id).toLowerCase().includes((q.q || "").toLowerCase()),
  );
  const page = Math.max(1, Number(q.page) || 1);
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">THE PEOPLE BEHIND THE PUNCHLINES</span>
          <h1>
            Community<span>.</span>
          </h1>
          <p>{rows.length} profiles · Read-only directory</p>
        </div>
      </div>
      <form className="toolbar">
        <input
          name="q"
          defaultValue={q.q}
          placeholder="Search name or profile ID"
          aria-label="Search profiles"
        />
        <button className="secondary">Search</button>
      </form>
      <section className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Profile ID</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice((page - 1) * 30, page * 30).map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{name(p)}</b>
                </td>
                <td className="mono">{p.id}</td>
                <td>
                  <span className="pill">
                    {p.is_superadmin ? "Superadmin" : "Member"}
                  </span>
                </td>
                <td>{date(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="empty">No profiles match this search.</p>
        )}
        <div className="pagination">
          {page > 1 && (
            <a
              href={
                "?q=" + encodeURIComponent(q.q || "") + "&page=" + (page - 1)
              }
            >
              ← Previous
            </a>
          )}
          <span>
            {filtered.length} results · Page {page}
          </span>
          {filtered.length > page * 30 && (
            <a
              href={
                "?q=" + encodeURIComponent(q.q || "") + "&page=" + (page + 1)
              }
            >
              Next →
            </a>
          )}
        </div>
      </section>
    </>
  );
}
