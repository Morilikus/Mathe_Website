import {
  type Expression,
  type MathProblem,
  type NumberMode,
  type Operator,
  type SolutionStep,
  evaluate,
  formatExpression,
  formatExpressionHtml,
  formatFraction,
  fraction,
  isInteger,
} from './math'

export interface GeneratorSettings {
  operators: Operator[]
  digits: number
  numberRangeMode: 'digits' | 'range'
  operations: number
  numberModes: NumberMode[]
  parentheses: boolean
  count: number
  minimum: number
  maximum: number
  allowNegative: boolean
  solutionMinimum: number
  solutionMaximum: number
}

export const DIGIT_OPTIONS = [1, 2, 3] as const
export const OPERATION_OPTIONS = [1, 2, 3] as const
export const NUMBER_MODES: Array<{ value: NumberMode; label: string; description: string }> = [
  { value: 'integer', label: 'Ganze Zahlen', description: '… ohne Komma' },
  { value: 'decimal', label: 'Dezimalzahlen', description: '… mit Komma' },
  { value: 'fraction', label: 'Brüche', description: '… als echter Bruch' },
]
export const MAX_TASK_COUNT = 30

export const DEFAULT_SETTINGS: GeneratorSettings = {
  operators: ['addition', 'subtraction', 'multiplication', 'division'],
  digits: 2,
  numberRangeMode: 'digits',
  operations: 1,
  numberModes: ['integer'],
  parentheses: false,
  count: 8,
  minimum: 1,
  maximum: 99,
  allowNegative: false,
  solutionMinimum: 0,
  solutionMaximum: 999,
}

const randomInteger = (digits: number): number => {
  const actualDigits = Math.max(1, 1 + Math.floor(randomUnit() * digits))
  const minimum = actualDigits === 1 ? 1 : 10 ** (actualDigits - 1)
  const maximum = 10 ** actualDigits - 1
  return Math.floor(randomUnit() * (maximum - minimum + 1)) + minimum
}

const randomIntegerInRange = (minimum: number, maximum: number): number => {
  const lower = Math.ceil(Math.min(minimum, maximum))
  const upper = Math.floor(Math.max(minimum, maximum))
  return Math.floor(randomUnit() * (upper - lower + 1)) + lower
}

const randomUnit = (): number => {
  const values = new Uint32Array(1)
  globalThis.crypto.getRandomValues(values)
  return (values[0] ?? 0) / 2 ** 32
}

const numberNode = (value: number, mode: NumberMode = 'integer'): Expression => {
  if (mode === 'decimal') {
    const decimalPlaces = randomInteger(1) % 2 === 0 ? 1 : 2
    const denominator = 10 ** decimalPlaces
    const decimalValue = value * denominator + (randomInteger(1) % denominator)
    const decimalText = (decimalValue / denominator).toFixed(decimalPlaces).replace('.', ',')
    return {
      kind: 'number',
      value: fraction(decimalValue, denominator),
      display: decimalText,
      displayKind: 'decimal',
    }
  }
  if (mode === 'fraction') {
    const denominator = randomInteger(1) + 1
    return {
      kind: 'number',
      value: fraction(value, denominator),
      display: `${value}/${denominator}`,
      displayKind: 'fraction',
    }
  }
  return { kind: 'number', value: fraction(value) }
}

const createOperation = (
  settings: GeneratorSettings,
  operator: Operator,
  mode: NumberMode,
): Expression => {
  const operand = () => randomIntegerInRange(...getOperandRange(settings))
  if (operator === 'root') {
    const root = randomInteger(Math.min(settings.digits, 2))
    return { kind: 'operation', operator, value: numberNode(root * root) }
  }
  if (operator === 'power')
    return {
      kind: 'operation',
      operator,
      left: numberNode(operand(), mode),
    }
  let left = operand()
  let right = operand()
  if (operator === 'division') {
    right = randomIntegerInRange(1, Math.min(settings.maximum, 99))
    left = right * randomIntegerInRange(...getOperandRange(settings))
  }
  if (operator === 'subtraction' && !settings.allowNegative && right > left)
    [left, right] = [right, left]
  return {
    kind: 'operation',
    operator,
    left: numberNode(left, mode),
    right: numberNode(right, mode),
  }
}

const getOperandRange = (settings: GeneratorSettings): [number, number] => {
  if (settings.numberRangeMode === 'digits') {
    const maximum = 10 ** settings.digits - 1
    return settings.allowNegative ? [-maximum, maximum] : [1, maximum]
  }
  const minimum = Math.max(0, Math.min(settings.minimum, settings.maximum))
  const maximum = Math.max(minimum, settings.maximum)
  return settings.allowNegative ? [-maximum, maximum] : [minimum, maximum]
}

