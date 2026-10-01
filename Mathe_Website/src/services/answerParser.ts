import { fraction, type Fraction } from '../domain/math'

export const parseAnswer = (input: string): Fraction | null => {
  const value = input.trim().replace(',', '.')
  if (!value) return null

  if (/^-?\d+\s+\d+\/\d+$/.test(value)) {
    const [wholeText, fractionText] = value.split(/\s+/)
    const [numeratorText, denominatorText] = fractionText!.split('/')
    const denominator = Number(denominatorText)
    const whole = Number(wholeText)
    if (!denominator || Number.isNaN(whole)) return null
    const numerator = Math.abs(whole) * denominator + Number(numeratorText)
    return fraction(whole < 0 ? -numerator : numerator, denominator)
  }

  if (/^-?\d+\/\d+$/.test(value)) {
    const [numeratorText, denominatorText] = value.split('/')
    const denominator = Number(denominatorText)
    if (!denominator) return null
    return fraction(Number(numeratorText), denominator)
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    const [whole, decimals] = value.split('.')
    const denominator = decimals ? 10 ** decimals.length : 1
    return fraction(Number(`${whole}${decimals ?? ''}`), denominator)
  }

  return null
}
