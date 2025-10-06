export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/askdb/:path*",
        "/api/query",
        "/api/schema",
        "/api/usage/:path*",
        "/account",
        "/billing",
        "/admin",
    ],
};


