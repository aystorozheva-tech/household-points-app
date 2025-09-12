const { createClient } = require('@supabase/supabase-js')
const webpush = require('web-push')

const subject = process.env.VAPID_SUBJECT || 'mailto:support@example.com'
const appName = process.env.PWA_NAME || 'Хлопоты'
webpush.setVapidDetails(subject, process.env.VAPID_PUBLIC_KEY || '', process.env.VAPID_PRIVATE_KEY || '')

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }

    // Optional: protect with token
    // if (event.headers['x-function-token'] !== process.env.NETLIFY_FUNCTION_TOKEN) return { statusCode: 401, body: 'Unauthorized' }

    const body = JSON.parse(event.body || '{}')
    const { householdId, type, entity } = body || {}
    if (!householdId || !type || !entity) {
      return { statusCode: 400, body: 'Invalid payload' }
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } })

    // Resolve actor from Authorization: Bearer <jwt>
    const token = (event.headers.authorization || '').replace(/^Bearer\s+/i, '')
    let actorProfileId = null
    let actorName = 'Пользователь'
    if (token) {
      const { data: userData } = await supabase.auth.getUser(token)
      const uid = userData?.user?.id
      if (uid) {
        const { data: actor } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('household_id', householdId)
          .eq('user_id', uid)
          .maybeSingle()
        if (actor?.id) {
          actorProfileId = actor.id
          actorName = actor.display_name || actorName
        }
      }
    }

    const { data: recipients, error: recErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('household_id', householdId)
      .neq('id', actorProfileId || '00000000-0000-0000-0000-000000000000')
    if (recErr) return { statusCode: 500, body: recErr.message }
    const profileIds = (recipients || []).map((r) => r.id)
    if (profileIds.length === 0) return { statusCode: 200, body: 'No recipients' }

    function entryMsg(kind, title, points, editedAction, finedName) {
      if (editedAction === 'edited') return `${actorName} отредактировал(-а): ${title}`
      if (editedAction === 'deleted') return `${actorName} удалил(-а): ${title}`
      if (kind === 'task') return `${actorName} похлопотал(-а): ${title}, ${points >= 0 ? '+' : ''}${points} баллов`
      if (kind === 'reward') return `${actorName} наградил(-а): ${title}, ${points >= 0 ? '+' : ''}${points} баллов`
      if (kind === 'penalty') return `${finedName || actorName} наказан(-а): ${title}, ${points >= 0 ? '+' : ''}${points} баллов`
      return `${actorName}: ${title}`
    }

    function choreMsg(title) { return `${actorName} отредактировала(-а): ${title}` }
    function penaltyMsg(title) { return `${actorName} отредактировала(-а): ${title}` }

    let notifTitle = appName
    let bodyText = ''
    let url = '/#/history'
    switch (type) {
      case 'entry_created': {
        let finedName = null
        if (entity.kind === 'penalty' && entity.id) {
          // Resolve fined player's display name from the entry's profile_id
          const { data: entry } = await supabase
            .from('entries')
            .select('profile_id')
            .eq('id', entity.id)
            .maybeSingle()
          const profileId = entry?.profile_id
          if (profileId) {
            const { data: fined } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', profileId)
              .maybeSingle()
            finedName = fined?.display_name || null
          }
        }
        bodyText = entryMsg(entity.kind, entity.title, entity.points, undefined, finedName)
        url = '/#/history'
        break
      }
      case 'entry_edited':
        bodyText = entryMsg(entity.kind, entity.title, entity.points, 'edited')
        url = `/#/edit-entry/${entity.id}`
        break
      case 'entry_deleted':
        bodyText = entryMsg(entity.kind, entity.title, entity.points, 'deleted')
        url = `/#/edit-entry/${entity.id}`
        break
      case 'chore_edited':
        bodyText = choreMsg(entity.title)
        url = `/#/config/tasks/${entity.id}`
        break
      case 'penalty_edited':
        bodyText = penaltyMsg(entity.title)
        url = `/#/config/punishments/${entity.id}`
        break
      default:
        bodyText = 'Новое уведомление'
    }

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .in('profile_id', profileIds)
    if (error) return { statusCode: 500, body: error.message }

    let sent = 0
    for (const s of subs || []) {
      try {
        // Hide bold title: use zero-width space so SW doesn't fallback to default
        const payload = { title: '\u200B', body: bodyText, data: { url } }
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload))
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
