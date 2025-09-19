import { NextResponse, type NextRequest } from 'next/server';
import { minioClient } from '@/app/(chat)/api/files/upload/minio';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; filename: string }> },
) {
  const { bucket, filename } = await params;

  try {
    // 生成临时下载链接（有效期1小时）
    const url = await minioClient.presignedGetObject(bucket, filename, 60 * 60);
    // 直接读取 url 的文件内容，并以二进制流返回
    const response = await fetch(url);
    const body = await response.body;
    return new Response(body);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: '无法获取文件下载链接',
        detail: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}
