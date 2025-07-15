// Real API Service for Backend Connection
import { API_CONFIG, getApiUrl } from './config'
import type { QueryRequest, QueryResponse, FileUploadResponse, ApiResponse } from './api'
import { logger } from './logger'

class RealApiService {
  async sendQuery(request: QueryRequest): Promise<ApiResponse<QueryResponse>> {
    const startTime = Date.now()
    const endpoint = API_CONFIG.ENDPOINTS.QUERY
    
    try {
      logger.apiRequest('POST', endpoint, { hasData: true })
      
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const duration = Date.now() - startTime
      logger.apiResponse('POST', endpoint, response.status, duration)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: data.success,
        data: data.data,
        error: data.error,
        timestamp: new Date(data.timestamp || Date.now())
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.apiError('POST', endpoint, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        data: {} as QueryResponse
      }
    }
  }

  async uploadFile(file: File): Promise<ApiResponse<FileUploadResponse>> {
    const startTime = Date.now()
    const endpoint = API_CONFIG.ENDPOINTS.UPLOAD
    
    try {
      console.log('=== REAL API UPLOAD DEBUG ===')
      console.log('Uploading file:', file.name, file.size, 'bytes')
      console.log('Upload endpoint:', getApiUrl(endpoint))
      
      logger.fileUploadStart(file.name, file.size)
      logger.apiRequest('POST', endpoint, { fileName: file.name, fileSize: file.size })
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        body: formData,
      })

      const duration = Date.now() - startTime
      console.log('Upload response status:', response.status, response.statusText)
      
      logger.apiResponse('POST', endpoint, response.status, duration)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload failed with status:', response.status, 'Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Upload response data:', data)
      
      logger.fileUploadComplete(file.name, data.data?.id || 'unknown')
      
      console.log('=== REAL API UPLOAD DEBUG END ===')
      
      return {
        success: data.success,
        data: data.data,
        error: data.error,
        timestamp: new Date(data.timestamp || Date.now())
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('=== REAL API UPLOAD ERROR ===')
      console.error('Error:', error)
      console.error('============================')
      
      logger.fileUploadError(file.name, error)
      logger.apiError('POST', endpoint, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        data: {} as FileUploadResponse
      }
    }
  }

  async updatePersona(personaName: string, config: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.PERSONAS}/${personaName}/update`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        success: data.success,
        data: data.data,
        error: data.error,
        timestamp: new Date(data.timestamp || Date.now())
      };
    } catch (error) {
      console.error('Persona API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        data: {}
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH))
      return response.ok
    } catch {
      return false
    }
  }

  async getPersonas(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PERSONAS));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Map names to persona objects with id and name
      const personas = (data.data || []).map((name: string, idx: number) => ({
        id: name,
        name,
        provider: "Unknown",
        active: idx === 0,
        color: "#6B73FF"
      }));
      return {
        success: data.success,
        data: personas,
        error: data.error,
        timestamp: new Date(data.timestamp || Date.now())
      };
    } catch (error) {
      console.error('Personas API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        data: []
      };
    }
  }

  async testBackendConnection(): Promise<boolean> {
    try {
      console.log('=== BACKEND CONNECTION TEST ===')
      console.log('Testing backend at:', API_CONFIG.BASE_URL)
      
      const response = await fetch(getApiUrl('/ping'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Backend ping response:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Backend ping data:', data)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Backend connection test failed:', error)
      return false
    }
  }

  async testPdfEndpoint(filename: string): Promise<boolean> {
    try {
      console.log('=== PDF ENDPOINT TEST ===')
      console.log('Testing PDF endpoint for:', filename)
      console.log('Encoded filename:', encodeURIComponent(filename))
      
      const pdfUrl = getApiUrl(`/api/files/pdf/${encodeURIComponent(filename)}`)
      console.log('PDF URL:', pdfUrl)
      
      // Test with multiple methods
      const [headResponse, getResponse] = await Promise.all([
        fetch(pdfUrl, { method: 'HEAD' }),
        fetch(pdfUrl, { method: 'GET' })
      ])
      
      console.log('PDF endpoint HEAD response:', headResponse.status, headResponse.statusText)
      console.log('PDF endpoint GET response:', getResponse.status, getResponse.statusText)
      console.log('PDF endpoint headers:', [...headResponse.headers.entries()])
      
      return headResponse.ok || getResponse.ok
    } catch (error) {
      console.error('PDF endpoint test failed:', error)
      return false
    }
  }
}

export const realApi = new RealApiService() 