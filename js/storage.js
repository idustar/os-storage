/**
 * Created by dustar on 2017/5/18.
 * Storage.js
 * Storage类
 */
class Storage {
    constructor(firstFit) {
        this.capacity = g.capacity // 内存容量
        this.queue = [] // 请求序列
        this.isAllocated = Array(10).fill(false) // 是否被分配，默认值false
        this.orders = [] // 内存中的进程表
        // { id, top, bottom }
        this.auto = false // 是否自动模式中
        this.remain = this.capacity // 内存剩余空间
        this.buildQueue()
    }

    // 随机生成请求序列
    buildQueue() {
        // 每个id分别添加两次。第一次为被分配，第二次为被释放。
        for (let i = 0; i < g.blocksCount; i++) {
            this.queue.push(i, i)
        }
        // 打乱序列
        this.queue.sort((a, b) => {
            return 0.5 - Math.random()
        })
        sendMessage('生成请求队列成功。', 'fa fa-signal', '#00811b')
    }

    // 自动模式
    autoRun(firstFit = true) {
        this.auto = true
        // 设置按钮
        $('.btn-do').attr('disabled', 'disabled')
        $('#btn-stop').css('display', 'block')
        this.nextTick(firstFit, true)
        // 循环执行单步指令
        this.flag = setInterval(() => {
            if (!this.nextTick(firstFit, true))
                this.stopAutoRun()
        }, 1500)
    }

    // 停止自动模式
    stopAutoRun() {
        this.auto = false
        window.clearInterval(this.flag)
        if (this.queue.length !== 0)
            $('.btn-do').attr('disabled', false)
        $('#btn-stop').css('display', 'none')
    }

    // 单步指令
    // firstFit：true 首先适应算法，false 最佳适应算法
    // isAuto： true 由自动模式驱动执行，false 人工单步执行
    nextTick(firstFit = true, isAuto = false) {
        let offset = 0 // 偏移值，默认为0（表示队头元素），当队头进程不能被分配时，右移处理下一请求
        this.fitAlgorithm = firstFit ? this.firstFit : this.bestFit
        // 若序列为空，则执行完毕
        if (this.queue.length === 0) {
            sendMessage('请求序列执行完毕。', 'fa fa-check-square', 'green')
            $('.btn-do').attr('disabled', 'disabled')
            return false
        }
        if (!isAuto && this.auto)
            return true
        while (offset < this.queue.length) {
            let now = this.queue[offset] // 当前处理的进程id
            if (this.isAllocated[now]) {
                // 释放
                this.removeFromOrders(now)
                this.isAllocated[now] = false
                sendMessage('进程 ' + now + ' ( ' + g.blocks[now] + ' KB ) 已被释放。', "fa fa-unlock", g.color[now % 20])
                this.remain += g.blocks[now]
                this.refreshUI(false, {
                    id: now
                })
                this.queue.splice(offset, 1)
                return true
            } else {
                // 分配
                if (this.orders.length === 0) {
                    // 处理空内存
                    this.allocate(now, 0)
                    this.queue.splice(offset, 1)
                    return true
                } else {
                    if (this.fitAlgorithm(now)) {
                        this.queue.splice(offset, 1)
                        return true
                    }
                }
            }
            offset++
        }
        return true
    }

    // 首先适应算法
    firstFit(now) {
        // 处理内存头部
        if (this.orders[0].top >= g.blocks[now]) {
            this.allocate(now, 0)
            return true
        }
        // 处理两个内存块之间
        for (let i = 1; i < this.orders.length; i++) {
            if (this.orders[i].top - this.orders[i - 1].bottom - 1 >= g.blocks[now]) {
                this.allocate(now, this.orders[i - 1].bottom + 1)
                return true
            }
        }
        // 处理内存尾部
        if (this.capacity - this.orders[this.orders.length - 1].bottom - 1 >= g.blocks[now]) {
            this.allocate(now, this.orders[this.orders.length - 1].bottom + 1)
            return true
        }
        return false
    }

    bestFit(now) {
        // min 最小的适应区间 pointer 指向目标内存块的起始地址，默认值为-1
        var min = g.capacity + 1
        var pointer = -1
        if (this.orders[0].top >= g.blocks[now] && this.orders[0].top < min) {
            min = this.orders[0].top
            pointer = 0
        }
        for (let i = 1; i < this.orders.length; i++) {
            let distance = this.orders[i].top - this.orders[i - 1].bottom - 1
            if (distance >= g.blocks[now] && distance < min) {
                min = distance
                pointer = this.orders[i - 1].bottom + 1
            }
        }
        let distance = this.capacity - this.orders[this.orders.length - 1].bottom - 1
        if (distance >= g.blocks[now] && distance < min) {
            min = distance
            pointer = this.orders[this.orders.length - 1].bottom + 1
        }
        if (pointer !== -1) {
            this.allocate(now, pointer)
            return true
        } else
            return false
    }

    // 分配函数
    allocate(id, location) {
        this.orders.push({
            id: id,
            top: location,
            bottom: location + g.blocks[id] - 1
        })
        this.isAllocated[id] = true
        sendMessage('进程 ' + id + ' ( ' + g.blocks[id] + ' KB ) 已分配内存空间 ' + location + ' - ' +
            parseInt(location + g.blocks[id] - 1) + '。', "fa fa-star", g.color[id % 20])
        this.remain -= g.blocks[id]
        this.refreshUI(true, {
            id: id,
            top: location,
            height: g.blocks[id]
        })
        this.refresh()
    }

    // 刷新内存中的进程表，使其按进程起始地址升序排列
    refresh() {
        this.orders.sort((a, b) => {
            return a.top > b.top ? 1 : -1
        })
    }

    // 刷新视图
    refreshUI(add = true, attr) {
        // 刷新实时面板
        $('#all').fadeOut(300, () => {
            $('#all').text(this.remain)
        })
        $('#all').fadeIn(300)
        $('#remain').fadeOut(300, () => {
            $('#remain').text(this.queue.length - 1)
        })
        $('#remain').fadeIn(300)
        if (add) {
            // 分配内存块动画
            let father = $('#storage')
            let heightFather = father.height()
            let topFather = father.position().top
            let top = topFather + attr.top / g.capacity * heightFather
            let height = attr.height / g.capacity * heightFather
            console.log(top, height)
            let block = '<div id="storage-block-' + attr.id + '" class="storage-block"' +
                'style="top: ' + top + 'px; height: ' + height + 'px; background: ' +
                g.color[attr.id % 20] + '; display: none">&nbsp;</div>'
            father.append(block)
            $('#storage-block-' + attr.id).slideDown(1000)
        } else
        // 释放内存块动画
            $('#storage-block-' + attr.id).slideUp(1000, () => {
                $("#storage-block-" + attr.id).remove();
            })

    }

    // 从内存中移除指定id进程函数
    removeFromOrders(id) {
        for (let i = 0; i < this.orders.length; i++) {
            if (this.orders[i].id === id) {
                this.orders.splice(i, 1);
                break;
            }
        }
    }
}