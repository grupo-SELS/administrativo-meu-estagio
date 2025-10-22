export interface Comunicado {
  id: string;
  titulo: string;
  conteudo: string;
  imagens?: string[];
  dataCriacao: string;
  dataAtualizacao?: string;
  dataPublicacao?: string;
  autor?: string;
  email?: string;
  polo?: string;
  categoria?: string;
  prioridade?: string;
}

export default class ApiService {
  private static readonly API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api';
  
  // URL base do servidor (sem /api) para arquivos estáticos
  private static readonly SERVER_BASE_URL =
    import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:3001';

  // Converte URL relativa de imagem para URL absoluta
  static getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    // Se já é uma URL completa, retorna como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Se começa com /, é relativo ao servidor
    if (imagePath.startsWith('/')) {
      return `${this.SERVER_BASE_URL}${imagePath}`;
    }
    // Caso contrário, adiciona /uploads/
    return `${this.SERVER_BASE_URL}/uploads/${imagePath}`;
  }

  private static async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Pegar token do Firebase Auth
    try {
      const { auth } = await import('../config/firebase');
      
      // Esperar até que o Firebase termine de verificar a autenticação
      await new Promise((resolve) => {
        if (auth.currentUser) {
          resolve(auth.currentUser);
        } else {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
          });
          // Timeout de 2 segundos para evitar espera infinita
          setTimeout(() => {
            unsubscribe();
            resolve(null);
          }, 2000);
        }
      });
      
      const user = auth.currentUser;
      
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Token adicionado ao header');
      } else {
        console.warn('⚠️ Usuário não autenticado - requisição sem token');
      }
    } catch (error) {
      console.error('❌ Erro ao obter token de autenticação:', error);
    }

    if (import.meta.env.DEV || import.meta.env.VITE_ENV === 'development') {
      headers['x-dev-bypass'] = 'true';
    }

    return headers;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erro ${response.status}: ${errorText || response.statusText}`
      );
    }

    return response.json();
  }


  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }


  static async delete(endpoint: string): Promise<void> {
    await this.request<void>(endpoint, { method: 'DELETE' });
  }


  static async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  static async health(): Promise<{ status: string }> {
    return this.healthCheck();
  }


  static async getComunicados(params?: { limite?: number }): Promise<{ comunicados: Comunicado[] }> {
    const queryString = params?.limite ? `?limite=${params.limite}` : '';
    const response = await this.request<{ comunicados: Comunicado[]; total: number; filtros?: any }>(`/comunicados${queryString}`);
    return { comunicados: response.comunicados || [] };
  }

  static async getComunicadoById(id: string): Promise<Comunicado> {
    return this.request<Comunicado>(`/comunicados/${id}`);
  }

  static async createComunicado(data: any): Promise<Comunicado> {
    // Se há imagens (arquivos File), usar FormData
    if (data.imagens && Array.isArray(data.imagens) && data.imagens.length > 0 && data.imagens[0] instanceof File) {
      console.log('📤 Dados originais para criar comunicado:', data);
      
      const formData = new FormData();
      
      // Mapeamento de campos: frontend → backend
      const fieldMapping: { [key: string]: string } = {
        'titulo': 'title',
        'conteudo': 'message'
      };
      
      // Adicionar campos de texto com conversão
      for (const key of Object.keys(data)) {
        if (key !== 'imagens') {
          const backendKey = fieldMapping[key] || key;
          const value = data[key];
          
          // Só adicionar se o valor existir e não for undefined/null/vazio
          if (value !== undefined && value !== null && value !== '') {
            // Se for array (tags), converter para JSON string
            if (Array.isArray(value)) {
              formData.append(backendKey, JSON.stringify(value));
            } else {
              formData.append(backendKey, String(value));
            }
          }
        }
      }
      
      // Adicionar imagens
      for (const file of data.imagens) {
        formData.append('imagens', file);
      }
      
      // Debug: Mostrar o que está no FormData
      console.log('📋 FormData preparado:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
      }
      
      // Fazer requisição com FormData (sem Content-Type, o navegador define automaticamente)
      const url = `${this.API_BASE_URL}/comunicados`;
      
      // Obter headers de autenticação (incluindo token)
      const baseHeaders = await this.getAuthHeaders();
      // Remover Content-Type para deixar o navegador definir com boundary correto
      const headers: Record<string, string> = {};
      for (const key of Object.keys(baseHeaders)) {
        if (key !== 'Content-Type') {
          headers[key] = (baseHeaders as any)[key];
        }
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
      }
      
      return response.json();
    }
    
    // Se não há imagens ou são URLs, usar JSON normal
    return this.request<Comunicado>('/comunicados', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateComunicado(id: string, data: any): Promise<Comunicado> {
    // Se há imagens (arquivos File), usar FormData
    if (data.imagens && Array.isArray(data.imagens) && data.imagens.length > 0 && data.imagens[0] instanceof File) {
      const formData = new FormData();
      
      // Mapeamento de campos: frontend → backend
      const fieldMapping: { [key: string]: string } = {
        'titulo': 'title',
        'conteudo': 'message'
      };
      
      // Adicionar campos de texto com conversão
      for (const key of Object.keys(data)) {
        if (key !== 'imagens') {
          const backendKey = fieldMapping[key] || key;
          const value = data[key];
          
          // Só adicionar se o valor existir e não for undefined/null/vazio
          if (value !== undefined && value !== null && value !== '') {
            // Se for array (tags), converter para JSON string
            if (Array.isArray(value)) {
              formData.append(backendKey, JSON.stringify(value));
            } else {
              formData.append(backendKey, String(value));
            }
          }
        }
      }
      
      // Adicionar imagens
      for (const file of data.imagens) {
        formData.append('imagens', file);
      }
      
      // Fazer requisição com FormData
      const url = `${this.API_BASE_URL}/comunicados/${id}`;
      
      // Obter headers de autenticação (incluindo token)
      const baseHeaders = await this.getAuthHeaders();
      // Remover Content-Type para deixar o navegador definir com boundary correto
      const headers: Record<string, string> = {};
      for (const key of Object.keys(baseHeaders)) {
        if (key !== 'Content-Type') {
          headers[key] = (baseHeaders as any)[key];
        }
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
      }
      
      return response.json();
    }
    
    // Se não há imagens ou são URLs, usar JSON normal
    return this.request<Comunicado>(`/comunicados/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteComunicado(id: string): Promise<void> {
    await this.request<void>(`/comunicados/${id}`, { method: 'DELETE' });
  }


  static async getAlunos(): Promise<any[]> {
    const response = await this.request<{ alunos: any[]; total?: number; filtros?: any }>('/alunos');
    return response.alunos || [];
  }

  static async getAlunoById(id: string): Promise<any> {
    return this.request<any>(`/alunos/${id}`);
  }

  static async createAluno(data: any): Promise<any> {
    return this.request<any>('/alunos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateAluno(id: string, data: any): Promise<any> {
    return this.request<any>(`/alunos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteAluno(id: string): Promise<void> {
    await this.request<void>(`/alunos/${id}`, { method: 'DELETE' });
  }


  static async listarProfessores(): Promise<any[]> {
    const response = await this.request<{ professores: any[]; total?: number; filtros?: any }>('/professores');
    return response.professores || [];
  }

  static async getProfessorById(id: string): Promise<any> {
    return this.request<any>(`/professores/${id}`);
  }

  static async createProfessor(data: any): Promise<any> {
    return this.request<any>('/professores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateProfessor(id: string, data: any): Promise<any> {
    return this.request<any>(`/professores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteProfessor(id: string): Promise<void> {
    await this.request<void>(`/professores/${id}`, { method: 'DELETE' });
  }


  static async listarAgendamentos(): Promise<{ agendamentos: any[] }> {
    const response = await this.request<{ agendamentos: any[] }>('/agendamentos');
    return { agendamentos: response.agendamentos || [] };
  }

  static async getAgendamentoById(id: string): Promise<any> {
    return this.request<any>(`/agendamentos/${id}`);
  }

  static async criarAgendamento(data: any): Promise<any> {
    return this.request<any>('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateAgendamento(id: string, data: any): Promise<any> {
    return this.request<any>(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deletarAgendamento(id: string): Promise<void> {
    await this.request<void>(`/agendamentos/${id}`, { method: 'DELETE' });
  }
}