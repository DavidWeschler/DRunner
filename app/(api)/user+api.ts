import { neon } from "@neondatabase/serverless";

const routes = [
  {
    route_title: "Test",
    difficulty: "easy",
    directions: "ececEw{zsEGg@jB]MsAlBYj@OPM?AAA?E@CBGBAKYaAmBOe@M}@GiGUwKMI?E?A?C@C@AyCsEYBs@Iy@c@}@m@OQMSIW?Kd@eAHOGIQMEQUuB?kCE_BqBBpBCD~AfGGLEBAz@A^A?z@Db@?AB?BAH@RHJBr@IjBKJ|F~BFlF\\hJb@n@?xCHn@BF?G?o@CyCIo@?cBI?tA?rA?vBDzANbEHzBwBHeAFaAFyCRmEZe@D[JcCbAOFBxD@TL|@Nd@`AlBJXA?CBABAF@D?@QLk@NmBXLrAkB\\Ff@",
    elevationGain: 28.37733078002933,
    length: 3.921,
    waypoints: [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ],
    is_saved: true,
    is_scheduled: false,
    is_deleted: false,
  },
];

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Create the running_routes table if it doesn't exist.
    await sql`
      CREATE TABLE IF NOT EXISTS running_routes (
        route_id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(255) REFERENCES users(clerk_id) ON DELETE CASCADE,
        route_title TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        directions JSONB NOT NULL,
        elevation_gain FLOAT NOT NULL,
        length FLOAT NOT NULL,
        waypoints JSONB NOT NULL,
        is_saved BOOLEAN DEFAULT FALSE,
        is_scheduled BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE
      );
    `;

    const { name, email, clerkId } = await request.json();

    if (!name || !email || !clerkId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert user and return the clerk_id
    const userResponse = await sql`
      INSERT INTO users (name, email, clerk_id) 
      VALUES (${name}, ${email}, ${clerkId})
      RETURNING clerk_id;
    `;

    const userClerkId = userResponse[0]?.clerk_id;
    if (!userClerkId) {
      return Response.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Insert running routes if provided
    if (routes && Array.isArray(routes) && routes.length > 0) {
      for (const route of routes) {
        const { route_title, difficulty, directions, elevationGain, length, waypoints, is_saved = false, is_scheduled = false, is_deleted = false } = route;

        await sql`
          INSERT INTO running_routes (
            clerk_id, route_title, difficulty, directions, elevation_gain, length, waypoints, is_saved, is_scheduled, is_deleted
          ) VALUES (
            ${userClerkId}, ${route_title}, ${difficulty}, ${JSON.stringify(directions)},
            ${elevationGain}, ${length}, ${JSON.stringify(waypoints)}, ${is_saved}, ${is_scheduled}, ${is_deleted}
          );
        `;
      }
    }

    return new Response(JSON.stringify({ message: "User and routes created successfully", clerkId: userClerkId }), { status: 201 });
  } catch (error) {
    console.error("Error creating user and routes:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
