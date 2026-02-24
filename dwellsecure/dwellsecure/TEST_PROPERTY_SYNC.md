# 🧪 测试：Property → Shutoff → Utility 数据库同步

## ✅ 已添加 Property 数据库支持

我已经添加了 Property 的数据库同步功能。现在所有三个数据类型（Property、Shutoff、Utility）都会同步到 MongoDB。

---

## 📋 测试步骤

### 步骤 1: 启动服务器（必须）

```bash
cd server
npm start
```

**必须看到：**
```
✅ Successfully connected to MongoDB!
🚀 Server running on port 3000
📊 Database status: CONNECTED ✅
📝 Current documents: X shutoffs, Y utilities, Z properties
```

**⚠️ 保持这个窗口打开！**

---

### 步骤 2: 启动应用

启动你的 Expo 应用。

---

### 步骤 3: 添加 Property

1. **在应用中添加一个 Property：**
   - 进入 Properties 列表
   - 点击添加按钮
   - 填写信息（名称、地址等）
   - 点击保存

2. **查看服务器终端，应该看到：**
   ```
   [HTTP] POST /api/properties
   [数字] ========== POST /api/properties ==========
   [数字] ✅ VERIFIED: Document exists in MongoDB
   [数字] 📊 Total properties in database: 1
   ```

3. **查看应用控制台，应该看到：**
   ```
   [Storage] ✅ Successfully saved to MongoDB
   ```

---

### 步骤 4: 在 Property 中添加 Shutoff

1. **打开刚创建的 Property**
2. **添加一个 Shutoff：**
   - 点击添加 Shutoff
   - 填写信息（类型、描述、位置等）
   - 点击保存

3. **查看服务器终端，应该看到：**
   ```
   [HTTP] POST /api/shutoffs
   [数字] ✅ VERIFIED: Document exists in MongoDB
   [数字] 📊 Total shutoffs in database: 1
   ```

---

### 步骤 5: 在 Property 中添加 Utility

1. **在同一个 Property 中**
2. **添加一个 Utility：**
   - 点击添加 Utility
   - 填写信息（名称、类型等）
   - 点击保存

3. **查看服务器终端，应该看到：**
   ```
   [HTTP] POST /api/utilities
   [数字] ✅ VERIFIED: Document exists in MongoDB
   [数字] 📊 Total utilities in database: 1
   ```

---

### 步骤 6: 验证 MongoDB Atlas

1. **访问 https://cloud.mongodb.com**
2. **Browse Collections**
3. **选择 `dwellsecure` 数据库**
4. **查看三个集合：**
   - `properties` - 应该有你添加的 property
   - `shutoffs` - 应该有你添加的 shutoff
   - `utilities` - 应该有你添加的 utility

---

## 🔍 如何确认数据已保存

### 方法 1: 查看服务器终端日志

**当你保存数据时，服务器应该显示：**
- Property: `[数字] ✅ VERIFIED: Document exists in MongoDB`
- Shutoff: `[数字] ✅ VERIFIED: Document exists in MongoDB`
- Utility: `[数字] ✅ VERIFIED: Document exists in MongoDB`

**文档计数应该增加！**

---

### 方法 2: 查看应用状态指示器

**在 Shutoffs 列表页面顶部：**

- **绿色 "✅ MongoDB 已连接"** = 正常，数据会保存到 MongoDB ✅
- **橙色 "⚠️ 仅本地存储"** = 服务器未运行或无法连接 ❌

---

### 方法 3: 查看 MongoDB Atlas

**在 MongoDB Atlas 中：**
- 刷新页面
- 查看 `properties`、`shutoffs`、`utilities` 集合
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
   - properties: X documents
   - shutoffs: Y documents
   - utilities: Z documents
```

**X, Y, Z 应该等于你在应用中添加的记录数！**

---

## 🎯 成功标志

**如果一切正常，你应该看到：**

1. ✅ 服务器显示 "Database status: CONNECTED ✅"
2. ✅ 应用顶部显示绿色 "✅ MongoDB 已连接"
3. ✅ 保存 Property 时，服务器终端显示 "✅ VERIFIED: Document exists in MongoDB"
4. ✅ 保存 Shutoff 时，服务器终端显示 "✅ VERIFIED: Document exists in MongoDB"
5. ✅ 保存 Utility 时，服务器终端显示 "✅ VERIFIED: Document exists in MongoDB"
6. ✅ MongoDB Atlas 中能看到所有三个集合的数据

**如果所有 6 个都成功，数据库同步完全正常工作！** 🎉

---

## 📊 数据关系

**在 MongoDB 中：**
- `properties` 集合：存储所有 properties
- `shutoffs` 集合：存储所有 shutoffs（可能包含 `propertyId` 字段关联到 property）
- `utilities` 集合：存储所有 utilities（可能包含 `propertyId` 字段关联到 property）

**数据会分别保存在各自的集合中，但可以通过 `propertyId` 字段关联。**

---

## 💡 提示

- **服务器必须运行** - 如果服务器没有运行，数据只会保存到本地 AsyncStorage
- **查看日志** - 服务器终端会显示详细的日志，包括每个请求和数据库操作
- **状态指示器** - 在 Shutoffs 列表页面顶部，你会看到连接状态
