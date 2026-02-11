import React, { createContext, useContext, useState, useEffect } from 'react'
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const CompanyContext = createContext(null)

export const useCompany = () => useContext(CompanyContext)

export const CompanyProvider = ({ user, userData, children }) => {
  const [company, setCompany] = useState(null)
  const [membership, setMembership] = useState(null) // { status: 'pending' | 'approved', role, joinedAt }
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  const userRole = userData?.role || 'influencer'
  const canOwnCompany = ['manager', 'influencer'].includes(userRole)
  const canJoinCompany = ['model', 'cutter'].includes(userRole)

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

    // Also check legacy members (users with companyId field)
    const legacyQ = query(collection(db, 'users'), where('companyId', '==', company.id))
    const unsubLegacy = onSnapshot(legacyQ, (snap) => {
      // Legacy members are merged in the member list
    })

    return () => { unsub(); unsubLegacy() }
  }, [company?.id])

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

    setCompany({ id: companyId, ...companyData })
    setMembership({ status: 'pending', role: userRole })
    return companyData.name
  }

  // Approve member (owner only)
  const approveMember = async (membershipId) => {
    await updateDoc(doc(db, 'company_members', membershipId), { status: 'approved' })
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
      joinCompany, approveMember, removeMember, leaveCompany,
      userRole
    }}>
      {children}
    </CompanyContext.Provider>
  )
}

export default CompanyContext
