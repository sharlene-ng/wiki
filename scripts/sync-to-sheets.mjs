/**
 * sync-to-sheets.mjs
 * Syncs AIA Tools Hub data to Google Sheets.
 *
 * First run: opens browser for Google auth → saves token locally
 * After that: runs silently, no auth needed
 *
 * Usage: node scripts/sync-to-sheets.mjs
 */

import { google } from "googleapis";
import { createServer } from "http";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { open } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SPREADSHEET_ID = "1Xz9YY-jOLus5XTO1RgyYKnrE8gRxOrEa4WzARiMT3DA";
const SHEET_NAME = "AIA Tools Hub";
const TOKEN_PATH = path.join(__dirname, ".google-token.json");
const CREDENTIALS_PATH = path.join(__dirname, ".google-credentials.json");

// ─── DATA ──────────────────────────────────────────────────────────────────
const TOOLS = [
  // Category, Tool Name, Users, Description, URL
  ["Super Strong AI Brain", "ChatGPT",          1873, "Writing / analysis / code — most stable overall",              "https://chat.openai.com"],
  ["Super Strong AI Brain", "Claude",            1643, "Long-form text — more human expression",                       "https://claude.ai"],
  ["Super Strong AI Brain", "Gemini",            1403, "Google multimodal — research + design + video",                "https://gemini.google.com"],
  ["Super Strong AI Brain", "Deepseek",           974, "Open-source — strong reasoning and economical",               "https://chat.deepseek.com"],
  ["Super Strong AI Brain", "豆包 (Doubao)",       714, "Bytedance assistant — great for Chinese content",             "https://www.doubao.com"],
  ["Super Strong AI Brain", "GROK",               583, "Real-time web — humor-focused",                               "https://grok.x.ai"],

  ["Vibecoding",            "Cursor",            1437, "AI code editor — code generation for developers",             "https://cursor.sh"],
  ["Vibecoding",            "GitHub",             967, "Code hosting + Copilot AI",                                   "https://github.com"],
  ["Vibecoding",            "Vercel",             654, "Frontend deployment platform",                                 "https://vercel.com"],
  ["Vibecoding",            "Obsidian",           423, "Local-first knowledge management",                            "https://obsidian.md"],
  ["Vibecoding",            "Google Antigravity", 287, "No-code web / product building",                              "https://labs.google/antigravity"],

  ["AI Design",             "Midjourney",        1159, "High-quality image generation",                               "https://www.midjourney.com"],
  ["AI Design",             "Canva",              832, "Popular design platform for presentations and posters",       "https://www.canva.com"],
  ["AI Design",             "Figma",              765, "Professional UI/UX design standard",                          "https://www.figma.com"],
  ["AI Design",             "Google Stitch",      342, "Web / app UI design tool",                                    "https://stitch.withgoogle.com"],
  ["AI Design",             "NanoBanana",         215, "Quick creative imagery via Gemini",                           "https://nanobanana.ai"],
  ["AI Design",             "Higgsfield",         178, "Visual generation for novel content",                         "https://higgsfield.ai"],
  ["AI Design",             "DesignKit",          143, "Meitu product / ad image tool",                               "https://www.designkit.com"],

  ["AI Video",              "Runway",             927, "Professional video generation + editing",                     "https://runwayml.com"],
  ["AI Video",              "VEO3",               687, "Google DeepMind text-to-video (premium)",                     "https://deepmind.google/veo"],
  ["AI Video",              "Kling",              534, "Kuaishou video generation — cinematic realism",               "https://klingai.com"],
  ["AI Video",              "ElevenLabs",         412, "Multilingual voice synthesis",                                "https://elevenlabs.io"],
  ["AI Video",              "HeyGen",             389, "Digital human video platform",                                "https://www.heygen.com"],
  ["AI Video",              "Seedance",           267, "Bytedance dance / motion video generator",                    "https://seedance.ai"],
  ["AI Video",              "hifly.cc",           198, "Budget digital human tool",                                   "https://hifly.cc"],

  ["Making Presentations",  "Gamma",              653, "Single-sentence PPT generation",                              "https://gamma.app"],
  ["Making Presentations",  "Notebook LM",        487, "Google note tool with auto-PPT generation",                   "https://notebooklm.google.com"],
  ["Making Presentations",  "Figma Slides",       312, "Designer-friendly presentation tool",                         "https://www.figma.com/slides"],

  ["AI Learning",           "Notion",             892, "Knowledge management + collaboration",                        "https://www.notion.so"],
  ["AI Learning",           "Lark",               457, "Bytedance enterprise suite — docs / tables / meetings",       "https://www.larksuite.com"],
  ["AI Learning",           "Notebook LM",        378, "Note-taking with Q&A",                                        "https://notebooklm.google.com"],
  ["AI Learning",           "Cluely",             234, "Learning assistant for complex concepts",                     "https://cluely.com"],

  ["AI Charts",             "Napkin AI",          347, "Text-to-infographic conversion",                              "https://www.napkin.ai"],
  ["AI Charts",             "Xmind.ai",           289, "Mind mapping from text",                                      "https://xmind.ai"],

  ["AI Websites",           "Lovable",            578, "Conversational website builder",                              "https://lovable.dev"],
  ["AI Websites",           "Google AI Studio",   424, "AI development platform",                                     "https://aistudio.google.com"],
  ["AI Websites",           "Google Stitch",      267, "Interactive prototype tool",                                  "https://stitch.withgoogle.com"],

  ["AI Meetings & Research","Perplexity",         812, "AI search with citations",                                    "https://www.perplexity.ai"],
  ["AI Meetings & Research","Read AI",            345, "Meeting transcription + summarization",                       "https://www.read.ai"],
  ["AI Meetings & Research","TurboScript",        213, "Audio / video-to-text converter",                             "https://turboscript.ai"],

  ["AI Management",         "ClickUp",            413, "Multi-feature project platform",                              "https://clickup.com"],
  ["AI Management",         "Openclaw",           278, "AI-driven project management",                                "https://openclaw.ai"],
  ["AI Management",         "Obsidian",           198, "Knowledge management",                                        "https://obsidian.md"],

  ["AI Agent Automation",   "n8n",                534, "Open-source workflow automation",                             "https://n8n.io"],
  ["AI Agent Automation",   "Coze",               389, "Bytedance no-code bot builder",                               "https://www.coze.com"],
];

