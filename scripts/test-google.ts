/**
 * Quick smoke-test for the Google Drive + Docs utility.
 *
 * Usage:
 *   npx tsx scripts/test-google.ts           # uses the hardcoded FOLDER_ID
 *   npx tsx scripts/test-google.ts <ID>      # override with a different folder
 *
 * The folder must be shared with the service account:
 *   hm-utils@hm-utils.iam.gserviceaccount.com
 */

import { buildAuthClient, getFolderDocTabs } from "../src/utils/google.ts";

const FOLDER_ID = "1hxiZ5a-W3e8MrNQjbX8kGqWghxcv1cEn";
const folderId = process.argv[2] ?? FOLDER_ID;

const auth = await buildAuthClient({ keyFile: "./service-account.json" });
const results = await getFolderDocTabs(folderId, auth);

if (results.length === 0) {
  console.log("No Google Docs found in this folder.");
  process.exit(0);
}

for (const doc of results) {
  console.log(`\n📄 ${doc.fileName} (${doc.fileId})`);
  if (doc.tabs.length === 0) {
    console.log("   (no tabs — single-tab document)");
  } else {
    for (const tab of doc.tabs) {
      console.log(`   [${tab.index}] ${tab.title}  (id: ${tab.tabId})`);
    }
  }
}
