# 🔧 修复 DNS 解析错误

## ❌ 当前错误

```
Error message: querySrv ENOTFOUND _mongodb._tcp.cluster0.bjbz8jy.mongodb.net
```

**这意味着：** 无法解析 MongoDB 的 SRV 记录。

---

## ✅ 解决方案

### 方法 1: 检查网络连接

1. **检查互联网连接：**
   - 确保你的电脑连接到互联网
   - 尝试访问 https://cloud.mongodb.com

2. **检查防火墙：**
   - 确保防火墙没有阻止 Node.js 访问网络
   - 临时禁用防火墙测试

3. **检查 DNS 设置：**
   - 尝试使用不同的 DNS 服务器（如 Google DNS: 8.8.8.8）
   - 或者使用你的 ISP 的 DNS

---

### 方法 2: 验证连接字符串

**从 MongoDB Atlas 获取正确的连接字符串：**

1. 访问 https://cloud.mongodb.com
2. 登录你的账户
3. 点击 **"Connect"** 按钮（在你的 Cluster 旁边）
4. 选择 **"Connect your application"**
5. 选择 **"Node.js"** 和版本
6. **复制完整的连接字符串**

**确保连接字符串格式正确：**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?appName=Cluster0
```

---

### 方法 3: 使用标准连接字符串（非 SRV）

如果 SRV 记录有问题，可以尝试使用标准连接字符串：

编辑 `server/index.js`，将：
```javascript
mongodb+srv://...
```

改为：
```javascript
mongodb://...
```

但需要知道具体的服务器地址和端口。

---

### 方法 4: 检查 MongoDB Atlas 网络访问

1. MongoDB Atlas → **"Network Access"**
2. 确保你的 IP 地址在白名单中
3. 如果没有，添加 `0.0.0.0/0`（允许所有 IP，仅用于开发）

---

### 方法 5: 测试 DNS 解析

在 PowerShell 中运行：

```powershell
nslookup _mongodb._tcp.cluster0.bjbz8jy.mongodb.net
```

如果无法解析，说明是 DNS 问题。

---

## 🧪 快速测试

**尝试从浏览器访问 MongoDB Atlas：**
- https://cloud.mongodb.com

如果无法访问，说明是网络问题。

---

## 💡 常见原因

1. **网络连接问题：** 没有互联网连接
2. **DNS 问题：** DNS 服务器无法解析 MongoDB 的 SRV 记录
3. **防火墙阻止：** 防火墙阻止了 Node.js 的网络访问
4. **连接字符串错误：** 连接字符串中的域名不正确
5. **MongoDB Atlas 问题：** Cluster 可能已暂停或删除

---

## 🎯 下一步

1. **检查网络连接**
2. **从 MongoDB Atlas 获取正确的连接字符串**
3. **验证连接字符串格式**
4. **检查 MongoDB Atlas 网络访问设置**

一旦 DNS 问题解决，连接应该就能正常工作。
