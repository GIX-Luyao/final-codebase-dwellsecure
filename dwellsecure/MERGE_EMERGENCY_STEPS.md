# 把 yushi 的 EmergencyModeScreen.js 合并到 main（之前版本）

当前情况：
- **main** = 你“三个指令前”的版本（commit 0212）
- **yushi** = 新分支，含更新后的所有文件
- 目标：让 **main** 拥有「之前版本的所有文件 + yushi 的 EmergencyModeScreen.js」

---

## 在终端执行（在项目根目录 `psdwell` 下）

```powershell
# 1. 进入仓库根目录（不是 dwellsecure，是上一级 psdwell）
cd C:\Users\dbcsy\Documents\Github\psdwell

# 2. 切到 main（回到“之前”的版本）
git checkout main

# 3. 只把 yushi 的 EmergencyModeScreen.js 拿过来（其它文件保持 main 的）
git checkout yushi -- dwellsecure/src/screens/EmergencyModeScreen.js

# 4. 查看状态（应显示该文件被修改）
git status

# 5. 提交
git add dwellsecure/src/screens/EmergencyModeScreen.js
git commit -m "Merge EmergencyModeScreen.js from yushi"
```

完成后：
- **main** = 之前版本 + 只有 EmergencyModeScreen.js 来自 yushi
- 若想继续在“带这份 EmergencyModeScreen 的 main”上开发，就留在 main；若要回到 yushi，再执行：`git checkout yushi`
