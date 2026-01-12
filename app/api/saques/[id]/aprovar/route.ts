import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/dataManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const saques = readJsonFile<any>('saques.json');
    const saqueIndex = saques.findIndex((s: any) => s.id === params.id);
    
    if (saqueIndex === -1) {
      return NextResponse.json(
        { error: 'Saque não encontrado' },
        { status: 404 }
      );
    }
    
    saques[saqueIndex].status = 'aprovado';
    saques[saqueIndex].dataAprovacao = new Date().toISOString();
    
    writeJsonFile('saques.json', saques);
    
    return NextResponse.json(saques[saqueIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao aprovar saque' },
      { status: 500 }
    );
  }
}
