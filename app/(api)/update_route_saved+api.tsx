import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, difficulty, saved } = await request.json();

    console.log(`in update_route_saved: ${clerkId}, ${difficulty}, ${saved}`);

    const recentRun = await sql`
        UPDATE running_routes
        SET is_saved = true
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
