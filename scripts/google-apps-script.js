/**
 * Sharlene's Wiki — Google Apps Script
 *
 * Paste this into Extensions > Apps Script in your Google Sheet
 * Then click Run > syncWiki
 *
 * Creates/overwrites one tab per wiki page. Starting with "Millionaire Marketer".
 * Whenever you update your wiki, just click Run again — it refreshes cleanly.
 */

function syncWiki() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pages = getWikiData();
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd MMM yyyy HH:mm");

  pages.forEach(function(page) {
    writePageSheet(ss, page, now);
  });

  SpreadsheetApp.getUi().alert(
    "✅ Wiki synced!\n\n" +
    pages.length + " page(s) written.\n\n" +
    "Last synced: " + now
  );
}

function writePageSheet(ss, page, now) {
  var sheet = ss.getSheetByName(page.name);
  if (!sheet) {
    sheet = ss.insertSheet(page.name);
  } else {
    sheet.clearContents();
    sheet.clearFormats();
  }

  // Title row
  sheet.getRange(1, 1, 1, 6).merge()
    .setValue(page.icon + "  " + page.name)
    .setFontSize(16)
    .setFontWeight("bold")
    .setBackground("#1a1a2e")
    .setFontColor("#ffffff")
    .setHorizontalAlignment("left")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 36);

  // Meta row
  sheet.getRange(2, 1, 1, 6).merge()
    .setValue(page.description + "     |     Last synced: " + now)
    .setFontSize(10)
    .setFontColor("#888888")
    .setBackground("#f5f5f5");

  // Column headers
  var headers = [["Section", "Status", "Item", "URL", "Attachment", "Tags"]];
  sheet.getRange(3, 1, 1, 6).setValues(headers);
  var headerRange = sheet.getRange(3, 1, 1, 6);
  headerRange.setBackground("#2d3436");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");

  // Status colours
  var statusColors = {
    "Active":   "#d4edda",
    "Draft":    "#fff3cd",
    "Inactive": "#e2e3e5",
    "Lark":     "#e7d5fc",
    "":         "#ffffff"
  };

  // Section colours (alternate)
  var sectionColors = ["#ffffff", "#fafbfc"];

  // Build rows
  var rows = [];
  var rowFormats = [];
  var sectionIndex = -1;
  var lastSection = null;

  page.sections.forEach(function(section) {
    sectionIndex++;
    section.entries.forEach(function(entry) {
      rows.push([
        section.name,
        entry.status || "",
        entry.item,
        entry.url || "",
        entry.attachment || "",
        (entry.tags || []).join(", ")
      ]);
      rowFormats.push({
        sectionColor: sectionColors[sectionIndex % 2],
        statusColor: statusColors[entry.status || ""] || "#ffffff",
        url: entry.url || ""
      });
    });
  });

  if (rows.length === 0) return;

  // Write data
  var startRow = 4;
  sheet.getRange(startRow, 1, rows.length, 6).setValues(rows);

  // Apply per-row formatting
  rowFormats.forEach(function(fmt, i) {
    var row = startRow + i;
    // Whole row: section alternating colour
    sheet.getRange(row, 1, 1, 6).setBackground(fmt.sectionColor);
    // Status cell: status colour
    if (fmt.statusColor !== "#ffffff") {
      sheet.getRange(row, 2).setBackground(fmt.statusColor).setFontWeight("bold").setHorizontalAlignment("center");
    }
    // URL: make it a clickable hyperlink
    if (fmt.url && fmt.url.indexOf("http") === 0) {
      sheet.getRange(row, 4).setFormula('=HYPERLINK("' + fmt.url + '","' + fmt.url + '")');
      sheet.getRange(row, 4).setFontColor("#1155CC");
    }
  });

  // Bold item names
  sheet.getRange(startRow, 3, rows.length, 1).setFontWeight("bold");

  // Borders
  sheet.getRange(3, 1, rows.length + 1, 6)
    .setBorder(true, true, true, true, true, true, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);

  // Freeze title + header
  sheet.setFrozenRows(3);

  // Column widths
  sheet.setColumnWidth(1, 220);  // Section
  sheet.setColumnWidth(2, 80);   // Status
  sheet.setColumnWidth(3, 320);  // Item
  sheet.setColumnWidth(4, 280);  // URL
  sheet.setColumnWidth(5, 140);  // Attachment
  sheet.setColumnWidth(6, 220);  // Tags
}

