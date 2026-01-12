import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/dataManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { ativo } = await request.json();
    const produtos = readJsonFile<any>('produtos.json');
    const produtoIndex = produtos.findIndex((p: any) => p.id === params.id);
    
    if (produtoIndex === -1) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }
    
    produtos[produtoIndex].ativo = ativo;
    writeJsonFile('produtos.json', produtos);
    
    return NextResponse.json(produtos[produtoIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}
