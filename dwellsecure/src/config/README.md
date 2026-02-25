# Configuration

## `api.js` – DwellSecure 后端 API 配置

所有与 **本应用后端 API** 相关的配置集中在此（不含 Builder.io 等第三方）。

- **getApiBaseUrl()** / **API_BASE_URL**：根据 `__DEV__`、`Platform.OS`、`EXPO_PUBLIC_API_URL` 解析出的 base URL。
- **HEALTH_PATH**、**HEALTH_TIMEOUT_MS**：健康检查路径与超时。
- **API_ENDPOINTS**：后端路径常量（auth、shutoffs、utilities、reminders、properties）。

修改后端地址或路径时只需改此文件。`apiClient.js` 与 `AuthContext` 均从此处读取配置。

## `keys.js` – 第三方 API 密钥（前端）

- **OpenAI**：`EXPO_PUBLIC_OPENAI_API_KEY`，`OPENAI_CHAT_URL`。
- **Mapbox**：`EXPO_PUBLIC_MAPBOX_TOKEN`，`MAPBOX_ACCESS_TOKEN`（地图/地理编码）。

`openai.js`、`geocode.js` 以及使用地图的页面均从 `keys.js` 读取，不在业务代码中硬编码密钥。
