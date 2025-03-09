import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, routeId } = await request.json();

    if (!routeId) {
      console.log("Missing routeId in request body");
      return Response.json({ error: "Missing routeId" }, { status: 400 });
    }

    const recentRuns = await sql`
        UPDATE running_routes
        SET is_deleted = TRUE
        WHERE clerk_id = ${clerkId}
        AND route_id = ${routeId};
    `;

    return Response.json(recentRuns, { status: 200 });
  } catch (error) {
    console.error("Error fetching recent routes:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
