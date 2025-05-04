/**
 * @description This API route updates the 'is_recent' status of a running route in the database.
 * It handles the POST request to update the route based on the provided clerkId, difficulty, and routeId.
 */
import { neon } from "@neondatabase/serverless";
import { getIsraelTimezoneOffset } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, difficulty, is_recent, route_id = null } = await request.json();
    const offset = getIsraelTimezoneOffset();

    let recentRun = [];
    if (route_id) {
      recentRun = await sql`
        UPDATE running_routes
        SET is_recent = ${is_recent}, created_at = NOW() + make_interval(hours => ${offset})
        WHERE route_id = ${route_id}
        RETURNING *
      `;
    } else {
      recentRun = await sql`
        UPDATE running_routes
        SET is_recent = ${is_recent}, created_at = NOW() + make_interval(hours => ${offset})
        WHERE clerk_id = ${clerkId}
          AND difficulty = ${difficulty}
          AND created_at = (
            SELECT MAX(created_at)
            FROM running_routes
            WHERE clerk_id = ${clerkId}
              AND difficulty = ${difficulty}
          )
        RETURNING *
      `;
    }

    return Response.json(recentRun, { status: 200 });
  } catch (error) {
    console.log("Error updating route:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
