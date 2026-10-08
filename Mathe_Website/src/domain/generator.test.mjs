import test from 'node:test'
import assert from 'node:assert/strict'

import { generateProblems } from './generator.ts'
import { useWorksheet } from '../composables/useWorksheet.ts'

const problemSettings = {
  operators: ['addition'],
  digits: 2,
  numberRangeMode: 'range',
  operations: 1,
  numberModes: ['integer'],
  parentheses: false,
  count: 500,
  minimum: 1,
  maximum: 99,
  allowNegative: false,
  solutionMinimum: 0,
  solutionMaximum: 999,
}

test('generateProblems keeps every numeric value within the configured range', () => {
  const problems = generateProblems({ ...problemSettings, minimum: 10, maximum: 20, count: 200 })

  for (const problem of problems) {
    const values = []
    const visit = (expression) => {
      if (expression.kind === 'number') values.push(expression.value)
      else {
        if (expression.left) visit(expression.left)
        if (expression.right) visit(expression.right)
      }
    }
    visit(problem.expression)

    assert.ok(
      values.every((value) => {
        const numericValue = value.numerator / value.denominator
        return numericValue >= 10 && numericValue <= 20
      }),
      'A generated number was outside the configured range',
    )
  }
})

test('generateProblems rejects problems whose solution is outside the configured range', () => {
  assert.throws(
    () =>
      generateProblems({
        ...problemSettings,
        count: 1,
        minimum: 1,
        maximum: 99,
        solutionMinimum: 1000,
        solutionMaximum: 1000,
      }),
    /Unable to generate a problem within the configured solution range/,
    'The generator should reject an impossible solution range after exhausting its attempts',
  )
})

test('generateProblems keeps every number within the configured digit limit', () => {
  const problems = generateProblems({
    ...problemSettings,
    digits: 1,
    count: 200,
    minimum: 1,
    maximum: 9,
    numberModes: ['integer'],
  })

  for (const problem of problems) {
    const values = []
    const visit = (expression) => {
      if (expression.kind === 'number') values.push(expression.value)
      else {
        if (expression.left) visit(expression.left)
        if (expression.right) visit(expression.right)
      }
    }
    visit(problem.expression)

    assert.ok(
      values.every((value) => Math.abs(value.numerator / value.denominator) <= 9),
      'A generated number exceeded the configured digit limit',
    )
  }
})

test('shows the solution only after three incorrect attempts', () => {
  const worksheet = useWorksheet()
  worksheet.updateSettings({
    count: 1,
    operators: ['addition'],
    numberModes: ['integer'],
    minimum: 1,
    maximum: 9,
    solutionMinimum: 0,
    solutionMaximum: 999,
  })
  worksheet.generateWorksheet()

  const [problem] = worksheet.problems.value
  assert.ok(problem, 'A problem was not generated')

  const wrongAnswers = ['0', '1', '2']
  const expectedLabels = [
    'Noch 2 Versuche.',
    'Noch 1 Versuch.',
    `Noch nicht. Die Lösung ist ${problem.answer.numerator / problem.answer.denominator}.`,
  ]

  for (const [attempt, answer] of wrongAnswers.entries()) {
    worksheet.updateAnswer(problem.id, answer)
    worksheet.checkAnswer(problem)

    assert.equal(
      worksheet.feedbackLabel(problem),
      expectedLabels[attempt],
      `Unexpected feedback on attempt ${attempt + 1}`,
    )
  }
})
