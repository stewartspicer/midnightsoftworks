/**
 * GET /api/license?order=<id>&email=<address>
 *
 * Serves the stored gudrun.key for an order. BOTH the order id and the email
 * must match the ledger row — an order id alone (guessable, sequential-ish)
 * must not leak a license or confirm an order exists. All failures return the
 * same 404 so responses don't distinguish "wrong email" from "no such order".
 */
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const orderId = (url.searchParams.get("order") ?? "").trim();
  const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
  if (!orderId || !email) return notFound();

  const row = await ctx.env.DB
    .prepare("SELECT email, license_file FROM orders WHERE order_id = ?")
    .bind(orderId)
    .first<{ email: string; license_file: string }>();
  if (!row || row.email !== email) return notFound();

  return new Response(row.license_file, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="gudrun.key"',
      "Cache-Control": "no-store",
    },
  });
};

const notFound = () =>
  new Response("No license found for that order + email combination.", { status: 404 });
