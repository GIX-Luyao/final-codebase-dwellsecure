# ✅ 完整数据库同步指南

## 🎉 已完成的功能

所有操作（Property、Utility、Shutoff、Reminder 的 Add、Edit、Delete）都已连接到数据库！

---

## 📋 已实现的 API 端点

### 服务器端 (`server/index.js`)

✅ **Properties:**
- `GET /api/properties` - 获取所有 properties
- `GET /api/properties/:id` - 获取单个 property
- `POST /api/properties` - 创建/更新 property
- `DELETE /api/properties/:id` - 删除 property

✅ **Utilities:**
- `GET /api/utilities` - 获取所有 utilities
- `GET /api/utilities/:id` - 获取单个 utility
- `POST /api/utilities` - 创建/更新 utility
- `DELETE /api/utilities/:id` - 删除 utility

✅ **Shutoffs:**
- `GET /api/shutoffs` - 获取所有 shutoffs
- `GET /api/shutoffs/:id` - 获取单个 shutoff
- `POST /api/shutoffs` - 创建/更新 shutoff
- `DELETE /api/shutoffs/:id` - 删除 shutoff

✅ **Reminders:**
- `GET /api/reminders` - 获取所有 reminders
- `GET /api/reminders/:id` - 获取单个 reminder
- `POST /api/reminders` - 创建/更新 reminder
- `DELETE /api/reminders/:id` - 删除 reminder

---

## 📱 前端同步 (`src/services/storage.js`)

✅ **所有函数都已更新：**
- `getProperties()` - 从 API 获取，失败时回退到 AsyncStorage
- `saveProperty()` - 保存到 API，成功后也保存到 AsyncStorage 作为备份
- `deleteProperty()` - 从 API 删除，成功后也更新 AsyncStorage

- `getUtilities()` - 从 API 获取
- `saveUtility()` - 保存到 API
- `deleteUtility()` - 从 API 删除

- `getShutoffs()` - 从 API 获取
- `saveShutoff()` - 保存到 API
- `deleteShutoff()` - 从 API 删除

- `getReminders()` - 从 API 获取
- `saveReminder()` - 保存到 API
- `deleteReminder()` - 从 API 删除

---

## 🔄 UI 自动刷新

✅ **所有列表屏幕都使用 `useFocusEffect`：**
- `PropertyListScreen` - 屏幕获得焦点时自动刷新
- `UtilitiesListScreen` - 屏幕获得焦点时自动刷新
- `ShutoffsListScreen` - 屏幕获得焦点时自动刷新
- `RemindersScreen` - 屏幕获得焦点时自动刷新

**这意味着：**
- 当你从添加/编辑屏幕返回时，列表会自动刷新
- 当你删除数据后，列表会自动更新
- UI 会立即反映数据库的变化

---

## 🧪 测试步骤

### 步骤 1: 启动服务器

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

### 步骤 2: 测试 Property

1. **添加 Property：**
   - 在应用中添加 property
   - 查看服务器终端：应该看到 `POST /api/properties`
   - 返回列表：应该看到新添加的 property

2. **编辑 Property：**
   - 编辑 property
   - 查看服务器终端：应该看到 `POST /api/properties`（更新）
   - 返回列表：应该看到更新的 property

3. **删除 Property：**
   - 删除 property
   - 查看服务器终端：应该看到 `DELETE /api/properties/:id`
   - 列表：property 应该消失

---

### 步骤 3: 测试 Utility

1. **添加 Utility：**
   - 在 property 中添加 utility
   - 查看服务器终端：应该看到 `POST /api/utilities`
   - UI 应该立即更新

2. **编辑 Utility：**
   - 编辑 utility
   - 查看服务器终端：应该看到 `POST /api/utilities`（更新）
   - UI 应该立即更新

3. **删除 Utility：**
   - 删除 utility
   - 查看服务器终端：应该看到 `DELETE /api/utilities/:id`
   - UI 应该立即更新

---

### 步骤 4: 测试 Shutoff

1. **添加 Shutoff：**
   - 在 property 中添加 shutoff
   - 查看服务器终端：应该看到 `POST /api/shutoffs`
   - UI 应该立即更新

2. **编辑 Shutoff：**
   - 编辑 shutoff
   - 查看服务器终端：应该看到 `POST /api/shutoffs`（更新）
   - UI 应该立即更新

3. **删除 Shutoff：**
   - 删除 shutoff
   - 查看服务器终端：应该看到 `DELETE /api/shutoffs/:id`
   - UI 应该立即更新

---

### 步骤 5: 测试 Reminder

1. **添加 Reminder：**
   - 添加 shutoff 时设置维护日期/时间（会自动创建 reminder）
   - 或手动添加 reminder
   - 查看服务器终端：应该看到 `POST /api/reminders`
   - UI 应该立即更新

2. **编辑 Reminder：**
   - 编辑 reminder
   - 查看服务器终端：应该看到 `POST /api/reminders`（更新）
   - UI 应该立即更新

3. **删除 Reminder：**
   - 删除 reminder
   - 查看服务器终端：应该看到 `DELETE /api/reminders/:id`
   - UI 应该立即更新

---

## 🔍 验证数据

### 方法 1: 查看服务器终端

**当你操作数据时，服务器应该显示：**
```
[HTTP] POST /api/properties
[数字] ✅ VERIFIED: Document exists in MongoDB
[数字] 📊 Total properties in database: X
```

**X 应该增加或更新！**

---

### 方法 2: 查看 MongoDB Atlas

1. **访问 https://cloud.mongodb.com**
2. **Browse Collections**
3. **选择 `dwellsecure` 数据库**
4. **查看四个集合：**
   - `properties` - 你的 properties
   - `utilities` - 你的 utilities
   - `shutoffs` - 你的 shutoffs
   - `reminders` - 你的 reminders

---

### 方法 3: 运行检查脚本

```bash
cd server
node check-all-data.js
```

**应该显示所有集合的文档数量。**

---

## 🎯 成功标志

**如果一切正常，你应该看到：**

1. ✅ 服务器显示 "Database status: CONNECTED ✅"
2. ✅ 应用顶部显示绿色 "✅ MongoDB 已连接"
3. ✅ 添加数据时，服务器终端显示 "✅ VERIFIED: Document exists in MongoDB"
4. ✅ 编辑数据时，服务器终端显示更新日志
5. ✅ 删除数据时，服务器终端显示删除日志
6. ✅ UI 立即反映所有变化（列表自动刷新）
7. ✅ MongoDB Atlas 中能看到所有数据

---

## 💡 提示

- **服务器必须运行** - 如果服务器没有运行，数据只会保存到本地 AsyncStorage
- **查看日志** - 服务器终端会显示详细的日志，包括每个请求和数据库操作
- **状态指示器** - 在 Shutoffs 列表页面顶部，你会看到连接状态
- **自动刷新** - 列表会在屏幕获得焦点时自动刷新，无需手动刷新

---

## 🚨 如果数据没有保存

**检查清单：**

1. ✅ 服务器是否在运行？
2. ✅ 应用是否显示绿色状态？
3. ✅ 服务器终端是否有 `[HTTP] POST` 日志？
4. ✅ 应用控制台是否有 `[Storage] ✅ Successfully saved to MongoDB` 日志？

**如果所有 4 个都正常，数据应该已经保存到 MongoDB！**

---

## 🎉 完成！

**所有操作现在都已连接到数据库，UI 会自动更新！**

**请启动服务器并测试应用。所有数据都会同步到 MongoDB！**
