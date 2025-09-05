import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// 配置
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// 确保上传目录存在
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// 生成唯一的文件名
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const hash = createHash('md5')
    .update(originalName + timestamp)
    .digest('hex')
    .substring(0, 8);
  const ext = originalName.split('.').pop() || '';
  return `${timestamp}-${hash}${ext ? `.${ext}` : ''}`;
}

// 获取文件的 MIME 类型
function getContentType(filename: string): string {
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
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

// 本地存储的 put 方法，模拟 Vercel Blob 的 API
export async function put(
  filename: string,
  data: ArrayBuffer | Buffer | string,
  options?: {
    access?: 'public' | 'private';
    contentType?: string;
  },
): Promise<{
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
  uploadedAt: string;
}> {
  try {
    // 确保上传目录存在
    await ensureUploadDir();

    // 生成唯一的文件名
    const uniqueFilename = generateUniqueFilename(filename);
    const filePath = join(UPLOAD_DIR, uniqueFilename);

    // 转换数据为 Buffer
    let buffer: Buffer;
    if (data instanceof ArrayBuffer) {
      buffer = Buffer.from(data);
    } else if (typeof data === 'string') {
      buffer = Buffer.from(data, 'utf8');
    } else {
      buffer = data;
    }

    // 写入文件
    await fs.writeFile(filePath, buffer);

    // 获取文件大小和内容类型
    const stats = await fs.stat(filePath);
    const contentType = options?.contentType || getContentType(filename);

    // 生成访问 URL
    const pathname = `/uploads/${uniqueFilename}`;
    const url = `${BASE_URL}${pathname}`;

    // 生成 contentDisposition
    // 对于图片文件，使用 inline 让浏览器直接显示
    // 对于其他文件，使用 attachment 让用户下载
    const isImage = contentType.startsWith('image/');
    const contentDisposition = isImage
      ? 'inline'
      : `attachment; filename="${filename}"`;

    return {
      url,
      downloadUrl: url,
      pathname,
      contentType,
      contentDisposition,
      size: stats.size,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(
      `Failed to store file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// 删除文件的方法
export async function del(pathname: string): Promise<void> {
  try {
    // 从 pathname 中提取文件名
    const filename = pathname.replace('/uploads/', '');
    const filePath = join(UPLOAD_DIR, filename);

    await fs.unlink(filePath);
  } catch (error) {
    throw new Error(
      `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// 获取文件信息的方法
export async function head(pathname: string): Promise<{
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
  uploadedAt: string;
} | null> {
  try {
    const filename = pathname.replace('/uploads/', '');
    const filePath = join(UPLOAD_DIR, filename);

    const stats = await fs.stat(filePath);
    const contentType = getContentType(filename);
    const url = `${BASE_URL}${pathname}`;

    // 生成 contentDisposition
    const isImage = contentType.startsWith('image/');
    const contentDisposition = isImage
      ? 'inline'
      : `attachment; filename="${filename}"`;

    return {
      url,
      pathname,
      contentType,
      contentDisposition,
      size: stats.size,
      uploadedAt: stats.birthtime.toISOString(),
    };
  } catch {
    return null;
  }
}

// 列出文件的方法
export async function list(options?: {
  prefix?: string;
  limit?: number;
}): Promise<{
  blobs: Array<{
    url: string;
    pathname: string;
    contentType: string;
    contentDisposition: string;
    size: number;
    uploadedAt: string;
  }>;
  hasMore: boolean;
  cursor?: string;
}> {
  try {
    await ensureUploadDir();

    const files = await fs.readdir(UPLOAD_DIR);
    let filteredFiles = files;

    // 应用前缀过滤
    if (options?.prefix) {
      const prefix = options.prefix;
      filteredFiles = files.filter((file) => file.startsWith(prefix));
    }

    // 应用限制
    const limit = options?.limit || 1000;
    const limitedFiles = filteredFiles.slice(0, limit);
    const hasMore = filteredFiles.length > limit;

    const blobs = await Promise.all(
      limitedFiles.map(async (filename) => {
        const filePath = join(UPLOAD_DIR, filename);
        const stats = await fs.stat(filePath);
        const pathname = `/uploads/${filename}`;
        const url = `${BASE_URL}${pathname}`;
        const contentType = getContentType(filename);

        // 生成 contentDisposition
        const isImage = contentType.startsWith('image/');
        const contentDisposition = isImage
          ? 'inline'
          : `attachment; filename="${filename}"`;

        return {
          url,
          pathname,
          contentType,
          contentDisposition,
          size: stats.size,
          uploadedAt: stats.birthtime.toISOString(),
        };
      }),
    );

    return {
      blobs,
      hasMore,
      cursor: hasMore ? limitedFiles[limitedFiles.length - 1] : undefined,
    };
  } catch (error) {
    throw new Error(
      `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
