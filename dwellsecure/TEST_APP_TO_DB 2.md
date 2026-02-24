# 🧪 测试：应用 → MongoDB

## ✅ 数据库连接已成功！

连接测试显示 MongoDB 连接正常工作。现在需要确保应用可以保存数据到数据库。

---

## 📋 完整测试步骤

### 步骤 1: 启动后端服务器（必须）

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

**⚠️ 保持这个窗口打开！** 如果关闭，数据无法保存到 MongoDB。

---

### 步骤 2: 启动应用

**在另一个终端窗口：**

```bash
npm start
```

或者使用你的 Expo 开发工具启动应用。

---

### 步骤 3: 测试自动创建记录（最简单）

1. **打开应用**
2. **进入 AI Chat 屏幕**
3. **等待 1 秒** - 会自动创建一条测试记录

**查看服务器终端，应该看到：**
```
[HTTP] POST /api/shutoffs
[数字] ========== POST /api/shutoffs ==========
[数字] Database status: CONNECTED ✅
[数字] ✅ MongoDB operation result: { upsertedCount: 1, ... }
[数字] ✅ VERIFIED: Document exists in MongoDB
[数字] 📊 Total shutoffs in database: 1
```

**查看应用控制台，应该看到：**
```
[AI Chat] 🧪 Creating test record for database connection...
[Storage] ✅ Successfully saved to MongoDB
[AI Chat] ✅ Test record created successfully!
```

---

### 步骤 4: 手动添加数据

1. **在应用中添加一个 Shutoff：**
   - 进入 Shutoffs 列表
   - 点击 "+" 按钮
   - 填写信息（类型、描述、位置等）
   - 点击保存

2. **查看服务器终端，应该看到：**
   ```
   [HTTP] POST /api/shutoffs
   [数字] ✅ VERIFIED: Document exists in MongoDB
   [数字] 📊 Total shutoffs in database: 2
   ```

3. **查看应用控制台，应该看到：**
   ```
   [Storage] ✅ Successfully saved to MongoDB
   ```

---

### 步骤 5: 验证 MongoDB Atlas

1. **访问 https://cloud.mongodb.com**
2. **Browse Collections**
3. **选择 `dwellsecure` 数据库**
4. **查看 `shutoffs` 集合**
5. **应该能看到你的数据！**

**每条记录应该包含：**
- `id`: 唯一标识符
- `type`: 类型（gas/electric/water）
- `description`: 描述
- `location`: 位置
- `verification_status`: 验证状态
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

---

## 🔍 如何确认数据已保存

### 方法 1: 查看服务器终端日志

**当你保存数据时，服务器应该显示：**
```
[数字] ✅ VERIFIED: Document exists in MongoDB
[数字] 📊 Total shutoffs in database: X
```

**X 应该增加！**

---

### 方法 2: 查看应用状态指示器

**在 Shutoffs 列表页面顶部：**

- **绿色 "✅ MongoDB 已连接"** = 正常，数据会保存到 MongoDB ✅
- **橙色 "⚠️ 仅本地存储"** = 服务器未运行或无法连接 ❌

---

### 方法 3: 查看 MongoDB Atlas

**在 MongoDB Atlas 中：**
- 刷新页面
- 查看 `shutoffs` 集合
- 应该能看到新添加的文档

---

### 方法 4: 运行检查脚本

```bash
cd server
node check-database.js
```

**应该显示：**
```
📝 Document counts:
   - shutoffs: X documents
```

**X 应该等于你在应用中添加的记录数！**

---

## 🚨 如果数据没有保存

### 检查清单：

1. ✅ **服务器是否在运行？**
   - 运行 `cd server && npm start`
   - 必须看到 "Server running on port 3000"

2. ✅ **应用是否显示绿色状态？**
   - 如果显示橙色，服务器未连接

3. ✅ **应用控制台是否有错误？**
   - 查看 `[Storage]` 和 `[API]` 日志
   - 如果有错误，复制错误信息

4. ✅ **服务器终端是否有日志？**
   - 保存数据时，应该看到 `[HTTP] POST /api/shutoffs`
   - 如果没有，请求没有到达服务器

5. ✅ **API 是否可访问？**
   - 浏览器打开：`http://localhost:3000/health`
   - 应该看到：`{"status":"ok","db":"connected"}`

---

## 💡 快速测试

**最简单的测试方法：**

1. **启动服务器**（步骤 1）
2. **打开应用**
3. **进入 AI Chat 屏幕** - 会自动创建测试记录
4. **查看服务器终端** - 应该看到保存日志
5. **查看 MongoDB Atlas** - 应该能看到记录

**如果这 5 步都成功，说明一切正常！** ✅

---

## 🎯 成功标志

**如果一切正常，你应该看到：**

1. ✅ 服务器显示 "Database status: CONNECTED ✅"
2. ✅ 应用顶部显示绿色 "✅ MongoDB 已连接"
3. ✅ 保存数据时，服务器终端显示 "✅ VERIFIED: Document exists in MongoDB"
4. ✅ MongoDB Atlas 中能看到你的数据
5. ✅ 每次保存后，文档计数增加

**如果所有 5 个都成功，数据库连接完全正常工作！** 🎉
