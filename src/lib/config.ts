import type { AuthConfig } from "../types";

export function getAuthConfig(): AuthConfig {
	const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
	const clientSecret = process.env.CLIENT_SECRET;
	const authServerEndpoint = process.env.NEXT_PUBLIC_AUTH_SERVER_ENDPOINT;

	if (!clientId) {
		throw new Error(
			"NEXT_PUBLIC_CLIENT_ID environment variable is required"
		);
	}
	if (!clientSecret) {
		throw new Error("CLIENT_SECRET environment variable is required");
	}
	if (!authServerEndpoint) {
		throw new Error(
			"NEXT_PUBLIC_AUTH_SERVER_ENDPOINT environment variable is required"
		);
	}

	return {
		clientId,
		clientSecret,
		authServerEndpoint: authServerEndpoint.replace(/\/$/, ""), // Remove trailing slash
	};
}

let publicKey: string | null = null;

export async function getPublicKey(): Promise<string> {
	if (publicKey) {
		return publicKey;
	}

	const config = getAuthConfig();
	const credentials = Buffer.from(
		`${config.clientId}:${config.clientSecret}`
	).toString("base64");

	const response = await fetch(`${config.authServerEndpoint}/client/me`, {
		method: "GET",
		headers: {
			Authorization: `Basic ${credentials}`,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch public key from auth server");
	}

	const data = await response.json();
	if (!data.public_key) {
		throw new Error("Public key missing in response");
	}
	publicKey = data.public_key as string;
	return publicKey;
}
