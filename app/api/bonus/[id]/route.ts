import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile } from '@/lib/dataManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bonus = readJsonFile<any>('bonus.json');
    const bonusUsuario = bonus.filter((b: any) => b.usuarioId === params.id);
    
    const users = readJsonFile<any>('users.json');
    const compras = readJsonFile<any>('compras.json');
    
    const bonusComDetalhes = bonusUsuario.map((b: any) => {
      const origemUsuario = users.find((u: any) => u.id === b.origemUsuarioId);
      const origemCompra = compras.find((c: any) => c.id === b.origemCompraId);
      return {
        ...b,
        origemUsuario: origemUsuario ? { nome: origemUsuario.nome } : null,
        origemCompra: origemCompra ? { valor: origemCompra.valor } : null
      };
    });
    
    return NextResponse.json(bonusComDetalhes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar bônus' },
      { status: 500 }
    );
  }
}
