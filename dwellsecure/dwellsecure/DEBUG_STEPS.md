# 🔍 调试步骤：为什么数据没有保存到 MongoDB

## ⚠️ 最重要：服务器必须运行！

**如果服务器没有运行，数据只会保存到本地 AsyncStorage，不会保存到 MongoDB。**

---

## 📋 必须完成的步骤

### ✅ 步骤 1: 启动服务器并检查连接

**打开 PowerShell 窗口：**

```bash
cd server
npm start
```

**必须看到：**
```
============================================================
🚀 Starting DwellSecure API Server...
============================================================
📡 MongoDB URI: mongodb+srv://sche753_db_user:****@cluster0.bjbz8jy.mongodb.net/?appName=Cluster0
🔌 Connecting to MongoDB...
✅ Successfully connected to MongoDB!
📊 Database: dwellsecure
✅ Database connection established!
📊 Using database: dwellsecure
📦 Collections available: shutoffs, utilities
============================================================
✅ Server started successfully!
🚀 Server running on port 3000
📍 Health check: http://localhost:3000/health
🌐 Server listening on all interfaces (accessible from network)
📊 Database status: CONNECTED ✅
============================================================
📝 Ready to receive requests...
```

**如果看到错误：** MongoDB 连接失败，检查连接字符串和网络设置。

---

### ✅ 步骤 2: 测试 API 健康检查

**在浏览器打开：**
```
http://localhost:3000/health
```

**应该看到：**
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2024-..."
}
```

**如果 `db` 是 `"disconnected"`：** 数据库没有连接！

---

### ✅ 步骤 3: 在应用中保存数据

1. 打开应用
2. 添加一个 shutoff 或 utility
3. 保存

---

### ✅ 步骤 4: 检查服务器终端日志

**当你保存数据时，服务器终端应该显示：**

```
[HTTP] 2024-... POST /api/shutoffs
[HTTP] Request body keys: [ 'id', 'type', 'description', ... ]

[1234567890] ========== POST /api/shutoffs ==========
[1234567890] Timestamp: 2024-...
[1234567890] Database status: CONNECTED ✅
[1234567890] Received shutoff data: { id: '...', type: 'gas', ... }
[1234567890] Saving to MongoDB collection: shutoffs
[1234567890] Shutoff ID: ...
[1234567890] ✅ MongoDB operation result: { upsertedCount: 1, ... }
[1234567890] ✅ VERIFIED: Document exists in MongoDB with ID: ...
[1234567890] 📊 Total shutoffs in database: 1
[1234567890] ✅ Created shutoff: ...
[1234567890] ==========================================
```

**关键检查点：**

1. ✅ **看到 `[HTTP] POST /api/shutoffs`？**
   - 如果**没有**：请求没有到达服务器！
   - 检查应用控制台，看是否有网络错误

2. ✅ **看到 `Database status: CONNECTED ✅`？**
   - 如果显示 `DISCONNECTED ❌`：数据库连接失败

3. ✅ **看到 `✅ MongoDB operation result: { upsertedCount: 1 }`？**
   - `upsertedCount: 1` = 新文档已创建 ✅
   - `modifiedCount: 1` = 现有文档已更新 ✅
   - 如果都是 0：操作可能失败

4. ✅ **看到 `✅ VERIFIED: Document exists in MongoDB`？**
   - 如果看到 `❌ CRITICAL ERROR: Document not found`：保存失败！

5. ✅ **看到 `📊 Total shutoffs in database: X`？**
   - 这个数字应该增加！

---

### ✅ 步骤 5: 检查应用控制台

**在应用控制台（Expo 终端），应该看到：**

```
[Storage] Saving shutoff: 1234567890
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/shutoffs
[API] Request successful: /api/shutoffs
[Storage] ✅ Successfully saved to MongoDB
```

**如果看到：**
```
[Storage] API not available, using AsyncStorage only
```

**说明：** API 连接失败，检查步骤 1 和 2。

---

### ✅ 步骤 6: 验证 MongoDB Atlas

1. 访问 https://cloud.mongodb.com
2. 登录你的账户
3. 选择你的 Cluster
4. 点击 "Browse Collections"
5. 选择 `dwellsecure` 数据库
6. 查看 `shutoffs` 或 `utilities` 集合
7. **应该能看到你刚保存的文档！**

---

## 🚨 常见问题诊断

### 问题 1: 没有看到 `[HTTP] POST` 日志

**症状：** 服务器终端没有任何日志

**可能原因：**
- 服务器没有运行
- 应用无法连接到服务器
- API URL 配置错误

**解决：**
1. 确认服务器正在运行（步骤 1）
2. 检查应用控制台，看是否有网络错误
3. 检查 `src/services/apiClient.js` 中的 API URL
4. 如果是真实设备，设置 `EXPO_PUBLIC_API_URL` 环境变量

---

### 问题 2: 看到 `Database status: DISCONNECTED ❌`

**症状：** 服务器启动时没有连接数据库

**可能原因：**
- MongoDB 连接字符串错误
- 网络问题
- MongoDB Atlas 访问限制

**解决：**
1. 运行 `node server/test-connection.js` 测试连接
2. 检查 MongoDB Atlas 网络访问设置
3. 确认连接字符串正确

---

### 问题 3: 看到 `upsertedCount: 0, modifiedCount: 0`

**症状：** MongoDB 操作没有创建或更新文档

**可能原因：**
- 查询条件不匹配
- 数据格式问题
- MongoDB 权限问题

**解决：**
1. 检查服务器日志中的完整错误信息
2. 验证数据格式是否正确
3. 检查 MongoDB 用户权限

---

### 问题 4: 看到 `❌ CRITICAL ERROR: Document not found after save`

**症状：** 保存操作成功，但验证时找不到文档

**可能原因：**
- 数据库连接在操作后断开
- 事务问题
- 集合名称错误

**解决：**
1. 检查 MongoDB Atlas，看文档是否真的存在
2. 检查服务器日志中的完整错误信息
3. 验证集合名称是否正确

---

## 💡 需要的信息

**如果仍然不工作，请提供：**

1. ✅ 服务器启动时的完整输出（复制所有日志）
2. ✅ 保存数据时，服务器终端的完整日志（复制所有 `[HTTP]` 和 `[数字]` 日志）
3. ✅ 保存数据时，应用控制台的完整日志（复制所有 `[Storage]` 和 `[API]` 日志）
4. ✅ `http://localhost:3000/health` 的响应是什么？
5. ✅ 你能在 MongoDB Atlas 中看到任何文档吗？

---

## 🎯 快速测试

**手动测试 API：**

```powershell
$body = @{
    id = "test-manual-$(Get-Date -Format 'yyyyMMddHHmmss')"
    type = "gas"
    description = "Manual test from PowerShell"
    verification_status = "unverified"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/shutoffs -Method POST -ContentType "application/json" -Body $body
```

**然后检查服务器终端，应该看到详细的日志！**
