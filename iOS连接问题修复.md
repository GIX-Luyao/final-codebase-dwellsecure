# iOS 连接问题修复

## 问题分析

从日志看到：
```
[API] Platform: ios, API URL: http://localhost:3000
[API] ✗ GET /api/properties → Network Error (26ms)
```

**问题：** iOS 模拟器无法连接到 `localhost:3000`

## 可能的原因

1. **服务器没有运行** - 最常见的原因
2. **iOS 模拟器的 localhost 问题** - 某些情况下 iOS 模拟器无法访问 localhost
3. **服务器监听地址问题** - 服务器需要监听 `0.0.0.0` 而不是 `127.0.0.1`

## 解决方案

### 方案 1: 确认服务器正在运行

在 `server` 目录运行：
```bash
cd server
npm start
```

**应该看到：**
```
✅ Server started successfully!
🚀 Server running on port 3000
```

### 方案 2: 测试服务器是否可访问

在浏览器中访问：
```
http://localhost:3000/health
```

**应该返回：**
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "..."
}
```

### 方案 3: 检查服务器监听地址

服务器应该监听 `0.0.0.0`（所有网络接口），而不是 `127.0.0.1`。

检查 `server/index.js` 中的：
```javascript
app.listen(PORT, '0.0.0.0', () => {
  // ...
});
```

### 方案 4: iOS 模拟器特殊处理

如果 iOS 模拟器仍然无法连接，尝试：

1. **重启 iOS 模拟器**
2. **重启 Expo 应用**
3. **检查防火墙设置**

### 方案 5: 使用电脑 IP 地址（如果 localhost 不工作）

1. 找到你的电脑 IP 地址：
   - Windows: `ipconfig` 查看 IPv4 地址
   - Mac: `ifconfig` 或 `ip addr`

2. 在项目根目录创建 `.env` 文件：
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```

3. 重启 Expo 应用

## 验证修复

修复后，应该看到：

```
[API] Platform: ios, API URL: http://localhost:3000
[API] Checking health at http://localhost:3000/health
[API] Health check result: CONNECTED ✅
[API] Initialization complete. Available: true
[App] API initialization complete. Available: true
```

而不是：
```
[API] ✗ GET /api/properties → Network Error
[App] API initialization complete. Available: undefined
```

## 快速检查清单

- [ ] 后端服务器正在运行（`npm start`）
- [ ] 可以在浏览器访问 `http://localhost:3000/health`
- [ ] 服务器日志显示 "Server running on port 3000"
- [ ] iOS 模拟器已重启
- [ ] Expo 应用已重启

## 如果仍然失败

请提供：
1. 服务器终端日志（是否有收到请求？）
2. 浏览器访问 `http://localhost:3000/health` 的结果
3. 完整的应用日志（包括健康检查的详细错误）
