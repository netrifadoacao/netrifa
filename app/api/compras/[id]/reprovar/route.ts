import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/dataManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const compras = readJsonFile<any>('compras.json');
    const compraIndex = compras.findIndex((c: any) => c.id === params.id);
    
    if (compraIndex === -1) {
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      );
    }
    
    compras[compraIndex].status = 'reprovado';
    writeJsonFile('compras.json', compras);
    
    return NextResponse.json(compras[compraIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao reprovar compra' },
      { status: 500 }
    );
  }
}
