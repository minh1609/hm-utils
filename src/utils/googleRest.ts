/**
 * Browser-compatible Google Drive + Docs REST API utilities.
 * Uses fetch + an OAuth2 access token (no Node.js googleapis SDK).
 */

export interface DocTab {
  tabId: string;
  title: string;
  index: number;
  docId: string;
  docName: string;
  /** Deep-link URL to open this tab in Google Docs */
  url: string;
}

// ---------------------------------------------------------------------------
// Drive — list Google Docs in a folder
// ---------------------------------------------------------------------------

async function listGoogleDocsInFolder(
  folderId: string,
  accessToken: string,
): Promise<Array<{ id: string; name: string }>> {
  const files: Array<{ id: string; name: string }> = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
      fields: "nextPageToken, files(id, name)",
      pageSize: "100",
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) throw new Error(`Drive API error: ${res.status} ${res.statusText}`);

    const data = await res.json() as {
      nextPageToken?: string;
      files?: Array<{ id: string; name: string }>;
    };

    for (const f of data.files ?? []) {
      if (f.id && f.name) files.push({ id: f.id, name: f.name });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

// ---------------------------------------------------------------------------
// Docs — get top-level tabs for a single document
// ---------------------------------------------------------------------------

interface RawTabProperties {
  tabId?: string;
  title?: string;
  index?: number;
  nestingLevel?: number;
}

async function getTopLevelTabs(
  fileId: string,
  fileName: string,
  accessToken: string,
): Promise<DocTab[]> {
  const params = new URLSearchParams({ fields: "tabs(tabProperties)" });

  const res = await fetch(
    `https://docs.googleapis.com/v1/documents/${fileId}?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) throw new Error(`Docs API error: ${res.status} ${res.statusText}`);

  const data = await res.json() as { tabs?: Array<{ tabProperties?: RawTabProperties }> };

  return (data.tabs ?? [])
    .filter((t) => (t.tabProperties?.nestingLevel ?? 0) === 0)
    .map((t, i) => {
      const tabId = t.tabProperties?.tabId ?? "";
      return {
        tabId,
        title: t.tabProperties?.title ?? `Tab ${i + 1}`,
        index: t.tabProperties?.index ?? i,
        docId: fileId,
        docName: fileName,
        url: `https://docs.google.com/document/d/${fileId}/edit?tab=t.${tabId}`,
      };
    });
}

// ---------------------------------------------------------------------------
// Main — fetch all top-level tabs from every doc in a folder
// ---------------------------------------------------------------------------

export async function fetchFolderDocTabs(
  folderId: string,
  accessToken: string,
): Promise<DocTab[]> {
  const files = await listGoogleDocsInFolder(folderId, accessToken);

  const perDoc = await Promise.all(
    files.map((f) => getTopLevelTabs(f.id, f.name, accessToken)),
  );

  return perDoc.flat();
}
