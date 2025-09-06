import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, params }) => {
  const { slug } = params;

  console.log(slug)

  const { data, error } = await locals.supabase
    .from('products')
    .select('*')
    .eq('uuid', slug)
    .single(); // Fetch exactly one product

    console.log(data)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!data) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};
