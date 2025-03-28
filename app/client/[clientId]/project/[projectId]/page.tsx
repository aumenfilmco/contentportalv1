'use client';

import { useParams } from 'next/navigation';
import MediaGallery from '@/components/MediaGallery';

export default function ProjectGalleryPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const projectId = params.projectId as string;
  
  return (
    <main>
      <MediaGallery clientId={clientId} projectId={projectId} />
    </main>
  );
}