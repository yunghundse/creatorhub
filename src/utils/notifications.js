import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Erstellt eine Benachrichtigung in Firestore
 * @param {Object} params
 * @param {string} params.recipientId - UID des Empfängers
 * @param {string} params.type - 'approval' | 'invite' | 'task' | 'calendar' | 'system'
 * @param {string} params.title - Titel der Benachrichtigung
 * @param {string} params.message - Nachrichtentext
 * @param {string} [params.link] - Optionaler Link zum Ziel
 * @param {string} [params.senderId] - UID des Absenders
 */
export const createNotification = async ({ recipientId, type, title, message, link = null, senderId = null }) => {
  if (!recipientId || !title) return

  try {
    await addDoc(collection(db, 'notifications'), {
      recipientId,
      type: type || 'system',
      title,
      message: message || '',
      link,
      senderId,
      read: false,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.error('Notification create error:', err)
  }
}

/**
 * Sendet eine Benachrichtigung an alle Team-Mitglieder einer Company
 * @param {Array} members - Array von company_members Docs
 * @param {string} excludeUserId - User-ID die ausgeschlossen wird (Absender)
 * @param {Object} notification - { type, title, message, link }
 */
export const notifyTeam = async (members, excludeUserId, notification) => {
  const targets = members.filter(m =>
    m.userId !== excludeUserId && m.status === 'approved'
  )

  const promises = targets.map(m =>
    createNotification({
      recipientId: m.userId,
      senderId: excludeUserId,
      ...notification,
    })
  )

  await Promise.all(promises)
}

/**
 * Benachrichtigt den Company-Owner
 * @param {string} ownerId - UID des Owners
 * @param {Object} notification - { type, title, message, link, senderId }
 */
export const notifyOwner = async (ownerId, notification) => {
  await createNotification({
    recipientId: ownerId,
    ...notification,
  })
}
