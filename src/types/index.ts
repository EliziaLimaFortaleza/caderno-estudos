export interface Estudo {
  id: string;
  concurso?: string;
  cargo?: string;
  materia: string;
  assunto: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Revisao {
  id: string;
  estudoId: string;
  userId: string;
  dataUltimoEstudo: Date;
  dataRevisao: Date;
  status: 'pendente' | 'concluida';
  createdAt: Date;
}

export interface Questao {
  id: string;
  estudoId: string;
  userId: string;
  enunciado: string;
  comentario?: string;
  comentarioParceiro?: string;
  comentarios?: {
    [userId: string]: {
      texto: string;
      autor: string;
      data: Date | any;
    };
  };
  acertou?: boolean;
  resultados?: {
    [userId: string]: {
      acertou: boolean;
      data: Date | any;
    };
  };
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  parceiros: string[];
  createdAt: Date;
}

export interface Desempenho {
  totalAssuntos: number;
  totalRevisoes: number;
  questoesPorMateria: {
    [materia: string]: {
      acertadas: number;
      erradas: number;
    };
  };
} 