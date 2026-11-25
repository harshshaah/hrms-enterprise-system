import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToExcel = (data, fileName) => {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data, columns, fileName, title) => {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  const doc = new jsPDF();
  
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

  doc.autoTable({
    startY: title ? 25 : 15,
    head: [columns.map(col => col.header)],
    body: data.map(item => columns.map(col => {
      // Allow for accessor strings like 'employee.firstName' or custom formatter
      if (col.formatter) {
        return col.formatter(item);
      }
      return item[col.accessor] || "";
    })),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`${fileName}.pdf`);
};
