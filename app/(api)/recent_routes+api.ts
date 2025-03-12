import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, maxNumOfRoutes } = await request.json();

    if (!clerkId) {
      console.log("Missing clerkId in request body");
      return Response.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const recentRuns = await sql`
        SELECT * FROM running_routes
        WHERE clerk_id = ${clerkId}
        AND is_deleted = FALSE
        AND is_scheduled IS NULL
        ORDER BY created_at DESC
        LIMIT ${maxNumOfRoutes};
    `;

    return Response.json(recentRuns, { status: 200 });
  } catch (error) {
    console.log("Error fetching recent routes:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
