import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    const keycloakBaseUrl = process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/my-ecosystem";
    const adminClientId = process.env.KEYCLOAK_CLIENT_ID || "survey-frontend";
    const adminClientSecret = process.env.KEYCLOAK_CLIENT_SECRET || "";

    // Step A: Obtain Admin Access Token from Keycloak
    const tokenRes = await fetch(`${keycloakBaseUrl}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: adminClientId,
        client_secret: adminClientSecret,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || "Admin auth failed");

    // Extract realm name from issuer URL (e.g. http://localhost:8080/realms/my-ecosystem -> my-ecosystem)
    const realmName = keycloakBaseUrl.split("/realms/")[1] || "my-ecosystem";
    const keycloakAdminUrl = `${keycloakBaseUrl.split("/realms/")[0]}/admin/realms/${realmName}/users`;

    // Step B: Create User in Keycloak
    const createUserRes = await fetch(keycloakAdminUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        enabled: true,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false,
          },
        ],
      }),
    });

    if (createUserRes.status === 201) {
      return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    }

    const errorData = await createUserRes.json();
    return NextResponse.json({ error: errorData.errorMessage || "Registration failed" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}