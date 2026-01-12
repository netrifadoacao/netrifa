import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/dataManager';

export async function GET() {
  try {
    const produtos = readJsonFile<any>('produtos.json');
    const produtosAtivos = produtos.filter((p: any) => p.ativo);
    return NextResponse.json(produtosAtivos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, descricao, preco, tipo } = await request.json();
    
    const produtos = readJsonFile<any>('produtos.json');
    
    const novoProduto = {
      id: String(produtos.length + 1),
      nome,
      descricao,
      preco: parseFloat(preco),
      tipo: tipo || 'digital',
      ativo: true,
      dataCriacao: new Date().toISOString()
    };
    
    produtos.push(novoProduto);
    writeJsonFile('produtos.json', produtos);
    
    return NextResponse.json(novoProduto);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
}
