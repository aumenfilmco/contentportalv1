import { NextRequest, NextResponse } from 'next/server';
import { imagekitAdmin } from '@/lib/imagekit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, tags } = body;
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    
    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags must be provided as an array' },
        { status: 400 }
      );
    }
    
    // Get existing file details
    const fileDetails = await imagekitAdmin.getFileDetails(fileId);
    
    // Combine with existing tags (if any)
    const existingTags = fileDetails.tags || [];
    const uniqueTags = [...new Set([...existingTags, ...tags])];
    
    // Update file tags
    await imagekitAdmin.updateFileDetails(fileId, {
      tags: uniqueTags
    });
    
    return NextResponse.json({ success: true, tags: uniqueTags });
  } catch (error) {
    console.error('Error updating tags:', error);
    return NextResponse.json(
      { error: 'Failed to update tags' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const tag = searchParams.get('tag');
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag is required' }, { status: 400 });
    }
    
    // Get existing file details
    const fileDetails = await imagekitAdmin.getFileDetails(fileId);
    
    // Remove specified tag
    const existingTags = fileDetails.tags || [];
    const updatedTags = existingTags.filter(t => t !== tag);
    
    // Update file tags
    await imagekitAdmin.updateFileDetails(fileId, {
      tags: updatedTags
    });
    
    return NextResponse.json({ success: true, tags: updatedTags });
  } catch (error) {
    console.error('Error removing tag:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag' },
      { status: 500 }
    );
  }
}