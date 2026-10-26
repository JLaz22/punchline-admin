import Link from "next/link";
import { allRows, Media, mediaColumns, date } from "@/lib/data";
export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    page?: string;
    saved?: string;
  }>;
}) {
  const q = await searchParams;
  const media = (await allRows<Media>("generations", mediaColumns)).reverse();
  const rows = media.filter(
    (m) =>
      (m.content + " " + m.prompt)
        .toLowerCase()
        .includes((q.q || "").toLowerCase()) &&
      (q.filter !== "unrated" || m.upvotes + m.downvotes === 0),
  );
  const page = Math.max(1, Number(q.page) || 1);
  const params = new URLSearchParams({ q: q.q || "", filter: q.filter || "" });
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">THE CREATIVE ARCHIVE</span>
          <h1>
            Media library<span>.</span>
          </h1>
          <p>Curate the good stuff. {media.length} creations and counting.</p>
        </div>
        <Link className="primary" href="/media/new">
          + Add media
        </Link>
      </div>
      {q.saved && (
        <p className="notice" role="status">
          Your changes have been saved.
        </p>
      )}
      <form className="toolbar">
        <input
          name="q"
          defaultValue={q.q}
          placeholder="Search captions or prompts"
          aria-label="Search media"
        />
        <select
          name="filter"
          defaultValue={q.filter || ""}
          aria-label="Filter media"
        >
          <option value="">All media</option>
          <option value="unrated">No votes yet</option>
        </select>
        <button className="secondary">Search</button>
      </form>
      <div className="media-grid">
        {rows.slice((page - 1) * 12, page * 12).map((m) => (
          <article className="media-card" key={m.id}>
            {m.image_url ? (
              <img
                src={m.image_url}
                alt={m.image_alt || "Media preview"}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={"text-art " + m.style}>
                <span>“</span>
                <p>{m.content}</p>
                <small>PUNCHLINE ORIGINAL</small>
              </div>
            )}
            <div className="media-info">
              <span className="eyebrow">
                #{m.id} · {m.style}
              </span>
              <h3>{m.content}</h3>
              <div className="media-meta">
                <span>
                  ↑ {m.upvotes} &nbsp; ↓ {m.downvotes}
                </span>
                <span>{date(m.created_at)}</span>
              </div>
              <Link href={"/media/" + m.id}>Inspect & edit →</Link>
            </div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <section className="card empty">
          No creations match. Try another search or add your first media.
        </section>
      )}
      <div className="pagination">
        {page > 1 && (
          <Link href={"?" + params + "&page=" + (page - 1)}>← Previous</Link>
        )}
        <span>
          {rows.length} results · Page {page}
        </span>
        {rows.length > page * 12 && (
          <Link href={"?" + params + "&page=" + (page + 1)}>Next →</Link>
        )}
      </div>
    </>
  );
}
