export interface ContactRequest {
  name: string
  email: string
  phone?: string
  subject: string
  subject_type?: string
  message: string
}
