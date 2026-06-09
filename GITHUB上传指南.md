# 留传项目 - GitHub 上传指南

## 方法一：使用 GitHub 网页直接上传（推荐小白）

### 步骤 1：在 GitHub 创建新仓库
1. 打开 https://github.com
2. 登录你的账号
3. 点击右上角 `+` 号 → `New repository`
4. 填写信息：
   - Repository name: `liuchuan-memoir`（或你喜欢的名字）
   - Description: `留传 - 数字家庭回忆录平台`
   - 选择 `Public`（公开）或 `Private`（私有）
   - 勾选 `Add a README file`
   - 点击 `Create repository`

### 步骤 2：下载项目文件
由于你在沙箱环境开发，需要先将项目文件下载到本地：

1. 在沙箱中点击左侧文件树的下载按钮，或联系管理员导出项目
2. 将文件解压到电脑上的一个文件夹，比如 `D:\liuchuan-memoir`

### 步骤 3：上传到 GitHub
1. 进入你刚创建的 GitHub 仓库页面
2. 点击 `Add file` → `Upload files`
3. 将本地项目文件夹中的所有文件拖拽到上传区域
4. 填写提交信息：`Initial commit`
5. 点击 `Commit changes`

---

## 方法二：使用 GitHub Desktop（图形化工具）

### 步骤 1：下载 GitHub Desktop
1. 访问 https://desktop.github.com/
2. 下载并安装 GitHub Desktop

### 步骤 2：配置并上传
1. 打开 GitHub Desktop，登录你的 GitHub 账号
2. 点击 `File` → `New repository`
3. 填写：
   - Name: `liuchuan-memoir`
   - Local path: 选择你要存放的文件夹
4. 将项目文件复制到这个文件夹
5. 在 GitHub Desktop 中填写提交信息，点击 `Commit to main`
6. 点击 `Publish repository` 上传到 GitHub

---

## 方法三：使用 Git 命令行（进阶）

如果你已经安装了 Git，可以使用以下命令：

```bash
# 进入项目文件夹
cd liuchuan-memoir

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/liuchuan-memoir.git

# 上传
git push -u origin main
```

---

## 项目文件结构说明

上传时请确保包含以下文件和文件夹：

```
liuchuan-memoir/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── pages/              # 页面组件
│   ├── services/           # API 服务
│   ├── hooks/              # 自定义 Hooks
│   ├── supabase/           # Supabase 客户端
│   └── styles/             # 样式文件
├── functions/              # Edge Functions
│   ├── ai-polish/          # AI 润色功能
│   ├── generate-pdf/       # PDF 生成功能
│   ├── payment/            # 支付功能
│   ├── send-sms/           # 短信验证码
│   └── speech-to-text/     # 语音识别
├── migrations/             # 数据库迁移文件
├── outputs/                # 项目文档
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # Tailwind 配置
├── webpack.config.js       # Webpack 配置
└── README.md               # 项目说明
```

---

## 重要提醒

### ⚠️ 敏感信息处理
上传前请检查以下文件是否包含敏感信息：

1. **src/supabase/client.ts** - 包含 Supabase URL 和匿名密钥
   - 这些是公开的客户端配置，可以上传
   - 但 `SUPABASE_SERVICE_ROLE_KEY` 是服务端密钥，**绝对不能上传**

2. **functions/** 目录下的 Edge Functions
   - 它们使用环境变量读取敏感信息，代码本身是安全的
   - 环境变量在云端配置，不会泄露

### ✅ 可以安全上传的文件
- 所有源代码（src/、functions/）
- 配置文件（不含敏感密钥）
- 文档和说明
- 迁移文件

### ❌ 不要上传的文件
- node_modules/ 文件夹（依赖，可通过 npm install 安装）
- dist/ 文件夹（构建产物）
- .env 文件（包含环境变量）
- 任何包含密码、密钥的文件

---

## 上传后的操作

### 1. 添加项目说明（README.md）
在 GitHub 仓库页面点击 `Add a README`，添加以下内容：

```markdown
# 留传 - 数字家庭回忆录平台

帮助长辈用语音记录人生故事，AI 自动润色成文，生成精美 PDF 回忆录。

## 功能特性
- 🎙️ 语音录制转文字
- ✨ AI 智能润色
- 📖 精美 PDF 生成
- 💳 微信支付集成
- 📱 短信验证码登录
- 👤 用户中心管理

## 技术栈
- React + TypeScript
- Tailwind CSS
- Supabase (数据库、认证、存储)
- Meoo Cloud Edge Functions

## 本地开发
```bash
pnpm install
pnpm run dev
```

## 部署
项目已配置 Meoo Cloud 云服务，支持一键部署。
```

### 2. 创建 .gitignore 文件
在仓库根目录创建 `.gitignore` 文件，内容如下：

```
# 依赖
node_modules/
.pnpm-store/

# 构建产物
dist/
build/

# 环境变量
.env
.env.local

# 日志
*.log
npm-debug.log*

# 编辑器
.vscode/
.idea/
*.swp

# 系统文件
.DS_Store
Thumbs.db
```

### 3. 添加开源许可证（可选）
点击 `Add file` → `Create new file`，命名为 `LICENSE`
选择 MIT License 或其他你喜欢的许可证

---

## 常见问题

### Q: 上传后代码能运行吗？
A: 代码上传到 GitHub 只是存储源代码，要在本地运行需要：
1. 克隆仓库到本地
2. 运行 `pnpm install` 安装依赖
3. 配置环境变量
4. 运行 `pnpm run dev`

### Q: 如何更新代码？
A: 修改代码后，在 GitHub Desktop 中：
1. 填写提交信息
2. 点击 `Commit to main`
3. 点击 `Push origin`

或者网页版：
1. 点击 `Add file` → `Upload files`
2. 上传修改后的文件
3. 勾选 `Commit directly to the main branch`

### Q: 可以多人协作吗？
A: 可以！在仓库设置中添加 Collaborators，邀请其他 GitHub 用户协作开发。

---

## 需要帮助？

如果在上传过程中遇到问题：
1. 查看 GitHub 官方文档：https://docs.github.com
2. 搜索错误信息，通常能找到解决方案
3. 联系项目开发者寻求帮助

祝上传顺利！🎉
