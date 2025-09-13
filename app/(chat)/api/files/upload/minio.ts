import * as Minio from 'minio';
import * as mime from 'mime-types';

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '',
  port: Number.parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

/**
 * 获取文件的 MIME 类型
 * @param filename 文件名
 * @returns MIME 类型字符串，如果无法识别则返回 'application/octet-stream'
 */
function getContentType(filename: string): string {
  const mimeType = mime.lookup(filename);
  return mimeType || 'application/octet-stream';
}

/**
 * put 方法：将文件上传到 MinIO，功能等价于 vercel/blob 的 put
 * @param {string} objectName - 存储在 MinIO 中的对象名（文件名）
 * @param {ArrayBuffer|Buffer|Uint8Array} data - 文件内容
 * @param {Object} [options] - 额外选项，如 bucket、contentType、metaData、access
 * @returns {Promise<Object>} - 返回上传后的对象信息
 */
export async function put(
  objectName: string,
  data: ArrayBuffer | Buffer | Uint8Array,
  options?: {
    bucket?: string;
    metaData?: Record<string, any>;
  },
) {
  const bucket = options?.bucket || 'default-bucket';

  const metaData = options?.metaData || {};
  // 检查 bucket 是否存在，不存在则创建
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
  }

  // MinIO 需要 Buffer 类型
  let buffer: Buffer;
  if (Buffer.isBuffer(data)) {
    buffer = data as Buffer;
  } else if (data instanceof ArrayBuffer) {
    buffer = Buffer.from(data);
  } else if (data instanceof Uint8Array) {
    buffer = Buffer.from(data);
  } else {
    throw new Error('不支持的数据类型');
  }

  // 设置元数据
  const meta = {
    objectName,
    ...metaData,
  };

  const fileName = `${Date.now().toString(36)}-${objectName}`;

  // 上传对象
  await minioClient.putObject(bucket, fileName, buffer, buffer.length, meta);

  const url = `/api/files/minio-file/${bucket}/${fileName}`;

  return {
    key: `${bucket}_${fileName}`,
    bucket,
    url,
    downloadUrl: url,
    contentType: getContentType(objectName),
    size: buffer.length,
  };
}
