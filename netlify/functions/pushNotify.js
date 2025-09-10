import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const subject = process.env.VAPID_SUBJECT || 'mailto:support@example.com'
webpush.setVapidDetails(subject, process.env.VAPID_PUBLIC_KEY || '', process.env.VAPID_PRIVATE_KEY || '')

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }

    // Optionally protect this endpoint with a token header
    // if (event.headers['x-function-token'] !== process.env.NETLIFY_FUNCTION_TOKEN) return { statusCode: 401, body: 'Unauthorized' }

    const body = JSON.parse(event.body || '{}')
    const profileIds = body.profileIds || []
    const payload = body.payload || {}
    if (!Array.isArray(profileIds) || profileIds.length === 0) {
      return { statusCode: 400, body: 'profileIds required' }
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false },
    })

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .in('profile_id', profileIds)

    if (error) return { statusCode: 500, body: error.message }

    let sent = 0
    for (const s of subs || []) {
      try {
        await webpush.sendNotification({
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        }, JSON.stringify(payload))
        sent++
      } catch (e) {
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
        }
      }
    }
    return { statusCode: 200, body: JSON.stringify({ sent }) }
  } catch (e) {
    return { statusCode: 500, body: e?.message || 'Internal error' }
  }
}

