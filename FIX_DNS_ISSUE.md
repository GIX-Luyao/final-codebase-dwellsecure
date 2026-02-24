# 🔧 修复 DNS 解析问题

## ❌ 当前问题

所有连接格式都失败，错误都是：
```
querySrv ENOTFOUND _mongodb._tcp.cluster0.bjbz8jy.mongodb.net
```

**这是 DNS 解析问题，不是连接字符串格式问题。**

---

## ✅ 解决方案

### 方法 1: 更改 DNS 服务器（推荐）

**Windows:**

1. 打开 **"设置"** → **"网络和 Internet"** → **"更改适配器选项"**
2. 右键点击你的网络连接 → **"属性"**
3. 选择 **"Internet 协议版本 4 (TCP/IPv4)"** → **"属性"**
4. 选择 **"使用下面的 DNS 服务器地址"**
5. 输入：
   - **首选 DNS 服务器**: `8.8.8.8` (Google DNS)
   - **备用 DNS 服务器**: `8.8.4.4` (Google DNS)
6. 点击 **"确定"**
7. **重启电脑**或运行 `ipconfig /flushdns` 在 PowerShell

**然后重新测试连接。**

---

### 方法 2: 刷新 DNS 缓存

在 PowerShell（以管理员身份运行）中：

```powershell
ipconfig /flushdns
```

然后重新测试。

---

### 方法 3: 测试 DNS 解析

在 PowerShell 中运行：

```powershell
nslookup _mongodb._tcp.cluster0.bjbz8jy.mongodb.net
```

**如果无法解析，说明是 DNS 问题。**

**如果能够解析，应该看到类似：**
```
_mongodb._tcp.cluster0.bjbz8jy.mongodb.net    SRV service location:
          priority       = 0
          weight         = 0
          port           = 27017
          svr hostname   = cluster0-shard-00-00.xxxxx.mongodb.net
```

---

### 方法 4: 检查防火墙

1. 打开 **"Windows Defender 防火墙"**
2. 检查是否阻止了 Node.js
3. 临时禁用防火墙测试（仅用于测试）

---

### 方法 5: 验证连接字符串域名

**从 MongoDB Atlas 获取连接字符串：**

1. 访问 https://cloud.mongodb.com
2. 点击 **"Connect"** → **"Connect your application"**
3. 复制完整的连接字符串
4. **确认域名是否正确**

连接字符串应该类似：
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/...
```

**注意：** 域名可能不是 `cluster0.bjbz8jy.mongodb.net`，可能是其他格式。

---

### 方法 6: 使用 VPN 或不同网络

如果以上方法都不行，可能是你的网络提供商阻止了某些 DNS 查询。尝试：
- 使用 VPN
- 使用手机热点
- 使用不同的网络

---

## 🧪 测试步骤

1. **更改 DNS 服务器**（方法 1）
2. **刷新 DNS 缓存**（方法 2）
3. **测试 DNS 解析**（方法 3）
4. **重新运行测试：**
   ```bash
   cd server
   node test-connection-simple.js
   ```

---

## 💡 如果仍然失败

**请提供：**

1. `nslookup _mongodb._tcp.cluster0.bjbz8jy.mongodb.net` 的输出是什么？
2. 你能从 MongoDB Atlas 获取连接字符串吗？域名是什么？
3. 你使用的是什么网络？（家庭网络、公司网络、VPN 等）
4. 你能访问 https://cloud.mongodb.com 吗？

---

## 🎯 快速检查

**在浏览器中测试：**

访问：
```
https://cluster0.bjbz8jy.mongodb.net
```

如果无法访问，说明域名可能不正确，或者网络有问题。
