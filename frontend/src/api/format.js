export function claimCode(id) { return `AX-${String(id).padStart(4, '0')}`; }
export function dateOnly(value) { return value ? String(value).slice(0, 10) : '—'; }
export function policyName(value) { return ({ basic: 'Basic Cover', standard: 'Standard Cover', extended: 'Extended Cover' })[value] || '—'; }
export function resultKind(value) { return value === 'Valid Claim' ? 'valid' : value === 'Invalid Claim' ? 'invalid' : 'review'; }
