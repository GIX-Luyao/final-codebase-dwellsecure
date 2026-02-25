# Configuration

## `api.js` – DwellSecure 后端 API 配置

所有与 **本应用后端 API** 相关的配置集中在此（不含 Builder.io 等第三方）。

- **getApiBaseUrl()** / **API_BASE_URL**：根据 `__DEV__`、`Platform.OS`、`EXPO_PUBLIC_API_URL` 解析出的 base URL。
- **HEALTH_PATH**、**HEALTH_TIMEOUT_MS**：健康检查路径与超时。
- **API_ENDPOINTS**：后端路径常量（auth、shutoffs、utilities、reminders、properties）。

修改后端地址或路径时只需改此文件。`apiClient.js` 与 `AuthContext` 均从此处读取配置。

## `keys.js` – 第三方 API 密钥（可选/遗留）

发布时 **OpenAI 与 Mapbox 均由后端提供**，应用只需配置 `EXPO_PUBLIC_API_URL` 指向后端。  
`openai.js`、`geocode.js`、地图缩略图与 MapPicker 均通过后端代理，不在前端使用密钥。  
若仍有代码引用 `keys.js`，仅作兼容保留；新功能勿依赖前端环境变量中的密钥。
