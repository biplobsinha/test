const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchTransactions(status = null, limit = 100) {
  let url = `${API_BASE_URL}/transactions?limit=${limit}`;
  if (status && status !== 'ALL') {
    url += `&status=${status}`;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function fetchTransactionStats() {
  const response = await fetch(`${API_BASE_URL}/transactions/stats`);
  if (!response.ok) throw new Error('Failed to fetch transaction stats');
  return response.json();
}

export async function fetchTransactionDetail(txId) {
  const response = await fetch(`${API_BASE_URL}/transactions/${txId}`);
  if (!response.ok) throw new Error('Failed to fetch transaction detail');
  return response.json();
}

export async function investigateTransaction(txId) {
  const response = await fetch(`${API_BASE_URL}/transactions/${txId}/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to run AI investigation');
  return response.json();
}

export async function submitDecision(txId, action, rationale) {
  const response = await fetch(`${API_BASE_URL}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_id: txId,
      action: action,
      rationale: rationale || 'Analyst action submitted via RiskForge Console.'
    })
  });
  if (!response.ok) throw new Error('Failed to record analyst decision');
  return response.json();
}

export async function fetchDecisions() {
  const response = await fetch(`${API_BASE_URL}/decisions`);
  if (!response.ok) throw new Error('Failed to fetch decision audit log');
  return response.json();
}
