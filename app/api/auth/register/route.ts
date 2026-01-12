import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/dataManager';

export async function POST(request: NextRequest) {
  try {
    const { nome, email, telefone, senha, patrocinadorLink } = await request.json();
    
    const users = readJsonFile<any>('users.json');
    
    // Verificar se email já existe
    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }
    
    // Encontrar patrocinador
    let patrocinadorId = null;
    if (patrocinadorLink) {
      const patrocinador = users.find((u: any) => u.linkIndicacao === patrocinadorLink);
      if (patrocinador) {
        patrocinadorId = patrocinador.id;
      }
    }
    
    // Criar novo usuário
    const novoUsuario = {
      id: String(users.length + 1),
      nome,
      email,
      telefone,
      senha,
      tipo: 'usuario',
      linkIndicacao: nome.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      saldo: 0,
      dadosBancarios: {
        banco: '',
        agencia: '',
        conta: '',
        pix: ''
      },
      patrocinadorId,
      dataCadastro: new Date().toISOString()
    };
    
    users.push(novoUsuario);
    writeJsonFile('users.json', users);
    
    const { senha: _, ...userWithoutPassword } = novoUsuario;
    
    return NextResponse.json({
      user: userWithoutPassword,
      token: `mock-token-${novoUsuario.id}`
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao cadastrar usuário' },
      { status: 500 }
    );
  }
}
