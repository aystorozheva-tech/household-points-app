import { supabase } from './supabase'

export async function notifyEvent(payload: {
  householdId: string
  actorProfileId: string
  type: 'entry_created'|'entry_edited'|'entry_deleted'|'chore_edited'|'penalty_edited'
  entity: { id: string; title: string; kind?: 'task'|'reward'|'penalty'; points?: number }
}) {
  try {
    const { data: sess } = await supabase.auth.getSession()
    const jwt = sess.session?.access_token
    await fetch('/.netlify/functions/notifyEvent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    // non-blocking
    console.error('notifyEvent failed', e)
  }
}
