import { formatPrescriptionDate, formatDoctorName } from './formatters';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export const printPrescription = (prescription) => {
  const medications = Array.isArray(prescription.medications) && prescription.medications.length
    ? prescription.medications
    : [{
        name: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
      }];

  const medicationRows = medications.map((medication) => `
    <tr>
      <td>
        <strong>${escapeHtml(medication.name || 'Medication')}</strong>
        ${medication.dosage ? `<div>${escapeHtml(medication.dosage)}</div>` : ''}
      </td>
      <td>${escapeHtml(medication.frequency || 'As directed')}</td>
      <td>${escapeHtml(medication.duration || 'As directed')}</td>
      <td>${escapeHtml(medication.instructions || 'As directed')}</td>
    </tr>
  `).join('');

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return false;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Prescription ${escapeHtml(prescription.rxNumber || '')}</title>
        <style>
          body { margin: 0; padding: 36px; color: #17324d; font-family: Arial, sans-serif; }
          .sheet { max-width: 820px; margin: auto; border: 1px solid #b8cad8; min-height: 620px; padding: 28px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0b78a9; padding-bottom: 14px; }
          .clinic { color: #0b78a9; font-size: 22px; font-weight: 700; }
          .rx { margin: 18px 0 8px; color: #0b78a9; font-size: 34px; font-weight: 700; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; border-bottom: 1px solid #d7e3ec; padding: 10px 0 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #d7e3ec; padding: 10px; text-align: left; vertical-align: top; }
          th { background: #edf7fb; font-size: 12px; text-transform: uppercase; }
          .signature { width: 260px; margin: 90px 0 0 auto; border-top: 1px solid #17324d; text-align: center; padding-top: 6px; }
          @media print { body { padding: 0; } .sheet { border: 0; } }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="clinic">Pareñas Medical Clinic</div>
            <div><strong>${escapeHtml(prescription.rxNumber || 'Prescription')}</strong></div>
          </div>
          <div class="meta">
            <div><strong>Patient:</strong> ${escapeHtml(prescription.patient || 'Patient')}</div>
            <div><strong>Date:</strong> ${escapeHtml(formatPrescriptionDate(prescription.date))}</div>
            <div><strong>Diagnosis:</strong> ${escapeHtml(prescription.diagnosis || 'Clinical evaluation')}</div>
            <div><strong>Prescribing Doctor:</strong> ${escapeHtml(formatDoctorName(prescription.prescribedBy || prescription.doctor))}</div>
          </div>
          <div class="rx">℞</div>
          <table>
            <thead><tr><th>Medication</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
            <tbody>${medicationRows}</tbody>
          </table>
          <div class="signature">
            ${escapeHtml(formatDoctorName(prescription.prescribedBy || prescription.doctor))}
            <div>Attending Physician</div>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => printWindow.print();
  return true;
};
