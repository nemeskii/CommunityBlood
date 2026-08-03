import { jsPDF } from "jspdf";

const BRAND_RED = "#AB1D2E";
const INK = "#22201B";
const MUTED = "#5A5344";
const LINE = "#E4DCC8";

/**
 * Renders a simple, printable reference card as a PDF and triggers a download.
 *
 * @param {Object} opts
 * @param {"donation"|"request"} opts.type
 * @param {string} opts.referenceCode
 * @param {string} opts.heading - e.g. "Donation reference" / "Blood request reference"
 * @param {Array<{label: string, value: string}>} opts.rows - detail rows to print
 * @param {string} [opts.note] - footer note shown under the code
 */
export function downloadReferenceCard({ type, referenceCode, heading, rows = [], note }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 56;
  let y = 64;

  // Letterhead
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(INK);
  doc.text("COMMUNITY", marginX, y);
  const communityWidth = doc.getTextWidth("COMMUNITY");
  doc.setTextColor(BRAND_RED);
  doc.text("BLOOD", marginX + communityWidth, y);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text("Kohima, Nagaland  ·  communityblood.org", marginX, y);

  y += 24;
  doc.setDrawColor(LINE);
  doc.line(marginX, y, pageWidth - marginX, y);

  // Heading
  y += 34;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(INK);
  doc.text(heading, marginX, y);

  // Reference code block
  y += 30;
  const boxHeight = 66;
  doc.setDrawColor(BRAND_RED);
  doc.setLineWidth(1);
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, boxHeight, 6, 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text("REFERENCE CODE", marginX + 18, y + 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(BRAND_RED);
  doc.text(referenceCode || "—", marginX + 18, y + 50);

  y += boxHeight + 36;

  // Detail rows
  doc.setFontSize(11);
  rows.forEach(({ label, value }) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(INK);
    doc.text(String(label), marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED);
    doc.text(String(value || "—"), marginX + 170, y);

    y += 22;
  });

  y += 10;
  doc.setDrawColor(LINE);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 26;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  const footerNote =
    note ||
    (type === "donation"
      ? "Present this code at the hospital so staff can confirm your donation against this record."
      : "Present this code at the hospital when you go to receive blood, so staff can confirm it against this request.");
  const wrapped = doc.splitTextToSize(footerNote, pageWidth - marginX * 2);
  doc.text(wrapped, marginX, y);

  y += wrapped.length * 14 + 18;
  doc.setFontSize(9);
  doc.setTextColor("#9A9280");
  doc.text(`Generated ${new Date().toLocaleString()}`, marginX, y);

  const filenameSafeCode = (referenceCode || "reference").replace(/[^a-zA-Z0-9-]/g, "");
  doc.save(`communityblood-${type}-${filenameSafeCode}.pdf`);
}