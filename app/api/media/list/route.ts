import { NextRequest, NextResponse } from 'next/server';
import { imagekitAdmin } from '@/lib/imagekit';
import { buildSearchQuery } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || '';
    const projectId = searchParams.get('projectId') || '';
    const path = searchParams.get('path') || '';
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') ? searchParams.get('tags')?.split(',') : [];
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    
    // Build search query
    const searchQuery = buildSearchQuery({
      clientId,
      projectId,
      path,
      search,
      tags: tags?.length ? tags : undefined,
    });
    
    // Fetch files from ImageKit
    const files = await imagekitAdmin.listFiles({
      searchQuery: searchQuery || undefined,
      limit,
      skip,
    });
    
    // Get total count for pagination
    const totalCount = await imagekitAdmin.getFileCount({ searchQuery: searchQuery || undefined });
    
    return NextResponse.json({ files, totalCount });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}