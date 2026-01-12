import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/dataManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const users = readJsonFile<any>('users.json');
    const user = users.find((u: any) => u.id === params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    const { senha: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const users = readJsonFile<any>('users.json');
    const userIndex = users.findIndex((u: any) => u.id === params.id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    users[userIndex] = { ...users[userIndex], ...data };
    writeJsonFile('users.json', users);
    
    const { senha: _, ...userWithoutPassword } = users[userIndex];
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}
