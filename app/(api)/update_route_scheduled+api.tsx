import { neon } from "@neondatabase/serverless";
import { getIsraelTimezoneOffset } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, difficulty, scheduled } = await request.json();

    console.log(`in update_route_scheduled: ${clerkId}, ${difficulty}, ${scheduled}`);

    const recentRun = await sql`
          UPDATE running_routes
          SET is_scheduled = ${scheduled}
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

    return Response.json(recentRun, { status: 200 });
  } catch (error) {
    console.log("Error updating route:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
