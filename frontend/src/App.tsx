export function App(): JSX.Element {
  const appTitle = import.meta.env.VITE_APP_TITLE ?? 'Conduit';
  return (
    <main className="container py-5">
      <h1>{appTitle}</h1>
      <p className="text-muted">
        Scaffolding placeholder — fe-shell-router #7 will install HashRouter and shell components.
      </p>
    </main>
  );
}
