import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="boot">
      <h1>Checkout indisponível</h1>
      <p>Esta oferta ainda não foi publicada ou está desativada.</p>
      <Link className="secondary" href="/">
        Voltar ao painel
      </Link>
    </main>
  );
}
