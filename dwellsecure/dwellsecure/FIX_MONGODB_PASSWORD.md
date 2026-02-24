# 🔐 修复 MongoDB 密码问题

## ❌ 错误信息

```
Error message: bad auth : authentication failed
```

**这意味着：** MongoDB 连接字符串中的密码不正确。

---

## ✅ 解决方案

### 步骤 1: 获取正确的 MongoDB 连接字符串

1. 访问 https://cloud.mongodb.com
2. 登录你的账户
3. 选择你的 Cluster (`Cluster0`)
4. 点击 **"Connect"** 按钮
5. 选择 **"Connect your application"**
6. 选择 **"Node.js"** 和版本（例如 `5.5 or later`）
7. **复制完整的连接字符串**

连接字符串格式应该是：
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
```

---

### 步骤 2: 更新连接字符串

**选项 A: 使用环境变量（推荐）**

1. 在 `server` 目录创建 `.env` 文件：
   ```bash
   cd server
   ```

2. 创建 `.env` 文件，内容：
   ```
   MONGODB_URI=mongodb+srv://sche753_db_user:你的实际密码@cluster0.bjbz8jy.mongodb.net/?appName=Cluster0
   ```
   **重要：** 将 `你的实际密码` 替换为 MongoDB Atlas 中的实际密码！

3. 确保 `.env` 文件在 `.gitignore` 中（不要提交密码到 Git）

---

**选项 B: 直接修改代码**

编辑 `server/index.js`，找到这一行：
```javascript
const uri = process.env.MONGODB_URI || "mongodb+srv://sche753_db_user:AUXacLKPJb8Phpdx@cluster0.bjbz8jy.mongodb.net/?appName=Cluster0";
```

将 `AUXacLKPJb8Phpdx` 替换为你的实际 MongoDB 密码。

---

### 步骤 3: 验证密码

**如果你忘记了密码，可以重置：**

1. 在 MongoDB Atlas 中
2. 点击 **"Database Access"**（左侧菜单）
3. 找到用户 `sche753_db_user`
4. 点击 **"Edit"**
5. 点击 **"Edit Password"**
6. 设置新密码
7. 更新连接字符串中的密码

---

### 步骤 4: 测试连接

更新密码后，运行测试：

```bash
cd server
node test-mongodb-connection.js
```

**应该看到：**
```
✅ All tests passed! MongoDB connection is working correctly.
```

---

## 🔍 检查清单

- [ ] 从 MongoDB Atlas 获取了正确的连接字符串
- [ ] 连接字符串中包含正确的用户名和密码
- [ ] 密码中没有特殊字符需要 URL 编码（如果有，使用 `encodeURIComponent()`）
- [ ] 测试脚本可以成功连接
- [ ] 服务器可以成功连接

---

## 💡 常见问题

### 问题 1: 密码包含特殊字符

如果密码包含特殊字符（如 `@`, `#`, `%` 等），需要 URL 编码：

```javascript
const password = encodeURIComponent('your@password#123');
const uri = `mongodb+srv://username:${password}@cluster0.xxxxx.mongodb.net/?appName=Cluster0`;
```

### 问题 2: 用户权限不足

确保数据库用户有读写权限：
1. MongoDB Atlas → Database Access
2. 找到你的用户
3. 确保有 `readWrite` 权限

### 问题 3: IP 地址未白名单

确保你的 IP 地址在 MongoDB Atlas 网络访问白名单中：
1. MongoDB Atlas → Network Access
2. 点击 "Add IP Address"
3. 添加 `0.0.0.0/0`（允许所有 IP，仅用于开发）或你的具体 IP

---

## 🎯 下一步

一旦连接测试成功，你就可以：
1. 启动服务器：`cd server && npm start`
2. 测试应用：进入 AI Chat 屏幕
3. 验证数据：在 MongoDB Atlas 中查看数据
