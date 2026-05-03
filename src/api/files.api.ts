import apiClient from './client'

interface UploadResponse {
  url: string
}

function uploadFile(endpoint: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post<UploadResponse>(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function uploadAvatar(file: File) {
  return uploadFile('/files/avatars', file)
}

export function uploadProjectImage(file: File) {
  return uploadFile('/files/projects', file)
}

export function uploadInfrastructureImage(file: File) {
  return uploadFile('/files/infrastructures', file)
}
