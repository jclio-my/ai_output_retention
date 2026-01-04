---
title: "Linux Mint 优化"
date: "2026-01-04"
---


# Linux Mint 优化

## 前言
*   **目标**：在保证系统稳定的前提下，大幅降低延迟、提升桌面响应速度（跟手感）并缩短开机时间。
*   **适用环境**：Linux Mint + rEFInd 引导, Ryzen 5600X + RX6650XT+ NVME 32GB RAM+

---



## 第一阶段：BIOS 设置 (硬件层)

在进入系统前，确保硬件功能已完全释放。

1.  **开启 Resizable BAR (Re-Bar)**
    *   **作用**：让 CPU 能一次性访问显卡的所有显存，提升游戏帧数 (5%-15%)。
    *   **操作**：重启进入 BIOS，找到并开启以下两项：
        *   `Above 4G Decoding` -> **Enabled**
        *   `Re-Size BAR Support` -> **Enabled**
    *   *验证方法*：进入系统后终端执行 `dmesg | grep "BAR="`，若看到类似 `BAR=8192M` 即成功。

---

## 第二阶段：文件系统优化 (Btrfs)

针对你的 NVMe SSD 和 Btrfs 分区进行性能与寿命优化。

### 1. 修改挂载参数 (`/etc/fstab`)
这将开启透明压缩（提升读取速度、减少写入）和异步修剪（防止删除文件时卡顿）。

1.  **备份配置文件**：
    
    ```bash
    sudo cp /etc/fstab /etc/fstab.bak
    ```
2.  **编辑文件**：
    
    ```bash
    sudo nano /etc/fstab
    ```
3.  **替换内容**：找到挂载 `/` 和 `/home` 的行，将其参数部分修改如下（保留 UUID 不变）：

    *   **根分区 (`/`)**：
        ```text
        UUID=... /  btrfs  rw,noatime,compress=zstd:1,space_cache=v2,discard=async,subvol=@ 0 1
        ```
    *   **Home分区 (`/home`)**：
        ```text
        UUID=... /home  btrfs  rw,noatime,compress=zstd:1,space_cache=v2,discard=async,subvol=@home 0 2
        ```
4.  **应用更改**：
    
    ```bash
    sudo mount -o remount /
    sudo mount -o remount /home
    ```

### 2. 启用自动维护
防止 Btrfs 长期使用后变慢。
```bash
sudo apt install btrfsmaintenance
sudo systemctl enable --now btrfsmaintenance-refresh
```

---

## 第三阶段：内核启动参数 (rEFInd 引导)

这是提升系统响应速度的核心。由于你使用 rEFInd，我们需要直接编辑其配置文件，而不是 GRUB。

### 目标参数
*   `preempt=full`：**强制完全抢占模式**。极大降低系统延迟，让操作更丝滑。
*   `amd_pstate=active`：启用 AMD 新一代 CPU 驱动，提升能效和响应。

### 操作步骤
1.  **编辑 rEFInd 配置文件**：
    ```bash
    sudo nano /boot/refind_linux.conf
    ```
2.  **修改/新建内容**：确保文件内容如下（第一行作为默认启动项）：
    ```ini
    "Boot with Opts"  "quiet splash preempt=full amd_pstate=active"
    "Boot Safe"       "quiet splash"
    "Boot Fallback"   "ro recovery nomodeset"
    ```
3.  **保存**：`Ctrl+O` 保存，`Ctrl+X` 退出。
4.  **验证**：重启后执行 `cat /proc/cmdline`，确保输出包含上述参数。

---

## 第四阶段：系统内核参数调优 (Sysctl)

合并网络、内存、I/O 的优化设置到一个文件中。

1.  **创建配置文件**：
    ```bash
    sudo nano /etc/sysctl.d/99-mint-optimization.conf
    ```
2.  **粘贴以下所有内容**：
    
    ```ini
    # --- 网络优化 (开启 BBR) ---
    # 提升网络吞吐量，改善网页加载和视频播放
    net.core.default_qdisc = fq
    net.ipv4.tcp_congestion_control = bbr
    
    # --- 内存与脏页优化 (针对 32GB 内存) ---
    # 降低使用 Swap 的倾向，优先用物理内存
    vm.swappiness = 10
    # 增加 VFS 缓存保留目录结构的倾向，加快文件浏览
    vm.vfs_cache_pressure = 50
    # 优化脏数据回写，避免大数据拷贝时系统卡死
    # 32GB 内存下，限制脏数据堆积量
    vm.dirty_ratio = 10
    vm.dirty_background_ratio = 5
    
    # --- 内核调试 ---
    # 禁用非屏蔽中断看门狗，减少微小中断，略微省电
    kernel.nmi_watchdog = 0
    ```
3.  **应用配置**：
    ```bash
    sudo sysctl -p /etc/sysctl.d/99-mint-optimization.conf
    ```

---

## 第五阶段：服务与启动速度优化

砍掉无用的等待时间，让开机直达桌面。

### 1. 消除最大瓶颈 (节省约 7秒)
禁止系统开机傻等网络连接。
```bash
sudo systemctl disable NetworkManager-wait-online.service
```

### 2. Docker 优化 (按需启动)
平时不占用资源，只有在终端输入 `docker` 命令时才瞬间激活。
```bash
sudo systemctl disable docker.service
sudo systemctl enable docker.socket
```

### 3. 移除星火商店的升级服务提示
```bash
sudo systemctl disable spark-update-notifier.service
```

---

## 验证与总结

完成以上所有步骤后，请**重启电脑**。

### 验证清单
1.  **启动速度**：运行 `systemd-analyze`，查看 Boot 时间是否明显缩短。
2.  **内核模式**：运行 `dmesg | grep "preempt:"`，应显示 `Dynamic Preempt: full` 或类似信息。
3.  **AMD 驱动**：运行 `cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_driver`，应输出 `amd-pstate-epp`。
4.  **BBR 算法**：运行 `sysctl net.ipv4.tcp_congestion_control`，应输出 `bbr`。
