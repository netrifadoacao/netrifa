import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, readJsonObject } from '@/lib/dataManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');
    
    const saques = readJsonFile<any>('saques.json');
    const users = readJsonFile<any>('users.json');
    
    let saquesFiltrados = saques;
    if (usuarioId) {
      saquesFiltrados = saques.filter((s: any) => s.usuarioId === usuarioId);
    }
    
    const saquesComDetalhes = saquesFiltrados.map((saque: any) => {
      const usuario = users.find((u: any) => u.id === saque.usuarioId);
      return {
        ...saque,
        usuario: usuario ? { nome: usuario.nome, email: usuario.email } : null
      };
    });
    
    return NextResponse.json(saquesComDetalhes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar saques' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, valor, metodoPagamento, dadosPagamento } = await request.json();
    
    const users = readJsonFile<any>('users.json');
    const configBonus = readJsonObject<any>('configBonus.json');
    const saques = readJsonFile<any>('saques.json');
    
    const usuario = users.find((u: any) => u.id === usuarioId);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    const valorMinimo = configBonus?.valorMinimoSaque || 50;
    if (valor < valorMinimo) {
      return NextResponse.json(
        { error: `Valor mínimo de saque é R$ ${valorMinimo.toFixed(2)}` },
        { status: 400 }
      );
    }
    
    if (usuario.saldo < valor) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      );
    }
    
    const novoSaque = {
      id: String(saques.length + 1),
      usuarioId,
      valor: parseFloat(valor),
      status: 'pendente',
      metodoPagamento,
      dadosPagamento,
      dataSolicitacao: new Date().toISOString(),
      dataAprovacao: null,
      dataPagamento: null
    };
    
    saques.push(novoSaque);
    writeJsonFile('saques.json', saques);
    
    return NextResponse.json(novoSaque);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao solicitar saque' },
      { status: 500 }
    );
  }
}
