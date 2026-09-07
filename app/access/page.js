export const metadata = {
  title: 'Private Access • Sazan Coast',
};

export default async function AccessPage({ searchParams }) {
  const params = await searchParams;
  const hasError = params?.error === '1';
  const nextPath = typeof params?.next === 'string' ? params.next : '/';

  return (
    <main className="access-page">
      <section className="access-panel">
        <img className="access-logo" src="/svg/sazan.svg" alt="Sazan Coast" />
        <span className="access-eyebrow">Private access</span>
        <h1>Enter Sazan Coast</h1>
        <p>This website is currently available by invitation.</p>

        <form action="/api/access" method="post">
          <input type="hidden" name="next" value={nextPath} />
          <label htmlFor="site-password">Password</label>
          <div className="access-field-row">
            <input
              id="site-password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              aria-invalid={hasError}
            />
            <button type="submit">Enter</button>
          </div>
          {hasError && <span className="access-error" role="alert">The password is incorrect.</span>}
        </form>
      </section>
    </main>
  );
}
