import { GoogleSignIn } from "@/components/google-sign-in";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; error?: string }>;
}) {
  const q = await searchParams;
  return (
    <main className="login">
      <div className="login-art">
        <span className="eyebrow">PUNCHLINE / BEHIND THE SCENES</span>
        <h1>
          Good humor.
          <br />
          Great oversight<span>.</span>
        </h1>
        <p>A little perspective on what makes the community laugh.</p>
        <div className="orbit">:)</div>
        <span className="art-foot">THE CONTROL ROOM · EST. 2026</span>
      </div>
      <section className="login-panel">
        <span className="brand">
          punchline<span>®</span>
        </span>
        <span className="eyebrow">AUTHORIZED PERSONNEL ONLY</span>
        <h2>Welcome backstage.</h2>
        <p>
          Sign in with your approved Google account to manage media and explore
          the community.
        </p>
        {q.denied && (
          <div role="alert" className="notice">
            This account does not have superadmin access. Contact the project
            owner to approve your profile.
          </div>
        )}
        {q.error && (
          <div role="alert" className="notice">
            Sign-in could not be completed. Please try again.
          </div>
        )}
        <GoogleSignIn />
        {q.denied && (
          <form action="/auth/signout" method="post">
            <button className="secondary">Sign out and switch account</button>
          </form>
        )}
        <small>Google authentication · Superadmin access required</small>
        <a href="https://humor-project-eta.vercel.app">← Back to Punchline</a>
      </section>
    </main>
  );
}
