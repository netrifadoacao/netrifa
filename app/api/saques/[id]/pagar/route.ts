import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/dataManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const saques = readJsonFile<any>('saques.json');
    const users = readJsonFile<any>('users.json');
    const saqueIndex = saques.findIndex((s: any) => s.id === params.id);
    
    if (saqueIndex === -1) {
      return NextResponse.json(
        { error: 'Saque não encontrado' },
        { status: 404 }
      );
    }
    
    const saque = saques[saqueIndex];
    const userIndex = users.findIndex((u: any) => u.id === saque.usuarioId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    // Debitar do saldo
    users[userIndex].saldo = (users[userIndex].saldo || 0) - saque.valor;
    
    saques[saqueIndex].status = 'pago';
    saques[saqueIndex].dataPagamento = new Date().toISOString();
    
    writeJsonFile('saques.json', saques);
    writeJsonFile('users.json', users);
    
    return NextResponse.json(saques[saqueIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao marcar saque como pago' },
      { status: 500 }
    );
  }
}