// ─── AUTH ──────────────────────────────────────────────────────────────────
async function getAuthClient() {
  if (!existsSync(CREDENTIALS_PATH)) {
    console.error(`
❌ Missing credentials file: scripts/.google-credentials.json

To set up:
1. Go to https://console.cloud.google.com/
2. Create a project → Enable "Google Sheets API"
3. Go to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID → Desktop App
5. Download JSON → save as scripts/.google-credentials.json
6. Run this script again
`);
    process.exit(1);
  }

  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "http://localhost:3333");

  if (existsSync(TOKEN_PATH)) {
    const token = JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    console.log("✅ Using saved auth token");
    return oAuth2Client;
  }

  // First time: open browser for auth
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  console.log("\n🔐 Opening browser for Google authorization...");
  console.log("If it doesn't open, visit:\n", authUrl);

  // Try to open browser
  try {
    const { exec } = await import("child_process");
    exec(`open "${authUrl}"`);
  } catch {}

  // Wait for OAuth callback
  const code = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, "http://localhost:3333");
      const code = url.searchParams.get("code");
      if (code) {
        res.end("<h2>✅ Authorized! You can close this tab.</h2>");
        server.close();
        resolve(code);
      } else {
        res.end("No code received");
        reject(new Error("No auth code"));
      }
    }).listen(3333);
    console.log("\nWaiting for authorization (listening on http://localhost:3333)...");
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("✅ Token saved for future use");
  return oAuth2Client;
}

// ─── SYNC ──────────────────────────────────────────────────────────────────
async function syncToSheets(auth) {
  const sheets = google.sheets({ version: "v4", auth });

  // Check if sheet tab exists, create if not
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

  if (!existingSheets.includes(SHEET_NAME)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      },
    });
    console.log(`📋 Created new sheet tab: "${SHEET_NAME}"`);
  }

  // Build rows: header + data
  const header = [["Category", "Tool Name", "Users", "Description", "URL", "Last Synced"]];
  const now = new Date().toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" });
  const rows = TOOLS.map(row => [...row, now]);
  const allRows = [...header, ...rows];

  // Clear and write
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:Z`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: allRows },
  });

  // Format header row bold
  const sheetId = spreadsheet.data.sheets.find(s => s.properties.title === SHEET_NAME)?.properties.sheetId
    ?? spreadsheet.data.sheets[spreadsheet.data.sheets.length - 1].properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 } } },
            fields: "userEnteredFormat(textFormat,backgroundColor)",
          },
        },
        {
          autoResizeDimensions: {
            dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 6 },
          },
        },
      ],
    },
  });

  console.log(`\n✅ Synced ${rows.length} tools to "${SHEET_NAME}" tab`);
  console.log(`🔗 https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
try {
  const auth = await getAuthClient();
  await syncToSheets(auth);
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
