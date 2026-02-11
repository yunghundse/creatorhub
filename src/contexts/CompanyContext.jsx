import React, { createContext, useContext, useState, useEffect } from 'react'
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { createNotification } from '../utils/notifications'

const CompanyContext = createContext(null)

export const useCompany = () => useContext(CompanyContext)

export const CompanyProvider = ({ user, userData, children }) => {
  const [company, setCompany] = useState(null)
  const [membership, setMembership] = useState(null) // { status: 'pending' | 'approved', role, joinedAt }
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  const userRole = userData?.role || 'model'
  const canOwnCompany = userRole === 'manager'
  const canJoinCompany = userRole === 'model'

  // Load company + membership data
  useEffect(() => {
    if (!user?.uid || !userData) { setLoading(false); return }

    const loadCompanyData = async () => {
      try {
        // Check if user owns a company
        if (canOwnCompany) {
          const ownerQuery = query(collection(db, 'companies'), where('ownerId', '==', user.uid))
          const ownerSnap = await getDocs(ownerQuery)
          if (!ownerSnap.empty) {
            const companyDoc = ownerSnap.docs[0]
            setCompany({ id: companyDoc.id, ...companyDoc.data() })
            setIsOwner(true)
            setMembership({ status: 'approved', role: 'owner' })
            setLoading(false)
            return
          }
        }

        // Check company_members for this user
        const memberQuery = query(collection(db, 'company_members'), where('userId', '==', user.uid))
        const memberSnap = await getDocs(memberQuery)

        if (!memberSnap.empty) {
          const memberDoc = memberSnap.docs[0]
          const memberData = memberDoc.data()
          setMembership({ id: memberDoc.id, ...memberData })

          // Load company details
          if (memberData.companyId) {
            const compSnap = await getDoc(doc(db, 'companies', memberData.companyId))
            if (compSnap.exists()) {
              setCompany({ id: compSnap.id, ...compSnap.data() })
            }
          }
        } else if (userData?.companyId) {
          // Legacy: user has companyId directly on their doc (from old system)
          const compSnap = await getDoc(doc(db, 'companies', userData.companyId))
          if (compSnap.exists()) {
            setCompany({ id: compSnap.id, ...compSnap.data() })
            const isLegacyOwner = compSnap.data().ownerId === user.uid
            setIsOwner(isLegacyOwner)
            setMembership({ status: 'approved', role: isLegacyOwner ? 'owner' : userRole })
          }
        }
      } catch (err) {
        console.error('CompanyContext load error:', err)
      }
      setLoading(false)
    }

    loadCompanyData()
  }, [user?.uid, userData?.companyId, userData?.role])

  // Load members in real-time when company is set
  useEffect(() => {
    if (!company?.id) { setMembers([]); return }

    // Listen to company_members
    const q = query(collection(db, 'company_members'), where('companyId', '==', company.id))
    const unsub = onSnapshot(q, async (snap) => {
      const memberList = []
      for (const memberDoc of snap.docs) {
        const data = memberDoc.data()
        try {
          const userSnap = await getDoc(doc(db, 'users', data.userId))
          if (userSnap.exists()) {
            memberList.push({
              id: memberDoc.id,
              ...data,
              user: { uid: data.userId, ...userSnap.data() }
            })
          }
        } catch (e) { /* skip invalid user */ }
      }
      setMembers(memberList)
    })

    return () => { unsub() }
  }, [company?.id])

  // Create a new company (manager only)
  const createCompany = async (companyName) => {
    if (!canOwnCompany) throw new Error('Nur Manager können Firmen erstellen.')
    if (!companyName?.trim()) throw new Error('Bitte gib einen Firmennamen ein.')

    // Check if manager already has a company
    const existingQ = query(collection(db, 'companies'), where('ownerId', '==', user.uid))
    const existingSnap = await getDocs(existingQ)
    if (!existingSnap.empty) throw new Error('Du hast bereits eine Firma.')

    // Generate invite code (6 chars)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]

    const companyData = {
      name: companyName.trim(),
      ownerId: user.uid,
      ownerEmail: user.email,
      inviteCode: code,
      abo: 'free',
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'companies'), companyData)

    // Set companyId on user doc (legacy support)
    await updateDoc(doc(db, 'users', user.uid), { companyId: docRef.id })

    setCompany({ id: docRef.id, ...companyData })
    setIsOwner(true)
    setMembership({ status: 'approved', role: 'owner' })

    return { id: docRef.id, inviteCode: code, ...companyData }
  }

  // Join company via invite code
  const joinCompany = async (inviteCode) => {
    const q = query(collection(db, 'companies'), where('inviteCode', '==', inviteCode.trim().toUpperCase()))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Ungültiger Einladungscode')

    const companyDoc = snap.docs[0]
    const companyData = companyDoc.data()
    const companyId = companyDoc.id

    // Check slot limits
    const limits = { free: 1, pro: 5, business: 10 }
    const maxSlots = limits[companyData.abo || 'free'] || 1
    const existingMembers = await getDocs(query(collection(db, 'company_members'), where('companyId', '==', companyId)))
    if (existingMembers.size >= maxSlots) {
      throw new Error(`Team ist voll (${existingMembers.size}/${maxSlots}). Manager muss upgraden.`)
    }

    // Check if already member
    const existingQuery = query(collection(db, 'company_members'), where('userId', '==', user.uid), where('companyId', '==', companyId))
    const existingSnap = await getDocs(existingQuery)
    if (!existingSnap.empty) throw new Error('Du bist bereits Mitglied dieser Firma.')

    // Create membership with pending status
    await addDoc(collection(db, 'company_members'), {
      companyId,
      userId: user.uid,
      status: 'pending',
      role: userRole,
      joinedAt: serverTimestamp()
    })

    // Also set legacy companyId for backward compatibility
    await updateDoc(doc(db, 'users', user.uid), { companyId })

    // Notify company owner about new join request
    try {
      await createNotification({
        recipientId: companyData.ownerId,
        type: 'invite',
        title: 'Neue Beitrittsanfrage',
        message: `${user.displayName || user.email} möchte deinem Team "${companyData.name}" beitreten.`,
        link: '/firma/admin',
        senderId: user.uid,
      })
    } catch (notifErr) { console.warn('Join notification error:', notifErr) }

    setCompany({ id: companyId, ...companyData })
    setMembership({ status: 'pending', role: userRole })
    return companyData.name
  }

  // Approve member (owner only)
  const approveMember = async (membershipId) => {
    await updateDoc(doc(db, 'company_members', membershipId), { status: 'approved' })

    // Notify the approved member
    try {
      const memberSnap = await getDoc(doc(db, 'company_members', membershipId))
      if (memberSnap.exists()) {
        await createNotification({
          recipientId: memberSnap.data().userId,
          type: 'approval',
          title: 'Freischaltung',
          message: `Du wurdest im Team "${company?.name}" freigeschaltet! Du hast jetzt Zugriff auf alle Team-Features.`,
          link: '/firma/dashboard',
          senderId: user.uid,
        })
      }
    } catch (notifErr) { console.warn('Approve notification error:', notifErr) }
  }

  // Remove member (owner only)
  const removeMember = async (membershipId, userId) => {
    await deleteDoc(doc(db, 'company_members', membershipId))
    await updateDoc(doc(db, 'users', userId), { companyId: null })
  }

  // Leave company
  const leaveCompany = async () => {
    if (membership?.id) {
      await deleteDoc(doc(db, 'company_members', membership.id))
    }
    await updateDoc(doc(db, 'users', user.uid), { companyId: null })
    setCompany(null)
    setMembership(null)
    setMembers([])
  }

  const isApproved = membership?.status === 'approved' || isOwner
  const isPending = membership?.status === 'pending'
  const hasCompany = !!company

  return (
    <CompanyContext.Provider value={{
      company, membership, members, loading,
      isOwner, isApproved, isPending, hasCompany,
      canOwnCompany, canJoinCompany,
      createCompany, joinCompany, approveMember, removeMember, leaveCompany,
      userRole
    }}>
      {children}
    </CompanyContext.Provider>
  )
}

export default CompanyContext
