import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile } from '@/lib/dataManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const users = readJsonFile<any>('users.json');
    
    function buscarRede(usuarioId: string, nivel: number = 1): any {
      if (nivel > 5) return null;
      
      const indicados = users.filter((u: any) => u.patrocinadorId === usuarioId);
      
      return indicados.map((indicado: any) => ({
        id: indicado.id,
        nome: indicado.nome,
        email: indicado.email,
        nivel,
        indicados: buscarRede(indicado.id, nivel + 1)
      })).filter((item: any) => item !== null);
    }
    
    const rede = buscarRede(params.id);
    
    return NextResponse.json({ rede, niveis: 5 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar rede' },
      { status: 500 }
    );
  }
}
