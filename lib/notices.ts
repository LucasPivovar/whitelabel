export type NoticeTone = 'success' | 'warning' | 'info' | 'error';
export const noticeColors: Record<NoticeTone, string> = {
  success: '#4ade80', warning: '#facc15', info: '#f4f4f5', error: '#fb7185',
};
export function noticeTone(message: string): NoticeTone {
  if (/falha|falhou|erro|inválid|não foi possível|não pode|não permite|suspens/i.test(message)) return 'error';
  if (/atenção|cuidado|restrit|conflit|selecione|necessári|não encontrad|sem permissão/i.test(message)) return 'warning';
  if (/sucesso|salv|criad|copiad|gerad|remov|restaurad|excluí|atualizad|revogad|concluí/i.test(message)) return 'success';
  return 'info';
}
