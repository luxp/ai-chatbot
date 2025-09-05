import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const filename = path.join('/');
    const filePath = join(UPLOAD_DIR, filename);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }

    // 读取文件
    const fileBuffer = await fs.readFile(filePath);

    // 获取文件扩展名来确定内容类型
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      txt: 'text/plain',
      json: 'application/json',
      xml: 'application/xml',
      zip: 'application/zip',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
    };

    const contentType = mimeTypes[ext || ''] || 'application/octet-stream';

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    // 根据文件类型设置 Content-Disposition
    const isImage = contentType.startsWith('image/');
    if (isImage) {
      headers.set('Content-Disposition', 'inline');
    } else {
      headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
