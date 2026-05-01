import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveTenantFromRequest, type TenantServerContext } from '@/lib/tenant-server'
import { metadataCompanyId, metadataRole } from '@/lib/tenant-config'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function verifyAdmin(req: NextRequest): Promise<TenantServerContext | null> {
  try {
    const context = await resolveTenantFromRequest(req)
    return context.tenant.role === 'admin' ? context : null
  } catch {
    return null
  }
}

async function ensureSameCompany(userId: string, companyId: string) {
  const { data } = await adminClient
    .from('company_memberships')
    .select('user_id')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .maybeSingle()

  return Boolean(data)
}

export async function GET(req: NextRequest) {
  const context = await verifyAdmin(req)
  if (!context) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: memberships } = await adminClient
    .from('company_memberships')
    .select('user_id, role')
    .eq('company_id', context.tenant.companyId)

  const membershipByUserId = new Map((memberships ?? []).map(m => [m.user_id, m.role as 'admin' | 'staff']))
  const { data: { users }, error } = await adminClient.auth.admin.listUsers()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const scopedUsers = users.filter(u =>
    membershipByUserId.has(u.id) || metadataCompanyId(u) === context.tenant.companyId
  )

  return NextResponse.json({ users: scopedUsers.map(u => ({
    id: u.id,
    email: u.email,
    role: membershipByUserId.get(u.id) ?? metadataRole(u),
    createdAt: u.created_at,
    lastSignIn: u.last_sign_in_at,
  })), company: context.tenant })
}

export async function PATCH(req: NextRequest) {
  const context = await verifyAdmin(req)
  if (!context) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { userId, role } = await req.json()
  if (role !== 'admin' && role !== 'staff') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }
  if (!await ensureSameCompany(userId, context.tenant.companyId)) {
    return NextResponse.json({ error: 'User is not in this company' }, { status: 403 })
  }

  await adminClient
    .from('company_memberships')
    .update({ role })
    .eq('company_id', context.tenant.companyId)
    .eq('user_id', userId)

  const { data: { user } } = await adminClient.auth.admin.getUserById(userId)
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: { ...(user?.user_metadata ?? {}), role, company_id: context.tenant.companyId }
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  const context = await verifyAdmin(req)
  if (!context) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { email } = await req.json()
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { role: 'staff', company_id: context.tenant.companyId },
    redirectTo: 'https://ai-business-assistant-one.vercel.app/dashboard',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (data.user?.id) {
    await adminClient.from('company_memberships').upsert({
      company_id: context.tenant.companyId,
      user_id: data.user.id,
      role: 'staff',
    })
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const context = await verifyAdmin(req)
  if (!context) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { userId } = await req.json()
  if (!await ensureSameCompany(userId, context.tenant.companyId)) {
    return NextResponse.json({ error: 'User is not in this company' }, { status: 403 })
  }
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
