@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 获取当前 bat 文件所在目录
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo =================================================
echo 当前目录: %cd%
echo =================================================

echo.
echo [1/5] 检查更改文件...
git status --short
echo.

echo [2/5] 显示文件差异统计...
git diff --stat
echo.

:: 修复：正确提取修改的文件名
set "fileList="
for /f "usebackq tokens=1,*" %%a in (`git status --short`) do (
    set "filename=%%b"
    if not "!filename!"=="" (
        if "!fileList!"=="" (
            set "fileList=!filename!"
        ) else (
            set "fileList=!fileList! !filename!"
        )
    )
)

:: 询问用户输入
set /p userInput="请输入提交摘要（直接回车则自动生成）: "

:: 如果用户有输入，使用用户输入；否则自动生成
if not "%userInput%"=="" (
    set "commitTitle=%userInput%"
    set "commitBody="
) else (
    if "!fileList!"=="" (
        echo.
        echo 没有检测到任何文件更改。
        echo 可能的情况：
        echo   1. 所有修改已经提交过了
        echo   2. 确实没有修改任何文件
        echo.
        pause
        exit /b
    )
    set "autoMsg=更新 !fileList!"
    
    :: 截断逻辑：标题最多50字符
    set "commitTitle=!autoMsg!"
    set "commitBody="
    if not "!commitTitle:~50!"=="" (
        set "commitTitle=!autoMsg:~0,50!"
        set "commitBody=!autoMsg!"
    )
)

echo.
echo [3/5] 添加所有更改...
git add .

echo.
echo [4/5] 提交到本地仓库...
if "!commitBody!"=="" (
    git commit -m "!commitTitle!"
) else (
    git commit -m "!commitTitle!" -m "!commitBody!"
)

:: 检查提交是否成功
if %errorlevel% neq 0 (
    echo.
    echo 提交失败，没有需要提交的更改。
    pause
    exit /b
)

echo.
echo [5/5] 推送到远程服务器...
git push

:: 检查推送是否成功
if %errorlevel% neq 0 (
    echo.
    echo 推送失败，请检查网络连接或远程仓库状态。
    pause
    exit /b
)

echo.
echo 完成！
pause