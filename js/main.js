/**
 * Created by dustar on 2017/5/17.
 */
// 全局变量
var g = {
    capacity: 640,
    blocksCount: 30,
    maxProcess: 320,
    blocks: [],
    color: ['#0099ff', '#3300ff', '#f200ff', '#00e1ff', '#b30740', '#00ff66', '#525252', '#7bbd00', '#674ea7', '#4a86e8',
        '#ff6f00', '#c4ff00', '#fa89d6', '#24700b', '#01547a', '#7f6000', '#a64d79', '#ff0000', '#76a5af', '#ffd966'
    ]
}

$(document).ready(function () {
    sendMessage('这是杜佳豪(1552652)的操作系统项目 —— 内存管理', 'fa fa-mortar-board', '#b30470')
})

// 生成函数
// 仅当用户点击"生成"按钮执行
function init() {
    if (check()) {
        initBlocks(g.blocksCount)
        g.st = new Storage(true)
        $('#all').text(g.st.remain)
        $('#remain').text(g.st.queue.length)
    }

}

// 自定义属性检查函数
// 满足 5 <= 进程数 <= 100，默认值 30
// 300 <= 内存容量 <= 1200，默认值 640
// 150 <= 最大进程 <= 内存容量/1.67，默认值 320
function check() {
    let blocksCount = parseInt($('#processCount').val())
    let capacity = parseInt($('#capacity').val())
    let maxProcess = parseInt($('#maxProcess').val())
    if (!(!isNaN(blocksCount) && blocksCount <= 100 && blocksCount >= 5)) {
        sendMessage('进程数取自 5 - 100 之间，请返回修改。', 'fa fa-close', 'red')
        return false
    }
    if (!(!isNaN(capacity) && capacity <= 1200 && capacity >= 300)) {
        sendMessage('内存容量取自 300 - 1200 之间，请返回修改。', 'fa fa-close', 'red')
        return false
    }
    if (capacity / 1.67 + 1 <= maxProcess) {
        sendMessage('为保证试验质量，进程大小应低于内存容量的2/3，请返回修改。', 'fa fa-close', 'red')
        return false
    }
    if (!isNaN(maxProcess) && !(maxProcess <= 800 && maxProcess >= 150)) {
        sendMessage('进程最大容量取自 150 - 800 之间，请返回修改。', 'fa fa-close', 'red')
        return false
    }

    g.capacity = capacity
    g.maxProcess = maxProcess
    g.blocksCount = blocksCount
    // 隐藏自定义属性面板，显示实时面板
    $('#setting-panel').slideUp(1000, () => {
        $('#work-panel').show(1000)
    })
    $('.btn-do').attr('disabled', false)
    return true;

}

// 随机生成进程（内存块）
function initBlocks(num) {
    sendMessage('已为您随机生成 ' + num + ' 个进程。', 'fa fa-paper-plane-o', '#0099ff')
    for (let i = 0; i < num; i++) {
        g.blocks.push(parseInt((g.maxProcess * Math.random()) + 1))
        sendMessage('&nbsp;进程 ' + i + ' 将占用 ' + g.blocks[i] + ' KB 内存。')
    }
}

// 消息函数
function sendMessage(message, icon = '', color = 'black') {
    let icode = icon !== '' ? '<i class="message-icon ' + icon + '"></i>  ' : ''
    $('#message-panel').append('<div style="color:' + color + '">' + icode + message + '</div>')
    // 始终滚动到最后
    let mainContainer = $('.right-panel'),
        scrollToContainer = $('#message-footer');
    mainContainer.scrollTop(
        scrollToContainer.offset().top - mainContainer.offset().top + mainContainer.scrollTop()
    )
}