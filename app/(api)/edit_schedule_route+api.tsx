/**
 * @description This API route is used to update the schedule of a route in the database.
 * It handles the POST request to set the is_scheduled field for a specific route based on the provided clerkId and routeId.
 */
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, routeId, scheduleDate } = await request.json();

    if (!routeId) {
      return Response.json({ error: "Missing routeId" }, { status: 400 });
    }

    const recentRuns = await sql`
        UPDATE running_routes
        SET is_scheduled = ${scheduleDate}
        WHERE clerk_id = ${clerkId}
        AND route_id = ${routeId};
    `;

    return Response.json(recentRuns, { status: 200 });
  } catch (error) {
    console.log("Error updating route:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
