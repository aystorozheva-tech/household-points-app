import { supabase } from './supabase'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function registerForPush(profileId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push is not supported on this browser')
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Permission not granted')

  const reg = await navigator.serviceWorker.ready
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
  if (!publicKey) throw new Error('Missing VAPID public key')
  const applicationServerKey = urlBase64ToUint8Array(publicKey)

  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
  const raw: any = sub.toJSON()

  const { data: sess } = await supabase.auth.getSession()
  const jwt = sess.session?.access_token
  const resp = await fetch('/.netlify/functions/pushSubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify({ profile_id: profileId, endpoint: sub.endpoint, keys: raw.keys, expirationTime: raw.expirationTime }),
  })
  if (!resp.ok) throw new Error('Failed to save subscription')
  return sub
}

export async function unregisterFromPush() {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return
  const raw: any = sub.toJSON()
  const { data: sess } = await supabase.auth.getSession()
  const jwt = sess.session?.access_token
  await fetch('/.netlify/functions/pushUnsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify({ endpoint: sub.endpoint, keys: raw.keys, expirationTime: raw.expirationTime }),
  })
  await sub.unsubscribe()
}

