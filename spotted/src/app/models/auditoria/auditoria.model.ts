export interface Auditoria {
  id: string;
  data: string;
  email: string;
  acao: string;
  conteudo: string;
}

export enum AcaoTipo {
  POST = 'Post',
  COMENTARIO = 'Comentário',
  LIKE = 'Like',
  DENUNCIA = 'Denúncia',
  LOGIN = 'Login',
  REGISTRO = 'Registro'
}
