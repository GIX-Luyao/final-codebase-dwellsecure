# 🧪 测试数据库连接

## 简单测试：进入 AI Chat 屏幕

我已经添加了一个自动测试功能。当你进入 AI Chat 屏幕时，会自动创建一条测试记录到 MongoDB。

---

## 📋 测试步骤

### 步骤 1: 确保服务器正在运行

**打开 PowerShell 窗口：**

```bash
cd server
npm start
```

**必须看到：**
```
✅ Successfully connected to MongoDB!
🚀 Server running on port 3000
📊 Database status: CONNECTED ✅
```

**⚠️ 保持这个窗口打开！**

---

### 步骤 2: 打开应用并进入 AI Chat 屏幕

1. 启动你的 Expo 应用
2. 导航到 **AI Chat** 屏幕（AI 助手页面）

---

### 步骤 3: 查看应用控制台

**当你进入 AI Chat 屏幕时，应用控制台应该显示：**

```
[AI Chat] 🧪 Creating test record for database connection...
[AI Chat] Test shutoff data: { id: 'test-ai-chat-...', type: 'electric', ... }
[Storage] Saving shutoff: test-ai-chat-...
[Storage] API available: true
[Storage] Attempting to save to MongoDB via API...
[API] POST /api/shutoffs
[API] Request successful: /api/shutoffs
[Storage] ✅ Successfully saved to MongoDB
[AI Chat] ✅ Test record created successfully!
[AI Chat] Check MongoDB Atlas to verify the record exists.
```

**如果看到错误：** 检查服务器是否在运行，以及 API 连接是否正常。

---

### 步骤 4: 查看服务器终端

**服务器终端应该显示：**

```
[HTTP] 2024-... POST /api/shutoffs
[HTTP] Request body keys: [ 'id', 'type', 'description', ... ]

[1234567890] ========== POST /api/shutoffs ==========
[1234567890] Timestamp: 2024-...
[1234567890] Database status: CONNECTED ✅
[1234567890] Received shutoff data: { id: 'test-ai-chat-...', type: 'electric', ... }
[1234567890] Saving to MongoDB collection: shutoffs
[1234567890] Shutoff ID: test-ai-chat-...
[1234567890] ✅ MongoDB operation result: { upsertedCount: 1, ... }
[1234567890] ✅ VERIFIED: Document exists in MongoDB with ID: test-ai-chat-...
[1234567890] 📊 Total shutoffs in database: X
[1234567890] ✅ Created shutoff: test-ai-chat-...
```

**关键检查点：**

1. ✅ **看到 `[HTTP] POST /api/shutoffs`？**
   - 如果没有：请求没有到达服务器

2. ✅ **看到 `Database status: CONNECTED ✅`？**
   - 如果显示 `DISCONNECTED ❌`：数据库连接失败

3. ✅ **看到 `upsertedCount: 1`？**
   - 这表示新文档已创建

4. ✅ **看到 `✅ VERIFIED: Document exists in MongoDB`？**
   - 这表示文档确实保存了

---

### 步骤 5: 验证 MongoDB Atlas

1. 访问 https://cloud.mongodb.com
2. 登录你的账户
3. 选择你的 Cluster
4. 点击 **"Browse Collections"**
5. 选择 `dwellsecure` 数据库
6. 查看 `shutoffs` 集合
7. **应该能看到一条新记录：**
   - ID: `test-ai-chat-...`（带时间戳）
   - Type: `electric`
   - Description: `Test record created from AI Chat screen`
   - Location: `Test Location`

---

## 🚨 如果测试失败

### 问题 1: 没有看到 `[AI Chat] 🧪 Creating test record`

**可能原因：** 屏幕没有正确加载

**解决：** 确保你真正进入了 AI Chat 屏幕，检查导航是否正确

---

### 问题 2: 看到 `[Storage] API not available`

**可能原因：** 服务器没有运行或无法连接

**解决：**
1. 确认服务器正在运行（步骤 1）
2. 检查 `http://localhost:3000/health` 是否可访问
3. 如果是真实设备，设置 `EXPO_PUBLIC_API_URL` 环境变量

---

### 问题 3: 看到 `Database status: DISCONNECTED ❌`

**可能原因：** MongoDB 连接失败

**解决：**
1. 检查服务器启动时的连接日志
2. 运行 `node server/test-connection.js` 测试连接
3. 检查 MongoDB Atlas 网络访问设置

---

### 问题 4: 看到 `upsertedCount: 0`

**可能原因：** MongoDB 操作失败

**解决：**
1. 查看服务器终端中的完整错误信息
2. 检查 MongoDB 用户权限
3. 验证连接字符串是否正确

---

### 问题 5: MongoDB Atlas 中没有看到记录

**可能原因：** 
- 数据没有真正保存
- 查看错误的数据库/集合
- 刷新问题

**解决：**
1. 检查服务器日志，确认看到 `✅ VERIFIED: Document exists`
2. 确认查看的是 `dwellsecure` 数据库的 `shutoffs` 集合
3. 在 MongoDB Atlas 中点击刷新按钮
4. 检查是否有筛选器或查询条件

---

## 💡 需要的信息

**如果测试失败，请提供：**

1. ✅ 服务器启动时的完整输出
2. ✅ 进入 AI Chat 屏幕时，应用控制台的完整日志（复制所有 `[AI Chat]`、`[Storage]`、`[API]` 日志）
3. ✅ 进入 AI Chat 屏幕时，服务器终端的完整日志（复制所有 `[HTTP]` 和 `[数字]` 日志）
4. ✅ `http://localhost:3000/health` 的响应是什么？
5. ✅ 你能在 MongoDB Atlas 中看到任何文档吗？

---

## 🎯 成功标志

**如果测试成功，你应该看到：**

1. ✅ 应用控制台：`[AI Chat] ✅ Test record created successfully!`
2. ✅ 服务器终端：`[数字] ✅ VERIFIED: Document exists in MongoDB`
3. ✅ MongoDB Atlas：在 `shutoffs` 集合中看到测试记录

**如果所有三个都成功，说明数据库连接正常工作！** 🎉
