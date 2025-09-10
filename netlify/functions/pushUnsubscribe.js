import { createClient } from '@supabase/supabase-js'

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' }
    }

    const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '')
    if (!token) return { statusCode: 401, body: 'Missing auth token' }

    const body = JSON.parse(event.body || '{}')
    const { endpoint } = body || {}
    if (!endpoint) return { statusCode: 400, body: 'Invalid payload' }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false },
    })

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return { statusCode: 401, body: 'Invalid token' }
    const uid = userData.user.id

    // fetch user profile ids
    const profRes = await supabase.from('profiles').select('id').eq('user_id', uid)
    if (profRes.error) return { statusCode: 500, body: profRes.error.message }
    const profileIds = (profRes.data || []).map((r) => r.id)
    if (profileIds.length === 0) return { statusCode: 200, body: 'OK' }

    const { error: delErr } = await supabase
      .from('push_subscriptions')
      .delete()
      .in('profile_id', profileIds)
      .eq('endpoint', endpoint)
    if (delErr) return { statusCode: 500, body: delErr.message }

    return { statusCode: 200, body: 'OK' }
  } catch (e) {
    return { statusCode: 500, body: e?.message || 'Internal error' }
  }
}

