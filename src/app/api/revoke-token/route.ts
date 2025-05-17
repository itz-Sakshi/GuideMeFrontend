import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (token?.accessToken) {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `token=${token.accessToken}`,
      });
    }

    return new Response(JSON.stringify({ message: "Token revoked successfully" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Internal Server Error" + error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


