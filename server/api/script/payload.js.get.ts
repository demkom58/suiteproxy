// server/api/script/payload.js.get.ts
export default defineEventHandler(async (event) => {
  // Nitro automatically mounts 'server/assets' to 'assets:server'
  const script = await useStorage('assets:server').getItem('payload.js');

  if (!script) {
    throw createError({
      statusCode: 404,
      statusMessage: "Payload script not found in server assets"
    });
  }

  setResponseHeader(event, 'Content-Type', 'application/javascript');
  // Cache control: 1 hour, stale-while-revalidate
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, stale-while-revalidate=600');
  
  return script;
});