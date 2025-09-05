# 本地文件存储实现

这个实现提供了一个与 Vercel Blob 兼容的本地文件存储解决方案。

## 文件说明

- `local-storage.ts` - 本地存储的核心实现，提供与 Vercel Blob 相同的 API
- `route-local.ts` - 使用本地存储的文件上传路由示例
- `app/uploads/[...path]/route.ts` - 静态文件服务路由，用于访问上传的文件

## 使用方法

### 1. 替换 Vercel Blob 导入

将原来的：

```typescript
import { put } from "@vercel/blob";
```

替换为：

```typescript
import { put } from "./local-storage";
```

### 2. 环境变量配置

在 `.env.local` 中添加以下配置：

```env
# 上传文件存储目录（可选，默认为项目根目录下的 uploads 文件夹）
UPLOAD_DIR=/path/to/your/upload/directory

# 应用的基础 URL（可选，默认为 http://localhost:3000）
BASE_URL=http://localhost:3000
```

### 3. 创建上传目录

确保上传目录存在并且有写入权限：

```bash
mkdir -p uploads
chmod 755 uploads
```

## API 兼容性

本地存储实现完全兼容 Vercel Blob 的 API：

### put(filename, data, options)

上传文件到本地存储。

**参数：**

- `filename`: 文件名
- `data`: 文件数据（ArrayBuffer、Buffer 或 string）
- `options`: 可选配置
  - `access`: 'public' | 'private'（目前都按 public 处理）
  - `contentType`: 文件 MIME 类型

**返回值：**

```typescript
{
  url: string; // 文件的访问 URL
  downloadUrl: string; // 下载 URL（与 url 相同）
  pathname: string; // 文件的路径
  contentType: string; // 文件的 MIME 类型
  contentDisposition: string; // 内容处理方式（inline 或 attachment）
  size: number; // 文件大小（字节）
  uploadedAt: string; // 上传时间（ISO 字符串）
}
```

### del(pathname)

删除文件。

### head(pathname)

获取文件信息。

### list(options)

列出文件。

## 特性

1. **自动目录创建** - 如果上传目录不存在，会自动创建
2. **唯一文件名** - 使用时间戳和哈希生成唯一文件名，避免冲突
3. **MIME 类型检测** - 根据文件扩展名自动检测 MIME 类型
4. **智能内容处理** - 根据文件类型自动设置 `Content-Disposition`：
   - 图片文件：`inline`（在浏览器中直接显示）
   - 其他文件：`attachment`（作为附件下载）
5. **静态文件服务** - 通过 `/uploads/[...path]` 路由提供文件访问
6. **缓存优化** - 设置适当的缓存头以提高性能
7. **错误处理** - 完善的错误处理和日志记录

## 注意事项

1. 确保服务器有足够的磁盘空间存储上传的文件
2. 定期清理不需要的文件以节省空间
3. 在生产环境中，建议使用专业的文件存储服务
4. 文件访问权限目前都按 public 处理，如需私有访问需要额外实现

## 部署建议

在生产环境中，建议：

1. 使用环境变量配置上传目录和基础 URL
2. 设置适当的文件权限
3. 考虑使用 CDN 来加速文件访问
4. 实现文件清理策略
5. 监控磁盘使用情况
