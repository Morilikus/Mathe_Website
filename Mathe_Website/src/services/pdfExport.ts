import { jsPDF } from 'jspdf'
import type { GeneratorSettings } from '../domain/generator'
import type { MathProblem } from '../domain/math'

const pdfSafe = (text: string) =>
  text.replaceAll('·', '*').replaceAll('−', '-').replaceAll('√', 'Wurzel aus ')

const writeSolutionPage = (document: jsPDF, problems: MathProblem[], margin: number) => {
  let y = 20
  document.addPage()

  document.setFont('helvetica', 'bold')
  document.setFontSize(18)
  document.text('Lösungswege', margin, y)
  y += 12

  problems.forEach((problem, index) => {
    if (y > 260) {
      document.addPage()
      y = 20
    }

    document.setFont('helvetica', 'bold')
    document.setFontSize(11)
    document.text(`${index + 1}. ${pdfSafe(problem.display)} =`, margin, y)
    y += 7

    document.setFont('helvetica', 'normal')
    document.setFontSize(10)
    const steps =
      problem.solution.length > 0
        ? problem.solution
        : [
            {
              expression: problem.display,
              result: pdfSafe(String(problem.answer.numerator / problem.answer.denominator)),
            },
          ]

    steps.forEach((step) => {
      if (y > 285) {
        document.addPage()
        y = 20
      }
      document.text(`- ${pdfSafe(step.expression)} = ${pdfSafe(step.result)}`, margin + 6, y)
      y += 7
    })

    y += 4
  })
}

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
    if (!withSolutions) {
      document.line(margin + 62, y + 1, 90, y + 1)
    }
    y += 16
  })

  if (withSolutions) {
    writeSolutionPage(document, problems, margin)
  }

  document.save(withSolutions ? 'mathewerkstatt-mit-loesungen.pdf' : 'mathewerkstatt-aufgaben.pdf')
}
