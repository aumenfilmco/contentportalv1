import { NextResponse } from 'next/server';
import { imagekitAdmin } from '@/lib/imagekit';

export async function GET() {
  try {
    // Generate authentication parameters for client-side upload
    const authParams = imagekitAdmin.getAuthenticationParameters();
    return NextResponse.json(authParams);
  } catch (error) {
    console.error('Error generating authentication parameters:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    );
  }
}