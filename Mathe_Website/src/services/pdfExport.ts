import { jsPDF } from 'jspdf'
import { formatFraction, type MathProblem } from '../domain/math'
import type { GeneratorSettings } from '../domain/generator'

const pdfSafe = (text: string) =>
  text.replaceAll('·', '*').replaceAll('−', '-').replaceAll('√', 'Wurzel aus ')

export const downloadWorksheetPdf = (
  problems: MathProblem[],
  settings: GeneratorSettings,
  generatedAt: Date,
  withSolutions: boolean,
) => {
  const document = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 18
  let y = 20

  document.setFont('helvetica', 'bold')
  document.setFontSize(22)
  document.text('MatheWerkstatt', margin, y)
  y += 9
  document.setFont('helvetica', 'normal')
  document.setFontSize(10)
  document.setTextColor(90, 99, 104)
  document.text(
    `${settings.count} Aufgaben | Zahlen bis ${settings.digits} Stellen | bis ${settings.operations} Schritte | ${generatedAt.toLocaleDateString('de-DE')}`,
    margin,
    y,
  )
  y += 14
  document.setTextColor(25, 35, 38)

  problems.forEach((problem, index) => {
    if (y > 272) {
      document.addPage()
      y = 20
    }
    document.setFontSize(13)
    document.text(`${index + 1}.  ${pdfSafe(problem.display)} =`, margin, y)
    if (withSolutions) {
      document.setFontSize(10)
      document.setTextColor(90, 99, 104)
      document.text(`Lösung: ${pdfSafe(formatFraction(problem.answer))}`, margin + 6, y + 7)
      y += 7
      document.setTextColor(25, 35, 38)
    } else {
      document.line(margin + 62, y + 1, 90, y + 1)
    }
    y += 16
  })

  document.save(withSolutions ? 'mathewerkstatt-mit-loesungen.pdf' : 'mathewerkstatt-aufgaben.pdf')
}
