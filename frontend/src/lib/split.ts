// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberSplit {
  id: number
  name: string
  paid: number
  fairShare: number
  balance: number // positive = overpaid (creditor), negative = underpaid (debtor)
}

export interface SplitResult {
  members: MemberSplit[]
  settlement: string
}

// ─── Pure split calculator ────────────────────────────────────────────────────

/**
 * Calculate who owes whom for a given month.
 *
 * @param memberPaidMap  Map<memberId, totalPaid> from the expenses store
 * @param members        All household members (id + name)
 * @param total          Monthly total (sum of all expense amounts)
 */
export function calculateSplit(
  memberPaidMap: Map<number, number>,
  members: { id: number; name: string }[],
  total: number,
): SplitResult {
  if (members.length === 0 || total === 0) {
    const empty: MemberSplit[] = members.map(m => ({
      id: m.id,
      name: m.name,
      paid: memberPaidMap.get(m.id) ?? 0,
      fairShare: 0,
      balance: 0,
    }))
    return { members: empty, settlement: 'All settled — no payment needed' }
  }

  const fairShare = total / members.length

  const memberSplits: MemberSplit[] = members.map(m => {
    const paid = memberPaidMap.get(m.id) ?? 0
    return { id: m.id, name: m.name, paid, fairShare, balance: paid - fairShare }
  })

  // Separate creditors (overpaid) and debtors (underpaid)
  const EPSILON = 0.005
  const creditors = memberSplits
    .filter(m => m.balance > EPSILON)
    .map(m => ({ ...m }))
    .sort((a, b) => b.balance - a.balance)

  const debtors = memberSplits
    .filter(m => m.balance < -EPSILON)
    .map(m => ({ ...m }))
    .sort((a, b) => a.balance - b.balance)

  if (creditors.length === 0) {
    return { members: memberSplits, settlement: 'All settled — no payment needed' }
  }

  // Greedy settlement: match largest creditor with largest debtor
  const settlements: string[] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const available = creditors[ci].balance
    const owed = Math.abs(debtors[di].balance)
    const amount = Math.min(available, owed)

    if (amount > EPSILON) {
      settlements.push(
        `${debtors[di].name} pays ${creditors[ci].name} $${amount.toFixed(2)}`,
      )
    }

    creditors[ci].balance -= amount
    debtors[di].balance += amount

    if (creditors[ci].balance < EPSILON) ci++
    if (Math.abs(debtors[di].balance) < EPSILON) di++
  }

  return {
    members: memberSplits,
    settlement: settlements.length > 0
      ? settlements.join('; ')
      : 'All settled — no payment needed',
  }
}
