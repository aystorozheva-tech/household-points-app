const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }

    const subject = process.env.VAPID_SUBJECT || 'mailto:support@example.com'
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return { statusCode: 500, body: 'Server misconfigured' }
    }

    const body = JSON.parse(event.body || '{}')
    const { householdId, roomId } = body || {}
    if (!householdId || !roomId) return { statusCode: 400, body: 'householdId and roomId required' }

    // Validate the requester belongs to the household via JWT
    const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '')
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } })

    if (token) {
      const { data: userData } = await supabase.auth.getUser(token)
      const uid = userData?.user?.id
      if (!uid) return { statusCode: 403, body: 'Forbidden' }
      const { data: prof } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', uid)
        .eq('household_id', householdId)
        .maybeSingle()
      if (!prof?.id) return { statusCode: 403, body: 'Forbidden' }
    } else {
      return { statusCode: 401, body: 'Unauthorized' }
    }

    // 1) Remove references from chores.coefficient_dict for this room
    const { data: chores, error: choresErr } = await supabase
      .from('chores')
      .select('id, coefficient_dict')
      .eq('household_id', householdId)
    if (choresErr) return { statusCode: 500, body: choresErr.message }

    const toUpdate = (chores || []).filter(c => c.coefficient_dict && typeof c.coefficient_dict === 'object' && Object.prototype.hasOwnProperty.call(c.coefficient_dict, roomId))
    for (const ch of toUpdate) {
      const next = { ...(ch.coefficient_dict || {}) }
      delete next[roomId]
      const payload = { coefficient_dict: Object.keys(next).length > 0 ? next : null }
      const { error: updErr } = await supabase
        .from('chores')
        .update(payload)
        .eq('id', ch.id)
        .eq('household_id', householdId)
      if (updErr) return { statusCode: 500, body: updErr.message }
    }

    // 2) Delete the room itself
    const { data: delRows, error: delErr } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId)
      .eq('household_id', householdId)
      .select('id')
    if (delErr) return { statusCode: 500, body: delErr.message }
    if (!delRows || delRows.length === 0) return { statusCode: 404, body: 'Not found' }

    return { statusCode: 200, body: JSON.stringify({ deleted: delRows.length }) }
  } catch (e) {
    return { statusCode: 500, body: e?.message || 'Internal error' }
  }
}

