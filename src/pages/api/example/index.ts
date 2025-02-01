import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      test: "หมอลำ 🧕🧕🧕🧕🧕🧕🧕🧕",
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    },
  );
};
