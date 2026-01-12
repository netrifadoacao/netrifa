import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile } from '@/lib/dataManager';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();
    
    const users = readJsonFile<any>('users.json');
    const user = users.find((u: any) => u.email === email && u.senha === senha);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }
    
    const { senha: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: userWithoutPassword,
      token: `mock-token-${user.id}`
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
