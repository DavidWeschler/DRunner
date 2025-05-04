/**
 * @description This API route fetches the most recent running route for a given clerkId from the database.
 * It handles the POST request to retrieve the route from the running_routes table based on the provided clerkId.
 */
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId } = await request.json();

    if (!clerkId) {
      return Response.json({ error: "Missing required clerkId" }, { status: 400 });
    }
    const query = sql`
      SELECT waypoints, directions FROM running_routes
      WHERE clerk_id = ${clerkId}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const route = await query;

    if (!route || route.length === 0) {
      return Response.json({ error: "Route not found" }, { status: 404 });
    }

    return Response.json({ waypoints: route[0].waypoints, directions: route[0].directions }, { status: 200 });
  } catch (error) {
    console.log("Error fetching route:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
