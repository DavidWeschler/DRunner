import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { clerkId, route_title, difficulty, directions, elevationGain, length, waypoints, is_saved = false, is_scheduled = false, is_deleted = false } = await request.json();

    // Validate required fields
    if (!clerkId || !route_title || !difficulty || !directions || elevationGain === undefined || length === undefined || !waypoints) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert the route into the running_routes table
    await sql`
      INSERT INTO running_routes (
        clerk_id, route_title, difficulty, directions, elevation_gain, length, waypoints, is_saved, is_scheduled, is_deleted
      ) VALUES (
        ${clerkId}, ${route_title}, ${difficulty}, ${JSON.stringify(directions)},
        ${elevationGain}, ${length}, ${JSON.stringify(waypoints)}, ${is_saved}, ${is_scheduled}, ${is_deleted}
      );
    `;

    return Response.json({ message: "Route added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding route:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
