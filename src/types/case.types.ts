// Type definitions matching backend DTOs

export interface CaseSummary {
  case_id: number;
  status: string;
  created_at: string;
  city: string;
  state: string;
  doc_count: number;
  agreement_count: number;
}

export interface CaseInfo {
  case_id: number;
  city: string;
  state: string;
  incident_date: string | null;
  description: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  consent_store: boolean;
  consent_contact: boolean;
  consent_at: string | null;
}

export interface Incident {
  case_id: number;
  description: string;
  incident_date: string | null;
  city: string;
  state_code: string;
  created_at: string;
}

export interface Damage {
  case_id: number;
  physical_injury: boolean;
  property_damage: boolean;
  emotional_distress: boolean;
  financial_loss: boolean;
  description: string;
  created_at: string;
}

export interface Contact {
  case_id: number;
  preferred_contact_method: string;
  best_time_to_contact: string;
  additional_notes: string;
  created_at: string;
}

export interface Party {
  id: number;
  case_id: number;
  party_type: string;
  full_name: string;
  contact_info: string;
  role_description: string;
  created_at: string;
}

export interface Document {
  id: number;
  case_id: number;
  document_type: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  content_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface AgreementFile {
  id: number;
  agreement_id: number;
  file_name: string;
  storage_path: string;
  public_url: string;
  content_type: string;
  file_size: number;
  created_at: string;
}

export interface Agreement {
  id: number;
  case_id: number;
  lawyer_id: string;
  message: string;
  created_at: string;
  updated_at: string | null;
  files: AgreementFile[];
}

export interface CaseDetails {
  summary: CaseInfo;
  incident: Incident | null;
  damages: Damage | null;
  contact: Contact | null;
  parties: Party[];
  documents: Document[];
  agreements: Agreement[];
  caseInfo: {
    user_id: string;
    status: string;
    consent_store: boolean;
    consent_contact: boolean;
    consent_at: string | null;
    created_at: string;
    updated_at: string | null;
  } | null;
}

export interface CreateCaseRequest {
  status?: string;
  consent_store?: boolean;
  consent_contact?: boolean;
  consent_ad?: boolean;
}

export interface UpdateCaseRequest {
  status?: string;
  consent_store?: boolean;
  consent_contact?: boolean;
  consent_ad?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error: string;
}

export enum UserRole {
  GENERAL = 'general',
  LAWYER = 'lawyer',
  ADMIN = 'admin'
}
