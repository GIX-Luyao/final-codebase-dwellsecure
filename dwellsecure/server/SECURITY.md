# 安全说明

- **HTTPS**：前端到后端必须用 HTTPS（Render 默认提供）。`EXPO_PUBLIC_API_URL` 请使用 `https://...`。
- **后端到 Atlas**：使用 TLS（MongoDB Atlas 默认）。
- **密钥不进 GitHub**：`MONGO_URI`、`ADDRESS_ENCRYPTION_KEY` 等只放在 Render 环境变量中，不要写进代码或提交到仓库。
- **地址加密**：Property 的地址相关字段（address, addressLine1, addressLine2, city, state, zipCode, country）在写入数据库前由后端用 `ADDRESS_ENCRYPTION_KEY`（AES-256-GCM）加密，读取时在服务端解密后再返回给前端。密钥仅存在于服务器环境变量，前端不参与加解密。
- **不在前端做加密存 DB**：加密密钥若放在 Expo 应用里会被反编译获取，因此加解密只在后端进行。

## 前端显示地址是否会被“入侵”？

- 地址在**数据库里是密文**，泄露的是 DB 时看不到明文。
- 前端需要**显示**地址，所以 API 返回的是后端解密后的明文，经 HTTPS 传到已登录的客户端。这是业务必然：合法用户必须能看到自己的地址。
- 风险与缓解：
  - **未授权访问**：通过认证（登录态）限制只有本人能请求自己的 properties；API 应按用户做隔离（若当前未做，建议后续按 userId 过滤）。
  - **抓包**：HTTPS 可防止普通抓包看到明文；设备被 root/越狱或安装根证书时，本机流量可能被查看，与所有移动端应用相同。
  - **应用被反编译**：反编译只能拿到前端代码和配置，拿不到 `ADDRESS_ENCRYPTION_KEY`（仅在 Render 环境变量），也拿不到 MongoDB 连接串。

结论：地址存库加密 + 密钥仅在 Render + HTTPS，已满足“密钥不进 GitHub、后端加密存 DB”的要求；前端显示地址是正常需求，按用户做好认证与授权即可。

## 完全离线时

**当前实现**：离线或连不上服务器时，前端会回退到本地 **AsyncStorage**（`src/services/storage.js` 中在 API 失败或 `getApiAvailability()` 为 false 时走 `AsyncStorage.getItem`/`setItem`），数据以**明文 JSON** 存储，**没有**任何加密。

若设备**完全离线**、连不上服务器，应用使用的就是上述本地、不加密的存储。此时：

- 读不到服务器上的密钥（`ADDRESS_ENCRYPTION_KEY` 只在 Render 环境变量里，离线时根本连不上服务器）。
- 本地存的数据**没有**用该密钥加密；若设备丢失或被人物理/权限访问，本地数据库里的内容可能被直接读取。
- 云端（MongoDB）里的地址仍是密文，只有带密钥的后端能解密；离线端与云端是两套数据，安全边界不同。

如需在离线场景也保护本地数据，需要单独设计（例如用设备本机密钥做本地加密），与当前“仅后端加密存 DB”的方案是两回事。
