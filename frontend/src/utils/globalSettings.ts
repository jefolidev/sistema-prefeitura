const apiUrl = import.meta.env.URL_BACKEND || 'http://localhost:4444'

export default {
  url_backend: apiUrl,
  length_code_verification: 8,
}
