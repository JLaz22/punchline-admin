import Link from "next/link";
import { allRows, Vote, date } from "@/lib/data";
export default async function Ratings({
  searchParams,
}: {
  searchParams: Promise<{ value?: string; page?: string; q?: string }>;
}) {
  const q = await searchParams;
  const rows = (
    await allRows<Vote>("votes", "id,generation_id,user_id,value,created_at")
  ).reverse();
  const filtered = rows.filter(
    (v) =>
      (!q.value || v.value === Number(q.value)) &&
      (!q.q || String(v.generation_id) === q.q || v.user_id.includes(q.q)),
  );
  const page = Math.max(1, Number(q.page) || 1);
  const params = new URLSearchParams({ value: q.value || "", q: q.q || "" });
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">EVERY REACTION COUNTS</span>
          <h1>
            The verdict<span>.</span>
          </h1>
          <p>{rows.length} recorded votes · Read-only voting history</p>
        </div>
      </div>
      <form className="toolbar">
        <input
          name="q"
          defaultValue={q.q}
          placeholder="Media ID or voter UUID"
          aria-label="Search votes"
        />
        <select
          name="value"
          defaultValue={q.value || ""}
          aria-label="Vote type"
        >
          <option value="">All reactions</option>
          <option value="1">Upvotes</option>
          <option value="-1">Downvotes</option>
        </select>
        <button className="secondary">Filter</button>
      </form>
      <section className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reaction</th>
              <th>Media</th>
              <th>Voter</th>
              <th>Cast on</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice((page - 1) * 30, page * 30).map((v) => (
              <tr key={v.id}>
                <td>
                  <span
                    className={
                      "pill " + (v.value === 1 ? "positive" : "negative")
                    }
                  >
                    {v.value === 1 ? "↑ Upvote" : "↓ Downvote"}
                  </span>
                </td>
                <td>
                  <Link href={"/media/" + v.generation_id}>
                    Creation #{v.generation_id} ↗
                  </Link>
                </td>
                <td className="mono">{v.user_id}</td>
                <td>{date(v.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="empty">No votes match these filters.</p>
        )}
        <div className="pagination">
          {page > 1 && (
            <Link href={"?" + params + "&page=" + (page - 1)}>← Previous</Link>
          )}
          <span>
            {filtered.length} results · Page {page}
          </span>
          {filtered.length > page * 30 && (
            <Link href={"?" + params + "&page=" + (page + 1)}>Next →</Link>
          )}
        </div>
      </section>
    </>
  );
}
