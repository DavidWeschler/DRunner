/**
 * @file update_route_saved.tsx
 * @description This file contains the API route for updating the saved status of a running route in the database.
 */
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, difficulty, saved } = await request.json();


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
