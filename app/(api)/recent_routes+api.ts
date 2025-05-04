/**
 * @description This API route fetches the most recent running routes for a given user.
 * It handles the POST request to retrieve the routes from the running_routes table based on the provided clerkId and maxNumOfRoutes.
 */
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, maxNumOfRoutes } = await request.json();

    if (!clerkId) {
      return Response.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const recentRuns = await sql`
        SELECT * FROM running_routes
        WHERE clerk_id = ${clerkId}
        AND is_recent = TRUE
        AND is_deleted = FALSE
        ORDER BY created_at DESC
        LIMIT ${maxNumOfRoutes};
    `;

    return Response.json(recentRuns, { status: 200 });
  } catch (error) {
    console.log("Error fetching recent routes:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