// ─── WIKI DATA ────────────────────────────────────────────────────────────
// This mirrors src/data/millionaire-marketer.ts in your wiki repo.
// When your wiki data changes, update this function and re-run syncWiki.
function getWikiData() {
  return [
    {
      id: "millionaire-marketer",
      name: "Millionaire Marketer",
      icon: "💰",
      description: "MM program resources, payments, events, and fulfilment",
      sections: [
        {
          name: "Upsell Landing Page",
          entries: [
            { status: "Draft",  item: "Landing Page",                       url: "https://app.automaticsales.ai/v2/preview/K5YRgSUlzRfxVPjjm3vX", tags: ["landing-page","upsell"] },
            { status: "Active", item: "IIM Offline Upsell (MM) FEB 2025",   url: "https://funnelduo.sg.larksuite.com/minutes/obsgaq35bnr1519k739b5l17", tags: ["upsell","iim"] },
            { status: "Active", item: "MM JUL-15, 2025 Upsell MM",          url: "https://funnelduo.sg.larksuite.com/minutes/obsgo3qyosj99n7667qg7z65", tags: ["upsell"] },
            { status: "Active", item: "MM AUG, 2025 - DAY 1",                                                                                           tags: ["event","aug-2025"] },
            { status: "Active", item: "MM AUG, 2025 - DAY 2",               url: "https://funnelduo.sg.larksuite.com/minutes/obsgfeb43w4875k2c23699nn", tags: ["event","aug-2025"] },
            { status: "Active", item: "MM AUG, 2025 - DAY 3",               url: "https://funnelduo.sg.larksuite.com/minutes/obsgew959exmo3o5k8m46x1i", tags: ["event","aug-2025"] }
          ]
        },
        {
          name: "Payment",
          entries: [
            { status: "Active", item: "Stripe: Full Payment (RM7997 + SST)",        url: "https://freedombusiness.io/millionairemarketer",         attachment: "DEBIT/CREDIT", tags: ["payment","stripe"] },
            { status: "Active", item: "Stripe: Full Payment (RM7997 + SST) - QR",   url: "https://onegoodurl.com/millionairemarketer/qr",          attachment: "QR",           tags: ["payment","stripe","qr"] },
            { status: "Active", item: "Stripe: Instalment",                          url: "https://freedombusiness.io/millionairemarketerdeposit", attachment: "DEBIT/CREDIT", tags: ["payment","stripe","instalment"] },
            { status: "",       item: "Billplz: Custom",                             url: "https://catalog.billplz.com/funnelduo/payment-form/mmcustom", attachment: "DEBIT/CREDIT", tags: ["payment","billplz"] },
            { status: "",       item: "SenangPay",                                   url: "https://app.senangpay.my/payment/174740009483",                                           tags: ["payment","senangpay"] },
            { status: "Active", item: "SenangPay - REVISION RM980 (RM1058.40)",     url: "https://app.senangpay.my/buy/mm_revision",                                                tags: ["payment","senangpay","revision"] }
          ]
        },
        {
          name: "Event Date",
          entries: [
            { status: "Inactive", item: "Session #01 - May 2025 - (May 1-4, 2025, 9AM - 6PM)",   url: "Avengers Incubator, Kuala Lumpur (Thu-Fri)",    attachment: "https://docs.google.com/spreadsheets/d/1RsUKdCdbCuJp4GTcIiF5-SxD_bxN_iLrsWVGCE7ACIA/edit", tags: ["event","session-01","may-2025"] },
            { status: "Draft",    item: "Session #02 - Sep 2025 - (Sep 11-14, 2025, 9AM - 9PM?)", url: "Avengers Incubator, Kuala Lumpur (Fri-Sun)",                                                                                                                     tags: ["event","session-02","sep-2025"] },
            { status: "Draft",    item: "Session #03 - Dec 2025",                                                                                                                                                                                                         tags: ["event","session-03","dec-2025"] }
          ]
        },
        {
          name: "Onboarding",
          entries: [
            { status: "Draft",  item: "Student List",                url: "https://docs.google.com/spreadsheets/d/1lBUlR2R0QBnD48cfQE4U4bk9_4gvq8WjZVRz05nFqEs/edit?usp=sharing", tags: ["onboarding","student-list"] },
            { status: "Active", item: "Onboarding Form",             url: "https://millionairemarketer.io/onboarding",                                                            attachment: "https://forms.gle/DPdSis5vPC7wjS3q6", tags: ["onboarding","form"] },
            { status: "Active", item: "Student List (After Event)",  url: "https://docs.google.com/spreadsheets/d/1QdU68W29xqxREZPlqLNq9kTJcI4Cy9e9Ej140bpHNtY/edit?gid=680473946", tags: ["onboarding","student-list"] }
          ]
        },
        {
          name: "Offline Fulfilment (May 1-4, 2025)",
          entries: [
            { status: "Lark", item: "MM Brainstorm Team Board (Lark)", url: "https://globalfd.sg.larksuite.com/wiki/IOsawiuGWilA5MkdByOlqvmvgBb", tags: ["lark","brainstorm"] },
            { status: "",     item: "MM Framework Workbook",           url: "https://docs.google.com/presentation/d/1bD1j399rIFtp25Hl9JNHGgzW1IO8-2bAvhEaEuFmANY/edit", attachment: "Slides", tags: ["slides","framework"] },
            { status: "",     item: "MM - Traffic (Andi)",             url: "https://docs.google.com/presentation/d/1V9uSQUduqYytfDcC0XQGqBjoTdev3oUEnvB6BFDRsmo/edit", attachment: "Slides", tags: ["slides","traffic"] },
            { status: "",     item: "MM - System (Jackson)",           url: "https://docs.google.com/presentation/d/1Cs8JNx2cj5rbcdHH6e04IIC9sLfM-Iq17D8NLskh-uA/edit", attachment: "Slides", tags: ["slides","system"] },
            { status: "",     item: "MM - BONUS - Framework (Reeve)",  url: "https://docs.google.com/presentation/d/1UX9FLP-LkMGB0VqgIY2a2FL3o9tHxni2X504Nk81R_k/edit", attachment: "Slides", tags: ["slides","framework","bonus"] },
            { status: "",     item: "MM - D1 - Intro/Assets (Reeve)",  url: "https://docs.google.com/presentation/d/1_6SyGmZq2HxABN6D3gNbMmArv8qWxnxUeY6WnHzaOJM/edit", attachment: "Slides", tags: ["slides","day-1","intro"] },
            { status: "",     item: "MM - D1 - 3 Secrets/Webinar",     url: "https://docs.google.com/presentation/d/15JWGC4_mNawVJb5s5vJmbzWsiO_MxRY-U1L6xiTxZs4/edit", attachment: "Slides", tags: ["slides","day-1","webinar"] },
            { status: "",     item: "MM - D2 - Content (Reeve)",       url: "https://docs.google.com/presentation/d/1GwGa60kPfx3lHgzeZ61ew7qabx9OhdxGZCOtewqrHAo/edit", attachment: "Slides", tags: ["slides","day-2","content"] },
            { status: "",     item: "MM - D2 - Offer (Reeve)",         url: "https://docs.google.com/presentation/d/1um4FuBuOE3mywW2lnHOFEpnteaSR6hl9lEyUPjMcPUo/edit", attachment: "Slides", tags: ["slides","day-2","offer"] },
            { status: "",     item: "MM - D4 - Business (Reeve)",      url: "https://docs.google.com/presentation/d/1tBXfSlpJ7DjiHliCpuGL7JG569kZRIVekCeVnT_KMu8/edit", attachment: "Slides", tags: ["slides","day-4","business"] },
            { status: "",     item: "MM - D2 - XHS Content (Chinying)", url: "https://docs.google.com/presentation/d/1H1kNRfHpjbZY8HkcTt-IC6NsNKDoY7kNZg1YfT3LF8k/edit", attachment: "Slides", tags: ["slides","day-2","xhs"] },
            { status: "",     item: "MM - D3 - Closing (CMC)",         url: "https://docs.google.com/presentation/d/1xPdsDQw5v-ozUJ4thDwP9wYMWs9bzZn9-vYy1wdI6Do/edit", attachment: "Slides", tags: ["slides","day-3","closing"] },
            { status: "",     item: "MM - D4 - Consultative Closing",  url: "https://docs.google.com/presentation/d/1MIgv8nitSHzTzUvhanDunCjW3y0ln4_Yc2ndzhRP4Wc/edit", attachment: "Slides", tags: ["slides","day-4","closing"] },
            { status: "",     item: "MM - D4 - Guru Sharing (Pemni)",  url: "https://docs.google.com/presentation/d/1NbWM4SepycJQu3vtDy-YlBs2nXH3vEeC35NCrDL0wyU/edit", attachment: "Slides", tags: ["slides","day-4","guru"] }
          ]
        },
        {
          name: "Offline Event (May 2025)",
          entries: [
            { status: "", item: "MM Presentation Submission Form (May 4, 2025)", url: "https://docs.google.com/forms/d/1sNMhTIeXd0JOkPOd1jrOAEI9-0BjPeLqgtOf6r1KU1w/edit", attachment: "Form", tags: ["form","presentation"] },
            { status: "", item: "Responses",                                      url: "https://docs.google.com/spreadsheets/d/16OZNT1QlVESyi2UOIOlQ_uqw8fZxr2qDKhw56jLjuh8/edit", attachment: "Form", tags: ["form","responses"] },
            { status: "", item: "(Google Photos) MM May 1-4, 2025",              url: "https://photos.app.goo.gl/jxFf9UxRjPsGLKQG7",                                                                 tags: ["photos","may-2025"] },
            { status: "", item: "Millionaire Marketer Prompt Pack (Notion)",     url: "https://www.notion.so/thejacksonyew/Millionaire-Marketer-Prompt-Pack-1e6ce2f368318043b7acde56f390a585",       tags: ["notion","prompt-pack","assets"] }
          ]
        },
        {
          name: "Marketer x Partnership Application",
          entries: [
            { status: "", item: "MM Partnership (Responses)",               url: "https://docs.google.com/spreadsheets/d/1GA-qDoK3leUMKw_iCt6o_r31H8_Tl5mQCB_P4j9sPg0/edit",   attachment: "Form",     tags: ["partnership","form","responses"] },
            { status: "", item: "MM Partnership (Airtable)",                url: "https://airtable.com/appDW0X2tEA5OpL0j/tblo4AhZlgd9LyDgg/viwu99laM4QlFPVQC",                attachment: "Airtable", tags: ["partnership","airtable"] },
            { status: "", item: "MM High Ticket Closer (Kaelyn)",           url: "https://docs.google.com/spreadsheets/d/1pMdNOTVHnKnPphkUgSAog7e4Tw6CP6-9dMYbeuOjqwI/edit",  attachment: "Form",     tags: ["partnership","high-ticket","closer"] },
            { status: "", item: "MM002 (Sep'25) Partnership Responses",     url: "https://docs.google.com/spreadsheets/u/3/d/1ZRjYTsrOTfRiXUelXtX0dgtdVeFyrdCqvQt1c47wgM0/edit",                      tags: ["partnership","mm002","sep-2025"] }
          ]
        },
        {
          name: "1-1 Closing (VSL/Application Funnel)",
          entries: [
            { status: "Draft",  item: "MM Flowchart",                                    url: "https://globalfd.sg.larksuite.com/wiki/P83mwXotBiFXeqkvHl4lLvPmgSb",                                     tags: ["flowchart","lark"] },
            { status: "Active", item: "Interview Application Form",                     url: "https://millionairemarketer.io/apply-to-join",                attachment: "https://onegoodurl.com/mm-interview", tags: ["form","interview","application"] },
            { status: "Active", item: "Interview Application Responses",                url: "https://docs.google.com/spreadsheets/d/1A1h89hhaJ7v-eiWXN_PKoRUGzR83nBRhQHGf10kuivY/edit",                tags: ["responses","google-sheets"] },
            { status: "Active", item: "Discovery Call Script",                          url: "https://docs.google.com/document/d/1blvpTh4kJ3UGAJdKUGfMkJXQMsZHTgidPAAkuF7Mkyc/edit",                   tags: ["script","discovery-call"] },
            { status: "Active", item: "Kaelyn Closing Recording",                       url: "https://drive.google.com/drive/u/3/folders/17111Ly7JKD9MeMZWUKg1kOFvvWr1rLGk",                            tags: ["recording","closing","kaelyn"] },
            { status: "Active", item: "Pre-Call PDF (Kaelyn)",                          url: "https://onegoodurl.com/mm-pdf1",                                                                              tags: ["pdf","pre-call","kaelyn"] },
            { status: "Active", item: "Pre-Call PDF (Andi)",                            url: "https://onegoodurl.com/mm-pdf2",                                                                              tags: ["pdf","pre-call","andi"] },
            { status: "Active", item: "Calvin MM Closing Script",                       url: "https://docs.google.com/spreadsheets/d/1o7SlofPqsFh88SN3dclBhRv_T5s32fWmisN0HXozfXQ/edit",                tags: ["script","closing","calvin"] }
          ]
        },
        {
          name: "Monthly Coaching & SOS Request",
          entries: [
            { status: "Active", item: "Monthly Coaching Call Zoom Link",                     url: "https://getzoomlink.com/mm-call",                                                                        tags: ["coaching","zoom"] },
            { status: "",       item: "MM Fulfilment (Student List, SOS, Hotseat)",         url: "https://docs.google.com/spreadsheets/d/1QdU68W29xqxREZPlqLNq9kTJcI4Cy9e9Ej140bpHNtY/edit",              attachment: "Google Sheet", tags: ["fulfilment","student-list","hotseat"] },
            { status: "",       item: "MM Monthly Coaching Hotseat Application Form",       url: "https://forms.gle/cmm1e7CE1TTTkgHt7",                                                                    attachment: "Form",         tags: ["form","hotseat","coaching"] },
            { status: "",       item: "SOS Request Form",                                    url: "https://autocrm.ai/widget/form/ktPwNmN2NTuD18ALT3BM?notrack=true",                                     attachment: "Form",         tags: ["form","sos"] }
          ]
        },
        {
          name: "Replays & Resources",
          entries: [
            { status: "", item: "MM LIVE REPLAY",                        url: "https://onegoodurl.com/mm-preview",                                                     tags: ["replay","live"] },
            { status: "", item: "MM Upsell REPLAY",                      url: "https://drive.google.com/drive/u/3/folders/1nZNzuRGmPYYw5gDTfNt9UVkg5ZWUOgqy",            tags: ["replay","upsell"] },
            { status: "", item: "(Partnership) 5-Week Key Milestones",   url: "https://trello.com/b/S6wqBmiC/partnership-5-week-key-milestones",                        tags: ["partnership","milestones","trello"] },
            { status: "", item: "Project Management Master Sheet (Lark)", url: "https://globalfd.sg.larksuite.com/base/Tv2hb54mWa2Ljhstbuulxy5egNb",                    tags: ["project-management","lark"] }
          ]
        }
      ]
    }
  ];
}
