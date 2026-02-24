# 将 DwellSecure 部署到 AWS

本指南说明如何把 **后端 API** 和（可选）**Web 前端** 部署到 AWS。移动端 App 通过设置生产环境 API 地址连接已部署的后端。

---

## 架构概览

| 组件 | 部署方式 | 说明 |
|------|----------|------|
| **后端 API** (server/) | Elastic Beanstalk / ECS / EC2 | Node.js + Express，连接 MongoDB Atlas |
| **Web 版** (Expo web) | S3 + CloudFront | 静态站点，调用上述 API |
| **移动端** (iOS/Android) | Expo EAS 或应用商店 | 构建时设置 `EXPO_PUBLIC_API_URL` 指向 API 地址 |

---

## 一、前置条件

- AWS 账号，已安装 [AWS CLI](https://aws.amazon.com/cli/) 并配置好 `aws configure`
- MongoDB Atlas 集群（生产环境建议用环境变量 `MONGODB_URI`，不要用代码里的默认连接串）
- 本机已安装 Node.js 20+

---

## 二、部署后端 API

### 方式 A：Elastic Beanstalk（Node 平台，无需 Docker）

1. **安装 EB CLI**（若未安装）：
   ```bash
   pip install awsebcli
   ```

2. **在 server 目录初始化并创建环境**：
   ```bash
   cd server
   eb init -p node.js-20 dwellsecure-api --region ap-northeast-1
   eb create dwellsecure-api-env
   ```

3. **设置环境变量**（在 AWS 控制台 Elastic Beanstalk → 配置 → 软件 → 环境属性）：
   - `PORT` = `8080`（EB 默认用 8080，或保持 3000 并确保平台支持）
   - `MONGODB_URI` = 你的 MongoDB Atlas 连接串
   - `NODE_ENV` = `production`
   - 若有 Web 前端域名，可设 `CORS_ORIGIN` = `https://你的CloudFront或域名`

4. **部署更新**：
   ```bash
   cd server
   eb deploy
   ```

5. 记下 **API 根地址**，例如：`http://dwellsecure-api-env.xxx.ap-northeast-1.elasticbeanstalk.com`（若配置了 HTTPS，则为 `https://api.你的域名.com`）。

---

### 方式 B：Docker 部署（ECS Fargate 或 EC2）

1. **构建并推送镜像**（以 ECR 为例）：
   ```bash
   cd server
   aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.ap-northeast-1.amazonaws.com
   docker build -t dwellsecure-api .
   docker tag dwellsecure-api:latest YOUR_ACCOUNT.dkr.ecr.ap-northeast-1.amazonaws.com/dwellsecure-api:latest
   docker push YOUR_ACCOUNT.dkr.ecr.ap-northeast-1.amazonaws.com/dwellsecure-api:latest
   ```

2. **在 ECS 任务定义中配置环境变量**：`MONGODB_URI`、`PORT`（如 3000）、`CORS_ORIGIN`（可选）。

3. 将负载均衡器/ALB 的 80/443 指到该任务，得到 API 的对外地址。

---

### 方式 C：单机 EC2（Node 直接跑）

1. 启动一台 Amazon Linux 2 或 Ubuntu EC2，SSH 登录。
2. 安装 Node 20、克隆仓库或上传 `server/` 代码。
3. 在 `server/` 下执行：
   ```bash
   npm ci --only=production
   ```
4. 创建 `.env`（参考 `server/.env.example`），设置 `MONGODB_URI`、`PORT`、`CORS_ORIGIN`（可选）。
5. 用 systemd 或 pm2 运行：`node index.js`，并配置 Nginx 反向代理或安全组开放 3000 端口。

---

## 三、部署 Web 版（可选）

1. **导出 Web 静态资源**：
   ```bash
   # 在项目根目录，将 API 地址设为已部署的后端
   set EXPO_PUBLIC_API_URL=https://你的API域名
   npx expo export --platform web
   ```
   生成目录默认为 `dist/`。

2. **上传到 S3**：
   ```bash
   aws s3 sync dist s3://你的-bucket-name --delete
   ```

3. **配置 S3 为静态网站**，或使用 **CloudFront** 分发（推荐）：
   - 创建分配，Origin 指向上述 S3 bucket。
   - 默认根对象设为 `index.html`，错误页 404/403 可回退到 `index.html`（单页应用）。

4. 若 API 与 Web 不同域，在 **后端** 设置 `CORS_ORIGIN` 为你的 CloudFront 或 Web 域名（如 `https://xxx.cloudfront.net`）。

---

## 四、移动端 App 连接生产 API

- **开发/测试**：在启动 Expo 时设置 `EXPO_PUBLIC_API_URL`（如 `http://10.19.41.165:3000`）。
- **生产构建**（EAS Build 或 `expo build`）：
  - 在 EAS 的构建配置或 `.env.production` 中设置：
    ```bash
    EXPO_PUBLIC_API_URL=https://你的API域名
    ```
  - 这样打包出的 App 会请求你部署在 AWS 上的 API。

代码里生产环境已使用 `process.env.EXPO_PUBLIC_API_URL || 'https://your-api-domain.com'`，只要在构建时注入 `EXPO_PUBLIC_API_URL` 即可。

---

## 五、环境变量汇总

| 变量 | 位置 | 说明 |
|------|------|------|
| `MONGODB_URI` | 后端 server | MongoDB Atlas 连接串（生产务必使用，勿依赖代码默认值） |
| `PORT` | 后端 server | 监听端口，默认 3000；Elastic Beanstalk 常用 8080 |
| `CORS_ORIGIN` | 后端 server | 可选，逗号分隔的前端域名，限制 CORS |
| `EXPO_PUBLIC_API_URL` | 前端/构建时 | 生产 API 根地址，如 `https://api.你的域名.com` |

---

## 六、安全建议

- 生产环境 **不要** 在代码中写死 MongoDB 密码，一律使用 `MONGODB_URI` 环境变量。
- 为 API 配置 **HTTPS**（在 Elastic Beanstalk、ALB 或 CloudFront 上挂证书）。
- 在 MongoDB Atlas 中把 **IP 访问列表** 设为 `0.0.0.0/0`（仅限 Atlas 侧）或指定 AWS 出口 IP，确保后端能连上 Atlas。

完成以上步骤后，后端 API 在 AWS 运行，Web 与移动端通过 `EXPO_PUBLIC_API_URL` 指向该 API 即可使用。
