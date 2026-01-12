import { NextRequest, NextResponse } from 'next/server';
import { readJsonObject, writeJsonObject } from '@/lib/dataManager';

export async function GET() {
  try {
    const config = readJsonObject<any>('configBonus.json');
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    writeJsonObject('configBonus.json', data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}
