// A Google OAuth Client ID is public by design — it travels in every OAuth
// request the browser makes, so it belongs in source. A client *secret* would
// not; this app has none, because the browser receives the ID token directly.
export const GOOGLE_CLIENT_ID =
  '141199993343-pqdlj9d17blsgudrcgguvp5jg4odg4q2.apps.googleusercontent.com';
