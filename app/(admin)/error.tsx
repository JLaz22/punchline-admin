"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="card">
      <h1>We couldn’t load this view.</h1>
      <p>The database may be unavailable, or your access may have changed.</p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
