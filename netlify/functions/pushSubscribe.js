import { createClient } from '@supabase/supabase-js'

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' }
    }

    const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '')
    if (!token) return { statusCode: 401, body: 'Missing auth token' }

    const body = JSON.parse(event.body || '{}')
    const { profile_id, endpoint, keys, expirationTime } = body || {}
    if (!profile_id || !endpoint || !keys?.p256dh || !keys?.auth) {
      return { statusCode: 400, body: 'Invalid payload' }
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false },
    })

    // Validate the token and ensure the profile belongs to this user
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return { statusCode: 401, body: 'Invalid token' }
    const uid = userData.user.id

    const { data: prof } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('id', profile_id)
      .limit(1)
      .maybeSingle()

    if (!prof || prof.user_id !== uid) {
      return { statusCode: 403, body: 'Profile does not belong to current user' }
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          profile_id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          expiration_time: expirationTime ?? null,
        },
        { onConflict: 'profile_id,endpoint' }
      )

    if (error) return { statusCode: 500, body: error.message }
    return { statusCode: 200, body: 'OK' }
  } catch (e) {
    return { statusCode: 500, body: e?.message || 'Internal error' }
  }
}

