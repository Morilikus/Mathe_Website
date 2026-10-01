export type Operator = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'power' | 'root'

export type NumberMode = 'integer' | 'decimal' | 'fraction'

export interface Fraction {
  numerator: number
  denominator: number
}

export type Expression =
  | { kind: 'number'; value: Fraction; display?: string; displayKind?: 'decimal' | 'fraction' }
  | {
      kind: 'operation'
      operator: Operator
      left?: Expression
      right?: Expression
      value?: Expression
      parenthesized?: boolean
    }

export interface SolutionStep {
  expression: string
  expressionHtml: string
  result: string
}

export interface MathProblem {
  id: string
  expression: Expression
  display: string
  answer: Fraction
  solution: SolutionStep[]
}

export const OPERATORS: Array<{ value: Operator; label: string; symbol: string }> = [
  { value: 'addition', label: 'Addition', symbol: '+' },
  { value: 'subtraction', label: 'Subtraktion', symbol: '−' },
  { value: 'multiplication', label: 'Multiplikation', symbol: '·' },
  { value: 'division', label: 'Division', symbol: ':' },
  { value: 'power', label: 'Potenzen', symbol: '²' },
  { value: 'root', label: 'Wurzeln', symbol: '√' },
]

const gcd = (left: number, right: number): number => {
  let a = Math.abs(left)
  let b = Math.abs(right)
  while (b !== 0) {
    const remainder = a % b
    a = b
    b = remainder
  }
  return a || 1
}

export const fraction = (numerator: number, denominator = 1): Fraction => {
  if (denominator === 0) throw new Error('Der Nenner darf nicht null sein.')
  const sign = denominator < 0 ? -1 : 1
  const divisor = gcd(numerator, denominator)
  return { numerator: (sign * numerator) / divisor, denominator: (sign * denominator) / divisor }
}

export const add = (left: Fraction, right: Fraction): Fraction =>
  fraction(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  )

export const subtract = (left: Fraction, right: Fraction): Fraction =>
  fraction(
    left.numerator * right.denominator - right.numerator * left.denominator,
    left.denominator * right.denominator,
  )

export const multiply = (left: Fraction, right: Fraction): Fraction =>
  fraction(left.numerator * right.numerator, left.denominator * right.denominator)

export const divide = (left: Fraction, right: Fraction): Fraction => {
  if (right.numerator === 0) throw new Error('Division durch null ist nicht möglich.')
  return fraction(left.numerator * right.denominator, left.denominator * right.numerator)
}

export const power = (base: Fraction, exponent: number): Fraction => {
  if (exponent < 0) return divide(fraction(1), power(base, Math.abs(exponent)))
  return fraction(base.numerator ** exponent, base.denominator ** exponent)
}

export const isInteger = (value: Fraction): boolean => value.denominator === 1

export const formatFraction = (value: Fraction): string => {
  if (value.denominator === 1) return String(value.numerator)
  const whole = Math.trunc(value.numerator / value.denominator)
  const remainder = Math.abs(value.numerator % value.denominator)
  if (whole !== 0) return `${whole} ${remainder}/${value.denominator}`
  return `${value.numerator}/${value.denominator}`
}

const precedence = (expression: Expression): number => {
  if (expression.kind === 'number') return 4
  if (expression.operator === 'root' || expression.operator === 'power') return 3
  if (expression.operator === 'multiplication' || expression.operator === 'division') return 2
  return 1
}

const needsParentheses = (
  expression: Expression,
  parentOperator: Operator | undefined,
  parentPrecedence: number,
  isRightChild: boolean,
): boolean => {
  if (expression.kind !== 'operation') return false
  if (expression.parenthesized || precedence(expression) < parentPrecedence) return true
  return isRightChild && precedence(expression) === parentPrecedence && parentOperator !== undefined
}

const formatExpressionText = (
  expression: Expression,
  parentOperator?: Operator,
  parentPrecedence = 0,
  isRightChild = false,
): string => {
  if (expression.kind === 'number') return expression.display ?? formatFraction(expression.value)
  const currentPrecedence = precedence(expression)
  let result: string
  if (expression.operator === 'root') {
    result = `√${formatExpressionText(expression.value!, 'root', currentPrecedence)}`
  } else if (expression.operator === 'power') {
    result = `${formatExpressionText(expression.left!, 'power', currentPrecedence)}²`
  } else {
    const symbol = OPERATORS.find((item) => item.value === expression.operator)?.symbol ?? '?'
    result = `${formatExpressionText(expression.left!, expression.operator, currentPrecedence)} ${symbol} ${formatExpressionText(expression.right!, expression.operator, currentPrecedence, true)}`
  }
  return needsParentheses(expression, parentOperator, parentPrecedence, isRightChild)
    ? `(${result})`
    : result
}

export const formatExpression = (expression: Expression): string => formatExpressionText(expression)

const formatExpressionHtmlInternal = (
  expression: Expression,
  parentOperator?: Operator,
  parentPrecedence = 0,
  isRightChild = false,
): string => {
  if (expression.kind === 'number') {
    if (expression.displayKind === 'decimal' && expression.display) return expression.display
    if (expression.value.denominator === 1) return String(expression.value.numerator)
    const [numerator, denominator] = expression.display?.split('/') ?? [
      expression.value.numerator,
      expression.value.denominator,
    ]
    return `<span class="fraction"><span>${numerator}</span><span>${denominator}</span></span>`
  }
  const currentPrecedence = precedence(expression)
  let result: string
  if (expression.operator === 'root') {
    result = `√${formatExpressionHtmlInternal(expression.value!, 'root', currentPrecedence)}`
  } else if (expression.operator === 'power') {
    result = `${formatExpressionHtmlInternal(expression.left!, 'power', currentPrecedence)}<sup>2</sup>`
  } else {
    const symbol = OPERATORS.find((item) => item.value === expression.operator)?.symbol ?? '?'
    result = `${formatExpressionHtmlInternal(expression.left!, expression.operator, currentPrecedence)} ${symbol} ${formatExpressionHtmlInternal(expression.right!, expression.operator, currentPrecedence, true)}`
  }
  return needsParentheses(expression, parentOperator, parentPrecedence, isRightChild)
    ? `(${result})`
    : result
}

export const formatExpressionHtml = (expression: Expression): string =>
  formatExpressionHtmlInternal(expression)

export const evaluate = (expression: Expression): Fraction => {
  if (expression.kind === 'number') return expression.value
  if (expression.operator === 'root') {
    const value = evaluate(expression.value!)
    const root = Math.sqrt(value.numerator / value.denominator)
    if (!Number.isInteger(root)) throw new Error('Diese Wurzel ist nicht exakt.')
    return fraction(root)
  }
  if (expression.operator === 'power') return power(evaluate(expression.left!), 2)
  const left = evaluate(expression.left!)
  const right = evaluate(expression.right!)
  if (expression.operator === 'addition') return add(left, right)
  if (expression.operator === 'subtraction') return subtract(left, right)
  if (expression.operator === 'multiplication') return multiply(left, right)
  return divide(left, right)
}
