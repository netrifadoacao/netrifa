import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, readJsonObject } from '@/lib/dataManager';

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
    
    compras[compraIndex].status = 'aprovado';
    compras[compraIndex].dataAprovacao = new Date().toISOString();
    
    writeJsonFile('compras.json', compras);
    
    // Calcular bônus se necessário
    const users = readJsonFile<any>('users.json');
    await calcularBonus(compras[compraIndex], users);
    
    return NextResponse.json(compras[compraIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao aprovar compra' },
      { status: 500 }
    );
  }
}

async function calcularBonus(compra: any, users: any[]) {
  const bonus = readJsonFile<any>('bonus.json');
  const configBonus = readJsonObject<any>('configBonus.json');
  const usuario = users.find((u: any) => u.id === compra.usuarioId);
  
  if (!usuario || !usuario.patrocinadorId) return;
  
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
      
      const userIndex = users.findIndex((u: any) => u.id === pat.id);
      if (userIndex !== -1) {
        users[userIndex].saldo = (users[userIndex].saldo || 0) + valorBonus;
      }
    }
  });
  
  writeJsonFile('bonus.json', bonus);
  writeJsonFile('users.json', users);
}
