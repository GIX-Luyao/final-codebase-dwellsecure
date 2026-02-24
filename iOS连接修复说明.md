# iOS 连接修复说明

## 问题

iOS 模拟器无法连接到 `localhost` 或 `127.0.0.1`，即使浏览器可以访问。

## 解决方案

已创建 `.env` 文件，使用你的电脑 IP 地址：`192.168.1.166`

## 下一步操作

### 1. 重启 Expo 应用

**重要：** 必须重启 Expo 应用才能加载新的环境变量！

```bash
# 停止当前 Expo（Ctrl+C）
# 然后重新启动
npm start
```

### 2. 验证连接

重启后，应该看到：

```
[API] Platform: ios, API URL: http://192.168.1.166:3000
[API] Checking health at http://192.168.1.166:3000/health
[API] Health check result: CONNECTED ✅
[API] Initialization complete. Available: true
[App] API initialization complete. Available: true
```

### 3. 测试数据同步

尝试创建数据，应该看到：

```
[API] → POST /api/shutoffs
[API] ✓ POST /api/shutoffs → 200 OK
[Storage] ✅ Successfully saved to MongoDB
```

## 如果仍然失败

### 检查防火墙

Windows 防火墙可能阻止了端口 3000。检查：
1. Windows 设置 → 防火墙
2. 允许应用通过防火墙
3. 确保 Node.js 被允许

### 检查服务器日志

当应用尝试连接时，服务器终端应该显示：

```
[HTTP] ← GET /health
[HTTP] GET /health → 200 (Xms)
```

如果没有这些日志，说明请求没有到达服务器。

### 尝试其他 IP 地址

如果 `192.168.1.166` 不工作，尝试：
- `192.168.8.1`
- `192.168.56.1`

修改 `.env` 文件中的 IP 地址，然后重启 Expo。

## 验证服务器配置

确保服务器监听 `0.0.0.0`（所有网络接口）：

```javascript
app.listen(PORT, '0.0.0.0', () => {
  // 应该监听 0.0.0.0，不是 127.0.0.1
});
```

## 常见问题

**Q: 为什么浏览器可以访问但 iOS 模拟器不行？**
A: iOS 模拟器的网络隔离，`localhost` 指向模拟器自身，不是宿主机。

**Q: 为什么需要重启 Expo？**
A: 环境变量在应用启动时加载，需要重启才能生效。

**Q: 如果 IP 地址改变了怎么办？**
A: 更新 `.env` 文件中的 `EXPO_PUBLIC_API_URL`，然后重启 Expo。
