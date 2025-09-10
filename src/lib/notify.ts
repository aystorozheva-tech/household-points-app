export async function notifyEvent(payload: {
  householdId: string
  actorProfileId: string
  type: 'entry_created'|'entry_edited'|'entry_deleted'|'chore_edited'|'penalty_edited'
  entity: { id: string; title: string; kind?: 'task'|'reward'|'penalty'; points?: number }
}) {
  try {
    await fetch('/.netlify/functions/notifyEvent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    // non-blocking
    console.error('notifyEvent failed', e)
  }
}

