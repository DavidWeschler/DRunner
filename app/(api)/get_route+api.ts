import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId } = await request.json();

    // Validate required fields
    if (!clerkId) {
      return Response.json({ error: "Missing required clerkId" }, { status: 400 });
    }

    // Build the query to retrieve only the waypoints and directions of the most recent route based on clerkId
    const query = sql`
      SELECT waypoints, directions FROM running_routes
      WHERE clerk_id = ${clerkId}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    // Directly get the result from the query
    const route = await query;

    if (!route || route.length === 0) {
      return Response.json({ error: "Route not found" }, { status: 404 });
    }

    // Return only waypoints and directions
    return Response.json({ waypoints: route[0].waypoints, directions: route[0].directions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching route:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
