import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile } from '@/lib/dataManager';

export async function GET() {
  try {
    const compras = readJsonFile<any>('compras.json');
    const users = readJsonFile<any>('users.json');
    const produtos = readJsonFile<any>('produtos.json');
    
    const comprasAprovadas = compras.filter((c: any) => c.status === 'aprovado');
    const totalVendidos = comprasAprovadas.length;
    const faturamento = comprasAprovadas.reduce((acc: number, c: any) => acc + c.valor, 0);
    const quantidadeUsuarios = users.filter((u: any) => u.tipo === 'usuario').length;
    const produtosAtivos = produtos.filter((p: any) => p.ativo).length;
    
    return NextResponse.json({
      totalVendidos,
      faturamento,
      quantidadeUsuarios,
      produtosAtivos,
      comprasPendentes: compras.filter((c: any) => c.status === 'pendente').length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    );
  }
}
