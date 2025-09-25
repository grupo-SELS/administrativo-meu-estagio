const API_BASE_URL = 'http://localhost:3001'; 


export const processImageUrl = (imageUrl: string): string => {
  console.log('🔄 Processing image URL:', imageUrl);
  

  if (imageUrl.startsWith('/uploads/')) {
    const fullUrl = `${API_BASE_URL}${imageUrl}`;
    console.log('✅ Local image URL generated:', fullUrl);
    return fullUrl;
  }
  

  if (imageUrl.startsWith('https://storage.googleapis.com/')) {
    console.log('✅ Firebase Storage URL detected:', imageUrl);
    return imageUrl;
  }
  

  console.log('↩️ Returning original URL:', imageUrl);
  return imageUrl;
};


export const processComunicado = (comunicado: any): Comunicado => {
  return {
    ...comunicado,
    imagens: comunicado.imagens?.map(processImageUrl) || []
  };
};

export interface Comunicado {
  id: string;
  titulo: string;
  conteudo: string;
  autor: string; 
  email?: string;
  polo?: string;
  categoria?: string;
  status: string;
  prioridade?: string;
  dataPublicacao: string;
  tags?: string[];
  imagens?: string[];
  visualizacoes?: number;
}

export interface CreateComunicadoRequest {
  titulo: string;
  conteudo: string;
  email?: string;
  polo?: string;
  categoria?: string;
  prioridade?: string;
  tags?: string[];
  imagens?: File[];
}

class ApiService {
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      // Firebase Auth
      const auth = await import('firebase/auth');
      const appAuth = auth.getAuth();
      const user = appAuth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao obter token JWT do Firebase Auth:', error);
    }

    return headers;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...headers,
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na API (${endpoint}):`, error);
      throw error;
    }
  }


  async healthCheck() {
    return this.request<{ status: string; message: string }>('/health');
  }


  async getComunicados(filters?: {
    polo?: string;
    categoria?: string;
    status?: string;
    limite?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.polo) params.append('polo', filters.polo);
    if (filters?.categoria) params.append('categoria', filters.categoria);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limite) params.append('limite', filters.limite.toString());

    const query = params.toString() ? `?${params}` : '';
    const response = await this.request<{ comunicados: Comunicado[]; total: number }>(`/api/comunicados${query}`);
    

    return {
      ...response,
      comunicados: response.comunicados.map(processComunicado)
    };
  }


  async getComunicadoById(id: string) {
    const comunicado = await this.request<Comunicado>(`/api/comunicados/${id}`);
    return processComunicado(comunicado);
  }


  async createComunicado(data: CreateComunicadoRequest) {
    const headers = await this.getAuthHeaders();
    

    if (data.imagens && data.imagens.length > 0) {
      const formData = new FormData();
      

      formData.append('titulo', data.titulo);
      formData.append('conteudo', data.conteudo);
      if (data.email) formData.append('email', data.email);
      if (data.polo) formData.append('polo', data.polo);
      if (data.categoria) formData.append('categoria', data.categoria);
      if (data.prioridade) formData.append('prioridade', data.prioridade);
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));
      

      data.imagens.forEach((file) => {
        formData.append(`imagens`, file);
      });


      const headersWithoutContentType = { ...headers } as any;
      delete headersWithoutContentType['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/api/comunicados`, {
        method: 'POST',
        headers: headersWithoutContentType,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } else {

      const { imagens, ...cleanData } = data;
      return this.request<{ message: string; id: string }>('/api/comunicados', {
        method: 'POST',
        body: JSON.stringify(cleanData),
      });
    }
  }


  async updateComunicado(id: string, data: Partial<CreateComunicadoRequest & { existingImages?: string[] }>) {
    const headers = await this.getAuthHeaders();
    

    if (data.imagens && data.imagens.length > 0) {
      const formData = new FormData();
      

      if (data.titulo) formData.append('titulo', data.titulo);
      if (data.conteudo) formData.append('conteudo', data.conteudo);
      if (data.email) formData.append('email', data.email);
      if (data.polo) formData.append('polo', data.polo);
      if (data.categoria) formData.append('categoria', data.categoria);
      if (data.prioridade) formData.append('prioridade', data.prioridade);
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));
      if (data.existingImages) formData.append('existingImages', JSON.stringify(data.existingImages));
      

      data.imagens.forEach((file) => {
        formData.append(`imagens`, file);
      });


      const headersWithoutContentType = { ...headers } as any;
      delete headersWithoutContentType['Content-Type'];

      try {
        const response = await fetch(`${API_BASE_URL}/api/comunicados/${id}`, {
          method: 'PUT',
          headers: headersWithoutContentType,
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`Erro na API (PUT /comunicados/${id}):`, error);
        throw error;
      }
    } else {
 
      return this.request<{ message: string; id: string; comunicado: any }>(`/api/comunicados/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  }


  async deleteComunicado(id: string) {
    return this.request<{ message: string; id: string }>(`/api/comunicados/${id}`, {
      method: 'DELETE',
    });
  }


  async testFirestore() {
    return this.request<{
      success: boolean;
      message: string;
      projeto: string;
      comunicados_encontrados: number;
      comunicados: any[];
    }>('/test-firestore');
  }
}

export const apiService = new ApiService();