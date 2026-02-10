# 🔐 验证 MongoDB 密码

## ⚠️ 重要：密码已更新但认证仍然失败

我已经更新了代码中的密码为：`olC9JGNkrpsIoQpk`

但是连接测试仍然失败，可能的原因：

---

## 🔍 检查步骤

### 步骤 1: 确认 MongoDB Atlas 中的密码已更新

1. 访问 https://cloud.mongodb.com
2. 登录你的账户
3. 点击 **"Database Access"**（左侧菜单）
4. 找到用户 `sche753_db_user`
5. 点击 **"Edit"**
6. **确认密码是否真的是 `olC9JGNkrpsIoQpk`**
7. 如果不是，请：
   - 点击 **"Edit Password"**
   - 设置新密码为 `olC9JGNkrpsIoQpk`
   - 点击 **"Update User"**

---

### 步骤 2: 从 MongoDB Atlas 获取完整连接字符串

**这是最可靠的方法：**

1. 在 MongoDB Atlas 中
2. 点击 **"Connect"** 按钮（在你的 Cluster 旁边）
3. 选择 **"Connect your application"**
4. 选择 **"Node.js"** 和版本（例如 `5.5 or later`）
5. **复制完整的连接字符串**

连接字符串应该类似：
```
mongodb+srv://sche753_db_user:olC9JGNkrpsIoQpk@cluster0.bjbz8jy.mongodb.net/?appName=Cluster0
```

6. 如果连接字符串中的密码不同，使用 Atlas 提供的连接字符串

---

### 步骤 3: 检查用户名

确认用户名是 `sche753_db_user`，不是其他名称。

---

### 步骤 4: 检查网络访问

确保你的 IP 地址在 MongoDB Atlas 白名单中：

1. MongoDB Atlas → **"Network Access"**
2. 点击 **"Add IP Address"**
3. 添加 `0.0.0.0/0`（允许所有 IP，仅用于开发）
4. 或者添加你的具体 IP 地址

---

### 步骤 5: 检查数据库用户权限

确保用户有读写权限：

1. MongoDB Atlas → **"Database Access"**
2. 找到用户 `sche753_db_user`
3. 确保有 **"Read and write to any database"** 权限

---

## 🧪 测试连接

更新密码后，运行测试：

```bash
cd server
node test-mongodb-connection.js
```

**如果成功，你会看到：**
```
✅ All tests passed! MongoDB connection is working correctly.
```

---

## 💡 如果仍然失败

**请提供：**

1. MongoDB Atlas 中用户 `sche753_db_user` 的密码是什么？
2. 你能从 MongoDB Atlas 获取连接字符串吗？如果可以，连接字符串是什么？
3. 网络访问设置中，你的 IP 是否在白名单中？
4. 用户权限是什么？（Read/Write 还是其他？）

---

## 🔄 替代方案：创建新的数据库用户

如果现有用户有问题，可以创建新用户：

1. MongoDB Atlas → **"Database Access"**
2. 点击 **"Add New Database User"**
3. 设置：
   - **Username**: `dwellsecure_user`（或任何你喜欢的名字）
   - **Password**: 设置一个强密码
   - **Database User Privileges**: 选择 **"Read and write to any database"**
4. 点击 **"Add User"**
5. 更新连接字符串中的用户名和密码

---

## 📝 更新连接字符串

一旦确认了正确的用户名和密码，更新 `server/index.js`：

```javascript
const password = '你的实际密码';
const encodedPassword = encodeURIComponent(password);
const uri = process.env.MONGODB_URI || `mongodb+srv://你的用户名:${encodedPassword}@cluster0.bjbz8jy.mongodb.net/?appName=Cluster0`;
```
