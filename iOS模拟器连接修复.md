# iOS 模拟器连接修复

## 问题

浏览器可以访问 `http://localhost:3000/health`，但 iOS 模拟器中的 Expo 应用无法连接，一直显示 "Network request failed"。

## 原因

iOS 模拟器中的 `localhost` 可能指向模拟器自身，而不是宿主机的 localhost。这是 iOS 模拟器的一个已知问题。

## 解决方案

### 方案 1: 使用 127.0.0.1（已修复）

代码已更新为使用 `http://127.0.0.1:3000` 而不是 `http://localhost:3000`。

**重启 Expo 应用后应该可以工作。**

### 方案 2: 如果 127.0.0.1 仍然不工作

使用宿主机的 IP 地址：

1. **找到你的电脑 IP 地址：**
   - Windows: 运行 `ipconfig`，查找 "IPv4 地址"
   - Mac: 运行 `ifconfig` 或 `ip addr`

2. **设置环境变量：**
   在项目根目录创建 `.env` 文件：
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```
   例如：`EXPO_PUBLIC_API_URL=http://192.168.1.100:3000`

3. **重启 Expo 应用**

### 方案 3: 检查服务器监听地址

确保服务器监听 `0.0.0.0`（所有网络接口），而不是 `127.0.0.1`。

检查 `server/index.js`：
```javascript
app.listen(PORT, '0.0.0.0', () => {
  // 应该监听 0.0.0.0
});
```

## 验证修复

修复后，应该看到：

```
[API] Platform: ios, API URL: http://127.0.0.1:3000
[API] Checking health at http://127.0.0.1:3000/health
[API] Health check result: CONNECTED ✅
[API] Initialization complete. Available: true
[App] API initialization complete. Available: true
```

而不是：
```
[API] Health check failed: Network request failed
[API] Initialization complete. Available: false
```

## 测试步骤

1. **重启 Expo 应用**（重要！）
2. **查看日志**，确认 API URL 是 `http://127.0.0.1:3000`
3. **尝试创建数据**，应该看到：
   ```
   [API] → POST /api/shutoffs
   [API] ✓ POST /api/shutoffs → 200 OK
   [Storage] ✅ Successfully saved to MongoDB
   ```

## 如果仍然失败

请检查：
1. 服务器是否正在运行（`npm start`）
2. 服务器终端是否显示收到请求
3. 防火墙是否阻止了连接
4. 尝试使用电脑 IP 地址（方案 2）
