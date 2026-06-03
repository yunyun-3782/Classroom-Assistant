# 课堂小助手

一款专为课堂教学设计的桌面辅助工具，基于 Electron 22.3.27 开发，兼容 Windows 7 及以上系统。

## 功能特性

### 高效计时
- **倒计时**：支持 0-99 小时，可逐位调整
- **正计时**：从 0 开始计时
- **全屏模式**：计时数据铺满整个窗口，适合投影展示
- **记忆功能**：自动保存上次倒计时设置

### 随机摇号
- 可设置最大号码（默认 75）
- 支持 ±1 和 ±10 快速调整
- 设置自动保存
- 智能摇号，使得摇号更具有趣味

### 触摸屏友好
- 课堂小助手专门为触摸屏做了优化，无需键盘，点点就即刻完成操作


## 安装与运行

### 开发环境
```bash
# 安装依赖
npm install

# 启动应用
npm start
```

### 构建安装包
```bash
# 构建 Windows 安装包
npm run build:win
```

构建完成后，安装包位于 `dist` 目录。

## 配置文件

配置文件位置：`%APPDATA%\classroom-assistant\ca\memory.ini`

```ini
[Random]
MaxNumber=75

[Time]
LastSeconds=300
```

## 界面操作

- **无键盘设计**：所有操作均可通过鼠标/触屏完成
- **全屏按钮**：计时器右下角，点击后窗口最大化并铺满计时数据
- **模式互斥**：倒计时和正计时运行中/暂停时不可切换，需重置后切换

## 技术栈

- Electron 22.3.27
- 原生 HTML/CSS/JavaScript
- ini 配置文件解析

## 许可证

[CaelLab BY-SA Code License](https://git.caellab.com/yunyun/Classroom-Assistant/src/branch/main/LICENSE)
 