# 🧪 集成测试用例数据

## 📋 测试用例数据说明

### Test Case 1: Water Shutoff

**ID:** `test-water-shutoff-001`

**数据：**
```json
{
  "id": "test-water-shutoff-001",
  "type": "water",
  "description": "Main water shutoff valve located in basement utility room",
  "location": "Basement Utility Room, Near Water Heater",
  "verification_status": "verified",
  "notes": "Test Case 1: User requests water shutoff - Expected: backend returns water shutoff info",
  "contacts": [
    {
      "name": "Plumber John",
      "phone": "555-0101",
      "role": "Emergency Plumber"
    }
  ],
  "photos": [],
  "videos": [],
  "maintenanceDate": "2024-03-15T00:00:00.000Z",
  "maintenanceTime": "2024-03-15T10:00:00.000Z",
  "createdAt": "2024-01-15T08:30:00.000Z",
  "updatedAt": "2024-01-20T14:22:00.000Z"
}
```

**预期结果：** 后端返回 water shutoff 信息，UI 正确显示

---

### Test Case 2: Gas Shutoff

**ID:** `test-gas-shutoff-002`

**数据：**
```json
{
  "id": "test-gas-shutoff-002",
  "type": "gas",
  "description": "Main gas shutoff valve located outside near meter",
  "location": "Exterior Wall, Near Gas Meter",
  "verification_status": "verified",
  "notes": "Test Case 2: User requests gas shutoff - Expected: correct gas data returned",
  "contacts": [
    {
      "name": "Gas Company Emergency",
      "phone": "555-0202",
      "role": "Gas Utility Provider"
    },
    {
      "name": "HVAC Technician",
      "phone": "555-0303",
      "role": "Certified Gas Technician"
    }
  ],
  "photos": [],
  "videos": [],
  "maintenanceDate": "2024-04-20T00:00:00.000Z",
  "maintenanceTime": "2024-04-20T09:00:00.000Z",
  "createdAt": "2024-02-10T11:15:00.000Z",
  "updatedAt": "2024-02-18T16:45:00.000Z"
}
```

**预期结果：** 后端返回正确的 gas 数据，应用不崩溃，正确显示 utility

---

### Test Case 3: Missing/Incomplete Data

**ID:** `test-incomplete-shutoff-003`

**数据：**
```json
{
  "id": "test-incomplete-shutoff-003",
  "type": "electric",
  "verification_status": "unverified",
  "notes": "Test Case 3: Missing data in database - Expected: app shows fallback message",
  "createdAt": "2024-03-01T12:00:00.000Z",
  "updatedAt": "2024-03-01T12:00:00.000Z"
}
```

**注意：** 这个记录缺少 `description` 和 `location` 字段

**预期结果：** 应用显示 fallback 消息，不崩溃

---

## 🚀 添加数据的方法

### 方法 1: 使用脚本（推荐）

**等待 MongoDB 连接恢复后，运行：**

```bash
cd server
node add-test-data.js
```

---

### 方法 2: 通过 API 添加（如果服务器正在运行）

**PowerShell:**

```powershell
# Test Case 1: Water Shutoff
$waterShutoff = @{
    id = "test-water-shutoff-001"
    type = "water"
    description = "Main water shutoff valve located in basement utility room"
    location = "Basement Utility Room, Near Water Heater"
    verification_status = "verified"
    notes = "Test Case 1: User requests water shutoff - Expected: backend returns water shutoff info"
    contacts = @(
        @{
            name = "Plumber John"
            phone = "555-0101"
            role = "Emergency Plumber"
        }
    )
    photos = @()
    videos = @()
    maintenanceDate = "2024-03-15T00:00:00.000Z"
    maintenanceTime = "2024-03-15T10:00:00.000Z"
    createdAt = "2024-01-15T08:30:00.000Z"
    updatedAt = "2024-01-20T14:22:00.000Z"
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri http://localhost:3000/api/shutoffs -Method POST -ContentType "application/json" -Body $waterShutoff

# Test Case 2: Gas Shutoff
$gasShutoff = @{
    id = "test-gas-shutoff-002"
    type = "gas"
    description = "Main gas shutoff valve located outside near meter"
    location = "Exterior Wall, Near Gas Meter"
    verification_status = "verified"
    notes = "Test Case 2: User requests gas shutoff - Expected: correct gas data returned"
    contacts = @(
        @{
            name = "Gas Company Emergency"
            phone = "555-0202"
            role = "Gas Utility Provider"
        },
        @{
            name = "HVAC Technician"
            phone = "555-0303"
            role = "Certified Gas Technician"
        }
    )
    photos = @()
    videos = @()
    maintenanceDate = "2024-04-20T00:00:00.000Z"
    maintenanceTime = "2024-04-20T09:00:00.000Z"
    createdAt = "2024-02-10T11:15:00.000Z"
    updatedAt = "2024-02-18T16:45:00.000Z"
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri http://localhost:3000/api/shutoffs -Method POST -ContentType "application/json" -Body $gasShutoff

# Test Case 3: Incomplete Shutoff
$incompleteShutoff = @{
    id = "test-incomplete-shutoff-003"
    type = "electric"
    verification_status = "unverified"
    notes = "Test Case 3: Missing data in database - Expected: app shows fallback message"
    createdAt = "2024-03-01T12:00:00.000Z"
    updatedAt = "2024-03-01T12:00:00.000Z"
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri http://localhost:3000/api/shutoffs -Method POST -ContentType "application/json" -Body $incompleteShutoff
```

---

### 方法 3: 在 MongoDB Atlas 中手动添加

1. **访问 https://cloud.mongodb.com**
2. **Browse Collections → `dwellsecure` → `shutoffs`**
3. **点击 "Insert Document"**
4. **复制上面的 JSON 数据**
5. **粘贴并保存**

---

## 🧪 测试步骤

### Test Case 1: Water Shutoff

1. **在应用中搜索或查看 shutoff ID: `test-water-shutoff-001`**
2. **预期：** 显示完整的 water shutoff 信息
3. **验证：** UI 正确显示 description, location, contacts 等

---

### Test Case 2: Gas Shutoff

1. **在应用中搜索或查看 shutoff ID: `test-gas-shutoff-002`**
2. **预期：** 显示完整的 gas shutoff 信息
3. **验证：** 应用不崩溃，正确显示 gas utility

---

### Test Case 3: Missing Data

1. **在应用中搜索或查看 shutoff ID: `test-incomplete-shutoff-003`**
2. **预期：** 应用显示 fallback 消息（例如 "No description available"）
3. **验证：** 应用不崩溃，优雅处理缺失数据

---

## 📊 数据时间戳说明

- **Test Case 1:** Created: 2024-01-15, Updated: 2024-01-20
- **Test Case 2:** Created: 2024-02-10, Updated: 2024-02-18
- **Test Case 3:** Created: 2024-03-01, Updated: 2024-03-01

所有时间戳都是合理的，符合测试场景的时间顺序。

---

## 💡 提示

- **如果 MongoDB 连接失败：** 等待连接恢复后运行脚本
- **如果服务器正在运行：** 使用方法 2（通过 API）添加数据
- **如果都不行：** 使用方法 3（在 MongoDB Atlas 中手动添加）

---

## 🎯 验证数据

**添加数据后，运行：**

```bash
cd server
node check-current-data.js
```

**应该能看到所有三个测试用例的数据！**
