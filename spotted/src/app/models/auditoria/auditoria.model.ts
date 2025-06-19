export interface Auditoria {
  id: string;
  data: string;
  email: string;
  acao: string;
  conteudo: string;
}

export interface BaseAuditoriaContent {
  tipo: string;
  postId?: string;
  comentarioId?: string;
  usuarioId?: string;
  conteudo?: string;
}

export interface PostContent extends BaseAuditoriaContent {
  postId: string;
  conteudo: string;
}

export interface ComentarioContent extends BaseAuditoriaContent {
  comentarioId: string;
  postId: string;
  conteudo: string;
}

export interface LikeContent extends BaseAuditoriaContent {
  postId: string;
  comentarioId?: string;
}

export interface DenunciaContent extends BaseAuditoriaContent {
  postId: string;
  comentarioId?: string;
}

export interface UsuarioContent extends BaseAuditoriaContent {
  usuarioId: string;
}

export enum AcaoTipo {
  POST = 'Post',
  COMENTARIO = 'Comentário',
  LIKE = 'Like',
  DENUNCIA = 'Denúncia',
  LOGIN = 'Login',
  REGISTRO = 'Registro'
}
