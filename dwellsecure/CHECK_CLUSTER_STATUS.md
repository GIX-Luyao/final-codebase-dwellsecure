# 🔍 检查 MongoDB Atlas Cluster 状态

## ❌ SSL 错误通常是因为 Cluster 是 Paused 状态

**这是最常见的原因！**

---

## ✅ 立即检查步骤

### 步骤 1: 访问 MongoDB Atlas

1. **打开浏览器**
2. **访问 https://cloud.mongodb.com**
3. **登录你的账户**

---

### 步骤 2: 检查 Cluster 状态

1. **找到你的 Cluster "Haven"**
2. **查看 Cluster 状态：**
   - **"Active"** = 正常运行 ✅
   - **"Paused"** = 已暂停 ❌（这就是问题！）

---

### 步骤 3: 如果 Cluster 是 Paused

1. **点击 Cluster 名称 "Haven"**
2. **点击 "Resume" 或 "Resume Cluster" 按钮**
3. **等待 2-5 分钟让 Cluster 完全启动**
4. **状态应该变成 "Active"**

---

### 步骤 4: 重新启动服务器

**Cluster 恢复后：**

```bash
cd server
npm start
```

**应该看到：**
```
✅ MongoDB client connected
✅ Ping successful - database is accessible
```

---

## 🚨 如果 Cluster 已经是 Active

### 检查其他可能的原因：

1. **Network Access（网络访问）：**
   - MongoDB Atlas → "Network Access"
   - 确保你的 IP `205.175.106.250/32` 在白名单中
   - 状态应该是 "Active"

2. **Node.js 版本：**
   ```bash
   node --version
   ```
   - 如果版本 < 18，更新到最新 LTS 版本

3. **连接字符串：**
   - 从 MongoDB Atlas 重新获取连接字符串
   - 确保格式正确

---

## 💡 临时解决方案

**如果急需测试应用：**

- 数据会保存到本地 AsyncStorage
- 稍后解决 SSL 问题后再同步到 MongoDB

**但这只是临时方案，最终需要解决连接问题。**

---

## 🎯 最可能的原因

**90% 的情况下，SSL 错误是因为 Cluster 是 Paused 状态！**

**请先检查 Cluster 状态，如果是 Paused，恢复它！**
