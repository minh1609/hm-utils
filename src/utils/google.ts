/**
 * Google Drive + Google Docs API utilities
 *
 * Authentication: Service Account (recommended for server-side) or OAuth2.
 * Set credentials via environment variables or pass them directly.
 *
 * Required Google Cloud scopes:
 *   https://www.googleapis.com/auth/drive.readonly
 *   https://www.googleapis.com/auth/documents.readonly
 */

import { google } from "googleapis";
import type { JSONClient } from "google-auth-library/build/src/auth/googleauth.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GoogleAuthOptions {
  /**
   * Path to a service-account JSON key file, OR an inline service-account
   * object (the parsed contents of the key file).
   */
  keyFile?: string;
  credentials?: object;
  /**
   * OAuth2 access token — use this when authenticating via OAuth on behalf
   * of a user instead of a service account.
   */
  accessToken?: string;
}

export interface DocTab {
  tabId: string;
  title: string;
  index: number;
}

export interface DocTabsResult {
  fileId: string;
  fileName: string;
  tabs: DocTab[];
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/documents.readonly",
];

/**
 * Build an authenticated Google API client.
 * Priority: accessToken > credentials object > keyFile > Application Default Credentials
 */
export async function buildAuthClient(
  opts: GoogleAuthOptions = {}
): Promise<JSONClient> {
  if (opts.accessToken) {
    const oauth2 = new google.auth.OAuth2();
    oauth2.setCredentials({ access_token: opts.accessToken });
    return oauth2 as unknown as JSONClient;
  }

  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    ...(opts.keyFile ? { keyFile: opts.keyFile } : {}),
    ...(opts.credentials ? { credentials: opts.credentials } : {}),
  });

  return auth.getClient() as Promise<JSONClient>;
}

// ---------------------------------------------------------------------------
// Drive — list Google Docs in a folder
// ---------------------------------------------------------------------------

/**
 * List all Google Doc files directly inside a Drive folder.
 *
 * @param folderId  The Drive folder ID (the long alphanumeric string in the
 *                  folder's URL, e.g. `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`).
 * @param authClient  Authenticated client from `buildAuthClient`.
 */
export async function listGoogleDocsInFolder(
  folderId: string,
  authClient: JSONClient
): Promise<Array<{ id: string; name: string }>> {
  const drive = google.drive({ version: "v3", auth: authClient });

  const files: Array<{ id: string; name: string }> = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
      fields: "nextPageToken, files(id, name)",
      pageSize: 100,
      ...(pageToken ? { pageToken } : {}),
    });

    const items = res.data.files ?? [];
    for (const f of items) {
      if (f.id && f.name) {
        files.push({ id: f.id, name: f.name });
      }
    }

    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
}

// ---------------------------------------------------------------------------
// Docs — get top-level tabs
// ---------------------------------------------------------------------------

/**
 * Fetch the top-level tabs (nestingLevel === 0) of a single Google Doc.
 *
 * Google Docs API returns tabs in `document.tabs`. A tab with no `parentTabId`
 * (or `tabProperties.nestingLevel === 0`) is a top-level tab.
 */
export async function getTopLevelTabs(
  fileId: string,
  authClient: JSONClient
): Promise<DocTab[]> {
  const docs = google.docs({ version: "v1", auth: authClient });

  const res = await docs.documents.get({
    documentId: fileId,
    // Only fetch tab metadata — skip heavy body content
    fields: "tabs(tabProperties)",
  });

  const allTabs = res.data.tabs ?? [];

  return allTabs
    .filter((t) => (t.tabProperties?.nestingLevel ?? 0) === 0)
    .map((t, i) => ({
      tabId: t.tabProperties?.tabId ?? "",
      title: t.tabProperties?.title ?? `Tab ${i + 1}`,
      index: t.tabProperties?.index ?? i,
    }));
}

// ---------------------------------------------------------------------------
// Main convenience function
// ---------------------------------------------------------------------------

/**
 * Given a Drive folder ID, return the top-level tabs for every Google Doc
 * file found directly in that folder.
 *
 * @example
 * ```ts
 * import { buildAuthClient, getFolderDocTabs } from "./utils/google";
 *
 * const auth = await buildAuthClient({ keyFile: "./service-account.json" });
 * const results = await getFolderDocTabs("YOUR_FOLDER_ID", auth);
 * console.log(results);
 * ```
 */
export async function getFolderDocTabs(
  folderId: string,
  authClient: JSONClient
): Promise<DocTabsResult[]> {
  const files = await listGoogleDocsInFolder(folderId, authClient);

  const results = await Promise.all(
    files.map(async (file) => {
      const tabs = await getTopLevelTabs(file.id, authClient);
      return { fileId: file.id, fileName: file.name, tabs };
    })
  );

  return results;
}
