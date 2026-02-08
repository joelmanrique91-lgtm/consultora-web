import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

const isDiagEnabled = import.meta.env.DEV || import.meta.env.DIAG_ENABLED === '1';

export const POST: APIRoute = async ({ request }) => {
  if (!isDiagEnabled) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const body = await request.json();
    const outputsDir = path.resolve(process.cwd(), 'outputs', 'diag');
    await fs.mkdir(outputsDir, { recursive: true });
    const filename = `diag-${Date.now()}.json`;
    const filePath = path.join(outputsDir, filename);
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');
    return new Response(
      JSON.stringify({ saved: true, filename }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ saved: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
