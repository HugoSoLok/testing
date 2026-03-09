import { describe, it, expect } from 'vitest'
import { calculateSplit } from '@/lib/split'

const hugo = { id: 1, name: 'Hugo' }
const mm   = { id: 2, name: 'MM' }

describe('calculateSplit', () => {
  // ─── 2-member normal case ─────────────────────────────────────────────────
  it('2-member: MM pays Hugo $50 when Hugo paid $200 and MM paid $100', () => {
    const paid = new Map([[1, 200], [2, 100]])
    const result = calculateSplit(paid, [hugo, mm], 300)

    expect(result.members).toHaveLength(2)

    const hugoSplit = result.members.find(m => m.id === 1)!
    expect(hugoSplit.paid).toBe(200)
    expect(hugoSplit.fairShare).toBe(150)
    expect(hugoSplit.balance).toBeCloseTo(50)

    const mmSplit = result.members.find(m => m.id === 2)!
    expect(mmSplit.paid).toBe(100)
    expect(mmSplit.fairShare).toBe(150)
    expect(mmSplit.balance).toBeCloseTo(-50)

    expect(result.settlement).toBe('MM pays Hugo $50.00')
  })

  // ─── All-settled case ─────────────────────────────────────────────────────
  it('returns "All settled" when both members paid equally', () => {
    const paid = new Map([[1, 150], [2, 150]])
    const result = calculateSplit(paid, [hugo, mm], 300)

    expect(result.settlement).toBe('All settled — no payment needed')
    result.members.forEach(m => {
      expect(m.balance).toBeCloseTo(0)
    })
  })

  // ─── 1-member edge case ──────────────────────────────────────────────────
  it('1-member: single member owes nothing to anyone', () => {
    const paid = new Map([[1, 150]])
    const result = calculateSplit(paid, [hugo], 150)

    expect(result.members).toHaveLength(1)
    expect(result.members[0].balance).toBeCloseTo(0)
    expect(result.settlement).toBe('All settled — no payment needed')
  })

  // ─── Zero-expense case ───────────────────────────────────────────────────
  it('zero expenses: all amounts are $0.00 and settlement is "All settled"', () => {
    const paid = new Map<number, number>()
    const result = calculateSplit(paid, [hugo, mm], 0)

    expect(result.members).toHaveLength(2)
    result.members.forEach(m => {
      expect(m.paid).toBe(0)
      expect(m.fairShare).toBe(0)
      expect(m.balance).toBe(0)
    })
    expect(result.settlement).toBe('All settled — no payment needed')
  })

  // ─── Empty members edge case ──────────────────────────────────────────────
  it('empty members list: returns empty members and all settled', () => {
    const result = calculateSplit(new Map(), [], 0)
    expect(result.members).toHaveLength(0)
    expect(result.settlement).toBe('All settled — no payment needed')
  })

  // ─── One member paid everything ──────────────────────────────────────────
  it('2-member: Hugo paid everything ($300), MM paid nothing', () => {
    const paid = new Map([[1, 300], [2, 0]])
    const result = calculateSplit(paid, [hugo, mm], 300)

    expect(result.settlement).toBe('MM pays Hugo $150.00')
  })
})