const createOperand = (settings: GeneratorSettings, mode: NumberMode): Expression =>
  numberNode(randomIntegerInRange(...getOperandRange(settings)), mode)

const operatorPrecedence = (operator: Operator): number => {
  if (operator === 'root' || operator === 'power') return 3
  if (operator === 'multiplication' || operator === 'division') return 2
  return 1
}

const selectNumberMode = (modes: NumberMode[]): NumberMode =>
  modes[Math.floor(randomUnit() * modes.length)] ?? 'integer'

const binaryOperators = (operators: Operator[]): Operator[] =>
  operators.filter((operator) => operator !== 'root' && operator !== 'power')

const createExpression = (settings: GeneratorSettings): Expression => {
  const selectedBinaryOperators = binaryOperators(settings.operators)
  const fallbackOperator = selectedBinaryOperators[0] ?? 'addition'
  const operationCount = 1 + Math.floor(randomUnit() * settings.operations)
  let expression = createOperation(
    settings,
    settings.operators[Math.floor(randomUnit() * settings.operators.length)] ?? fallbackOperator,
    selectNumberMode(settings.numberModes),
  )

  for (let step = 1; step < operationCount; step += 1) {
    const currentPrecedence =
      expression.kind === 'operation' ? operatorPrecedence(expression.operator) : 4
    const availableOperators = settings.parentheses
      ? settings.operators
      : settings.operators.filter(
          (operator) =>
            operator === 'root' ||
            operator === 'power' ||
            operatorPrecedence(operator) <= currentPrecedence,
        )
    const selectedOperator =
      availableOperators[Math.floor(randomUnit() * availableOperators.length)] ?? fallbackOperator
    if (selectedOperator === 'root') {
      // A root can safely be part of a longer task when it is applied to a known square.
      const root = createOperation(settings, 'root', selectNumberMode(settings.numberModes))
      expression = {
        kind: 'operation',
        operator: fallbackOperator,
        left: expression,
        right: root,
      }
    } else if (selectedOperator === 'power') {
      expression = {
        kind: 'operation',
        operator: fallbackOperator,
        left: expression,
        right: createOperation(settings, 'power', selectNumberMode(settings.numberModes)),
      }
    } else {
      expression = {
        kind: 'operation',
        operator: selectedOperator,
        left: expression,
        right: createOperand(settings, selectNumberMode(settings.numberModes)),
      }
    }
    if (
      settings.parentheses &&
      expression.kind === 'operation' &&
      expression.left?.kind === 'operation'
    ) {
      expression.left = { ...expression.left, parenthesized: true }
    }
  }
  return expression
}

const createSolution = (expression: Expression): SolutionStep[] => {
  if (expression.kind === 'number') return []
  const steps: SolutionStep[] = []
  if (expression.operator === 'root' || expression.operator === 'power') {
    steps.push({
      expression: formatExpression(expression),
      expressionHtml: formatExpressionHtml(expression),
      result: formatFraction(evaluate(expression)),
    })
    return steps
  }
  const left = expression.left!
  const right = expression.right!
  steps.push({
    expression: formatExpression(expression),
    expressionHtml: formatExpressionHtml(expression),
    result: formatFraction(evaluate(expression)),
  })
  if (left.kind === 'operation') steps.unshift(...createSolution(left))
  if (right.kind === 'operation') steps.unshift(...createSolution(right))
  return steps
}

const createProblem = (settings: GeneratorSettings, index: number): MathProblem => {
  let expression = createExpression(settings)
  let answer = evaluate(expression)
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const solutionMinimum = Math.min(settings.solutionMinimum, settings.solutionMaximum)
    const solutionMaximum = Math.max(settings.solutionMinimum, settings.solutionMaximum)
    const inSolutionRange =
      answer.numerator / answer.denominator >= solutionMinimum &&
      answer.numerator / answer.denominator <= solutionMaximum
    const isValidInteger =
      settings.numberModes.length !== 1 ||
      settings.numberModes[0] !== 'integer' ||
      isInteger(answer)
    if (inSolutionRange && isValidInteger) break
    expression = createExpression(settings)
    answer = evaluate(expression)
  }
  return {
    id: `${Date.now()}-${index}-${randomUnit()}`,
    expression,
    display: formatExpression(expression),
    answer,
    solution: createSolution(expression),
  }
}

export const generateProblems = (settings: GeneratorSettings): MathProblem[] =>
  Array.from({ length: settings.count }, (_, index) => createProblem(settings, index))
