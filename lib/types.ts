// ===== 共通型定義 =====

export type ToneType = 'soft' | 'standard' | 'formal' | 'strong'
export type StyleType = 'concise' | 'standard' | 'formal'

// ===== 営業メール =====
export interface EmailFormData {
  companyName: string
  contactName: string
  subject: string
  purpose: 'new' | 'thanks' | 'follow' | 'reproposal'
  tone: ToneType
  notes: string
  hasAttachment: boolean
}

export interface EmailOutput {
  subjectLine: string
  body: string
  suggestions: string[]
}

// ===== 議事録 =====
export interface MinutesFormData {
  date: string
  meetingName: string
  participants: string
  style: StyleType
  rawText: string
}

export interface MinutesOutput {
  summary: string
  decisions: string[]
  todos: Array<{ task: string; assignee: string; deadline: string }>
  nextItems: string[]
}

// ===== 提案文 =====
export interface ProposalFormData {
  targetCompany: string
  proposalContent: string
  challenge: string
  expectedEffect: string
  direction: string
  style: StyleType
  notes: string
}

export interface ProposalOutput {
  title: string
  overview: string
  challengeAnalysis: string
  proposalDetail: string
  expectedOutcome: string
  closing: string
}

// ===== 見積 =====
export interface EstimateItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  note: string
}

export interface EstimateFormData {
  clientName: string
  issueDate: string
  validUntil: string
  items: EstimateItem[]
  taxRate: number
  notes: string
}

// ===== 予約対応 =====
export interface ReservationFormData {
  customerName: string
  preferredDate: string
  preferredTime: string
  contact: string
  purpose: string
}

// ===== 設定 =====
export interface CompanySettings {
  companyName: string
  userName: string
  description: string
  preferredStyle: StyleType
  products: string
  prohibitedWords: string
  signature: string
}

// ===== Instagram投稿 =====
export interface InstagramFormData {
  theme: string
  purpose: 'awareness' | 'engagement' | 'announcement' | 'story'
  tone: 'friendly' | 'professional' | 'casual' | 'inspiring'
  useEmoji: boolean
  hashtagCount: number
  notes: string
}

export interface InstagramOutput {
  caption: string
  hashtags: string[]
  tips: string[]
}

// ===== 履歴 =====
export type DocumentType = 'email' | 'minutes' | 'proposal' | 'estimate' | 'reservation' | 'instagram' | 'invoice'

export interface HistoryItem {
  id: string
  type: DocumentType
  title: string
  preview: string
  createdAt: string
  status: 'draft' | 'saved' | 'approved'
}
