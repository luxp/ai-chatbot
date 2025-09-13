import { NextResponse, type NextRequest } from 'next/server';
import { minioClient } from '@/app/(chat)/api/files/upload/minio';

export async function GET(
  request: NextRequest,
  { params }: { params: { bucket: string; filename: string } },
) {
  const { bucket, filename } = params;

  try {
    // 生成临时下载链接（有效期1小时）
    const url = await minioClient.presignedGetObject(bucket, filename, 60 * 60);

    // 302 跳转到下载链接
    return NextResponse.redirect(url, 302);
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
