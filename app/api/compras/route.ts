import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, readJsonObject } from '@/lib/dataManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const compras = readJsonFile<any>('compras.json');
    const produtos = readJsonFile<any>('produtos.json');
    const users = readJsonFile<any>('users.json');
    
    let comprasFiltradas = compras;
    if (status) {
      comprasFiltradas = compras.filter((c: any) => c.status === status);
    }
    
    const comprasComDetalhes = comprasFiltradas.map((compra: any) => {
      const produto = produtos.find((p: any) => p.id === compra.produtoId);
      const usuario = users.find((u: any) => u.id === compra.usuarioId);
      return {
        ...compra,
        produto: produto ? { nome: produto.nome, preco: produto.preco } : null,
        usuario: usuario ? { nome: usuario.nome, email: usuario.email } : null
      };
    });
    
    return NextResponse.json(comprasComDetalhes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar compras' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, produtoId } = await request.json();
    
    const produtos = readJsonFile<any>('produtos.json');
    const compras = readJsonFile<any>('compras.json');
    const users = readJsonFile<any>('users.json');
    
    const produto = produtos.find((p: any) => p.id === produtoId);
    if (!produto || !produto.ativo) {
      return NextResponse.json(
        { error: 'Produto não encontrado ou inativo' },
        { status: 400 }
      );
    }
    
    const novaCompra = {
      id: String(compras.length + 1),
      usuarioId,
      produtoId,
      valor: produto.preco,
      status: 'aprovado', // Simulando pagamento automático
      dataCompra: new Date().toISOString(),
      dataAprovacao: new Date().toISOString()
    };
    
    compras.push(novaCompra);
    writeJsonFile('compras.json', compras);
    
    // Calcular e distribuir bônus
    await calcularBonus(novaCompra, users);
    
    return NextResponse.json(novaCompra);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar compra' },
      { status: 500 }
    );
  }
}

async function calcularBonus(compra: any, users: any[]) {
  const bonus = readJsonFile<any>('bonus.json');
  const configBonus = readJsonObject<any>('configBonus.json');
  const usuario = users.find((u: any) => u.id === compra.usuarioId);
  
  if (!usuario || !usuario.patrocinadorId) return;
  
  // Encontrar patrocinadores até 5 níveis
  const patrocinadores: { id: string; nivel: number }[] = [];
  let patrocinadorAtual = users.find((u: any) => u.id === usuario.patrocinadorId);
  let nivel = 1;
  
  while (patrocinadorAtual && nivel <= 5) {
    patrocinadores.push({ id: patrocinadorAtual.id, nivel });
    if (patrocinadorAtual.patrocinadorId) {
      patrocinadorAtual = users.find((u: any) => u.id === patrocinadorAtual.patrocinadorId);
      nivel++;
    } else {
      break;
    }
  }
  
  // Distribuir bônus
  patrocinadores.forEach((pat: { id: string; nivel: number }) => {
    let percentual = 0;
    if (pat.nivel === 1) percentual = configBonus.indicacaoDireta || 10;
    else if (pat.nivel === 2) percentual = configBonus.nivel1 || 5;
    else if (pat.nivel === 3) percentual = configBonus.nivel2 || 3;
    else if (pat.nivel === 4) percentual = configBonus.nivel3 || 2;
    else if (pat.nivel === 5) percentual = configBonus.nivel4 || 1;
    else if (pat.nivel === 6) percentual = configBonus.nivel5 || 0.5;
    
    if (percentual > 0) {
      const valorBonus = (compra.valor * percentual) / 100;
      
      bonus.push({
        id: String(bonus.length + 1),
        usuarioId: pat.id,
        tipo: pat.nivel === 1 ? 'direto' : 'rede',
        nivel: pat.nivel > 1 ? pat.nivel - 1 : null,
        origemUsuarioId: compra.usuarioId,
        origemCompraId: compra.id,
        valor: valorBonus,
        data: new Date().toISOString()
      });
      
      // Atualizar saldo do usuário
      const userIndex = users.findIndex((u: any) => u.id === pat.id);
      if (userIndex !== -1) {
        users[userIndex].saldo = (users[userIndex].saldo || 0) + valorBonus;
      }
    }
  });
  
  writeJsonFile('bonus.json', bonus);
  writeJsonFile('users.json', users);
}
