export interface ApiError {
  code: string
  message: string
  details: Array<{ field?: string; message: string }>
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiErrorResponse {
  error: ApiError
}
