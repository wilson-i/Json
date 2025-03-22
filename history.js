document.addEventListener('DOMContentLoaded', function() {
    const historyList = document.getElementById('historyList');
    const deleteModal = document.getElementById('deleteModal');
    const clearAllModal = document.getElementById('clearAllModal');
    const detailModal = document.getElementById('detailModal');
    const toast = document.getElementById('toast');
    const jsonDetail = document.getElementById('jsonDetail');
    
    // 当前选中的历史记录ID
    let currentHistoryId = null;
    
    // 添加滚动到顶部按钮
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scrollTopBtn';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.innerHTML = '<i class="fa fa-arrow-up"></i><span class="scroll-top-tooltip">回到顶部</span>';
    document.body.appendChild(scrollTopBtn);
    
    // 滚动到顶部功能
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 监听滚动事件，控制滚动到顶部按钮的显示和隐藏
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });
    
    // 显示消息提示
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
    
    // 格式化日期时间
    function formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    // 生成JSON预览
    function generateJsonPreview(jsonString, maxLength = 300) {
        try {
            // 尝试格式化JSON
            const parsed = JSON.parse(jsonString);
            
            // 对于大型JSON对象，只格式化顶层属性以提高性能
            let formatted;
            if (typeof parsed === 'object' && parsed !== null) {
                // 检查对象大小
                const jsonSize = JSON.stringify(parsed).length;
                
                if (jsonSize > 10000) { // 对于大型JSON对象采用简化处理
                    // 只处理顶层属性
                    const simplifiedObj = {};
                    
                    // 对于数组类型
                    if (Array.isArray(parsed)) {
                        // 只显示前几个元素
                        const previewItems = parsed.slice(0, 3);
                        formatted = JSON.stringify(previewItems, null, 2);
                        if (parsed.length > 3) {
                            formatted = formatted.substring(0, formatted.length - 2) + ',\n  ...\n]';
                        }
                    } else {
                        // 对于对象类型，只显示键名
                        const keys = Object.keys(parsed);
                        keys.slice(0, 5).forEach(key => {
                            const value = parsed[key];
                            // 简化嵌套对象/数组的显示
                            if (typeof value === 'object' && value !== null) {
                                simplifiedObj[key] = Array.isArray(value) ? 
                                    `[Array(${value.length})]` : '{Object}';
                            } else {
                                simplifiedObj[key] = value;
                            }
                        });
                        
                        if (keys.length > 5) {
                            simplifiedObj['...'] = `${keys.length - 5} more properties`;
                        }
                        
                        formatted = JSON.stringify(simplifiedObj, null, 2);
                    }
                } else {
                    // 对于小型JSON对象，完整格式化
                    formatted = JSON.stringify(parsed, null, 2);
                }
            } else {
                // 非对象类型直接格式化
                formatted = JSON.stringify(parsed, null, 2);
            }
            
            // 截断过长的内容
            if (formatted.length > maxLength) {
                return formatted.substring(0, maxLength) + '...';
            }
            
            return formatted;
        } catch (e) {
            // 处理无效JSON
            return jsonString.substring(0, maxLength) + '...';
        }
    }
    
    // 语法高亮
    function syntaxHighlight(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, undefined, 4);
        }
        
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return json.replace(/(""|"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                    match = match.replace(/"/g, '').replace(/:$/, '');
                    return '<span class="' + cls + '">' + match + '</span>:';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
    
    // 从localStorage加载历史记录
    // 分页配置
    let currentPage = 1;
    const itemsPerPage = 20; // 每页显示的记录数
    let totalHistory = [];
    
    // 添加分页控制器
    function createPagination(totalPages) {
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';
        
        // 上一页按钮
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fa fa-angle-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderHistoryPage();
            }
        });
        
        // 下一页按钮
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fa fa-angle-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderHistoryPage();
            }
        });
        
        // 页码信息
        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `${currentPage} / ${totalPages}`;
        
        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
        
        return paginationContainer;
    }
    
    // 渲染当前页的历史记录
    function renderHistoryPage() {
        // 清空历史列表
        historyList.innerHTML = '';
        
        // 计算当前页的数据
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalHistory.length);
        const currentPageData = totalHistory.slice(startIndex, endIndex);
        
        // 创建一个文档片段，提高性能
        const fragment = document.createDocumentFragment();
        
        // 添加历史记录项
        currentPageData.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.id = item.id;
            
            // 添加延迟动画效果
            historyItem.style.opacity = '0';
            historyItem.style.transform = 'translateY(20px)';
            
            const formattedTime = formatDateTime(item.timestamp);
            
            // 创建基本结构，先不包含JSON预览内容
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-timestamp">
                        <i class="fa fa-clock-o"></i> ${formattedTime}
                    </div>
                    <div class="history-actions-item">
                        <button class="btn-icon view-btn" title="查看详情">
                            <i class="fa fa-eye"></i>
                        </button>
                        <button class="btn-icon delete-btn" title="删除">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="history-preview">
                    <pre>加载中...</pre>
                </div>
            `;
            
            fragment.appendChild(historyItem);
            
            // 添加查看按钮事件
            const viewBtn = historyItem.querySelector('.view-btn');
            viewBtn.addEventListener('click', () => {
                showDetail(item.id);
            });
            
            // 添加复制按钮事件
            const copyBtn = historyItem.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    copyJsonContent(item.id);
                });
            }
            
            // 添加删除按钮事件
            const deleteBtn = historyItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                showDeleteConfirm(item.id);
            });
            
            // 添加点击整个项目也可以查看详情
            historyItem.querySelector('.history-preview').addEventListener('click', () => {
                showDetail(item.id);
            });
        });
        
        // 一次性添加所有元素到DOM
        historyList.appendChild(fragment);
        
        // 计算总页数
        const totalPages = Math.ceil(totalHistory.length / itemsPerPage);
        
        // 添加分页控制器
        if (totalPages > 1) {
            const paginationElement = createPagination(totalPages);
            historyList.appendChild(paginationElement);
        }
        
        // 添加动画效果并延迟加载JSON预览内容
        setTimeout(() => {
            const items = document.querySelectorAll('.history-item');
            items.forEach((item, index) => {
                // 先显示元素
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    item.style.transition = 'all 0.3s ease';
                    
                    // 延迟加载JSON预览内容
                    setTimeout(() => {
                        const itemId = item.dataset.id;
                        const historyItem = currentPageData.find(h => h.id === itemId);
                        if (historyItem) {
                            const jsonPreview = generateJsonPreview(historyItem.content);
                            const previewElement = item.querySelector('.history-preview pre');
                            if (previewElement) {
                                previewElement.innerHTML = jsonPreview;
                            }
                        }
                    }, index * 20); // 错开加载JSON预览的时间，减少页面卡顿
                    
                }, index * 30); // 减少延迟时间，提高响应速度
            });
        }, 50);
        
        // 滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    function loadHistory() {
        try {
            // 从localStorage获取历史记录
            totalHistory = JSON.parse(localStorage.getItem('jsonFormatterHistory')) || [];
            
            if (totalHistory.length === 0) {
                historyList.innerHTML = '<div class="empty-history"><i class="fa fa-history"></i>暂无历史记录</div>';
                return;
            }
            
            // 按时间戳倒序排列
            totalHistory.sort((a, b) => b.timestamp - a.timestamp);
            
            // 重置为第一页
            currentPage = 1;
            
            // 渲染第一页数据
            renderHistoryPage();
            
        } catch (e) {
            console.error('加载历史记录失败:', e);
            historyList.innerHTML = '<div class="empty-history"><i class="fa fa-exclamation-circle"></i>加载历史记录失败</div>';
        }
    }
    
    // 显示删除确认对话框
    function showDeleteConfirm(id) {
        currentHistoryId = id;
        deleteModal.style.display = 'flex';
        // 添加短暂延迟以确保过渡效果正常工作
        setTimeout(() => {
            deleteModal.classList.add('show');
        }, 10);
    }
    
    // 显示清空确认对话框
    function showClearAllConfirm() {
        clearAllModal.style.display = 'flex';
        // 添加短暂延迟以确保过渡效果正常工作
        setTimeout(() => {
            clearAllModal.classList.add('show');
        }, 10);
    }
    
    // 显示详情对话框
    function showDetail(id) {
        try {
            const history = JSON.parse(localStorage.getItem('jsonFormatterHistory')) || [];
            const item = history.find(item => item.id === id);
            
            if (!item) {
                showToast('找不到该历史记录');
                return;
            }
            
            currentHistoryId = id;
            
            // 先显示加载中状态
            jsonDetail.innerHTML = '<div class="loading-indicator">加载中...</div>';
            detailModal.style.display = 'flex';
            
            // 添加短暂延迟以确保过渡效果正常工作
            setTimeout(() => {
                detailModal.classList.add('show');
                
                // 使用setTimeout将格式化操作放入下一个事件循环，避免阻塞UI
                setTimeout(() => {
                    try {
                        // 尝试格式化JSON
                        const parsed = JSON.parse(item.content);
                        
                        // 检查JSON大小
                        const jsonSize = JSON.stringify(parsed).length;
                        let formatted;
                        
                        if (jsonSize > 100000) {
                            // 对于特别大的JSON，添加警告并分批处理
                            jsonDetail.innerHTML = `
                                <div class="json-size-warning">注意：此JSON数据较大(${(jsonSize/1024).toFixed(2)}KB)，可能影响性能</div>
                                <pre>${syntaxHighlight(JSON.stringify(parsed, null, 2))}</pre>
                            `;
                        } else {
                            // 对于普通大小的JSON，正常处理
                            formatted = JSON.stringify(parsed, null, 2);
                            jsonDetail.innerHTML = `<pre>${syntaxHighlight(formatted)}</pre>`;
                        }
                    } catch (e) {
                        jsonDetail.innerHTML = `<pre>${item.content}</pre>`;
                    }
                }, 50);
            }, 10);
        } catch (e) {
            console.error('显示详情失败:', e);
            showToast('显示详情失败');
        }
    }
    
    // 删除历史记录
    function deleteHistory(id) {
        try {
            let history = JSON.parse(localStorage.getItem('jsonFormatterHistory')) || [];
            history = history.filter(item => item.id !== id);
            localStorage.setItem('jsonFormatterHistory', JSON.stringify(history));
            
            // 更新总历史记录
            totalHistory = history;
            
            // 如果当前页没有数据了且不是第一页，则回到上一页
            const totalPages = Math.ceil(totalHistory.length / itemsPerPage);
            if (currentPage > totalPages && currentPage > 1) {
                currentPage = totalPages || 1;
            }
            
            // 重新加载历史记录
            renderHistoryPage();
            showToast('删除成功');
        } catch (e) {
            console.error('删除历史记录失败:', e);
            showToast('删除失败');
        }
    }
    
    // 清空所有历史记录
    function clearAllHistory() {
        try {
            localStorage.removeItem('jsonFormatterHistory');
            totalHistory = [];
            currentPage = 1;
            loadHistory();
            showToast('已清空所有历史记录');
        } catch (e) {
            console.error('清空历史记录失败:', e);
            showToast('清空失败');
        }
    }
    
    // 复制JSON内容到剪贴板
    function copyJsonContent(id) {
        try {
            const history = JSON.parse(localStorage.getItem('jsonFormatterHistory')) || [];
            const item = history.find(item => item.id === id);
            
            if (!item) {
                showToast('找不到该历史记录');
                return;
            }
            
            // 创建临时文本区域
            const textarea = document.createElement('textarea');
            textarea.value = item.content;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            
            // 选择文本并复制
            textarea.select();
            document.execCommand('copy');
            
            // 移除临时元素
            document.body.removeChild(textarea);
            
            showToast('JSON已复制到剪贴板');
        } catch (e) {
            console.error('复制JSON失败:', e);
            showToast('复制失败');
        }
    }
    
    // 使用选中的JSON
    function useSelectedJson() {
        try {
            const history = JSON.parse(localStorage.getItem('jsonFormatterHistory')) || [];
            const item = history.find(item => item.id === currentHistoryId);
            
            if (!item) {
                showToast('找不到该历史记录');
                return;
            }
            
            // 将选中的JSON存储到sessionStorage，以便在formatter.html中使用
            sessionStorage.setItem('selectedJson', item.content);
            
            // 跳转到formatter.html
            window.location.href = 'formatter.html';
        } catch (e) {
            console.error('使用JSON失败:', e);
            showToast('使用JSON失败');
        }
    }
    
    // 绑定事件
    document.getElementById('clearAllBtn').addEventListener('click', showClearAllConfirm);
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        deleteModal.classList.remove('show');
        setTimeout(() => {
            deleteModal.style.display = 'none';
        }, 300); // 与CSS过渡时间匹配
    });
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        deleteHistory(currentHistoryId);
        deleteModal.classList.remove('show');
        setTimeout(() => {
            deleteModal.style.display = 'none';
        }, 300); // 与CSS过渡时间匹配
    });
    document.getElementById('cancelClearBtn').addEventListener('click', () => {
        clearAllModal.classList.remove('show');
        setTimeout(() => {
            clearAllModal.style.display = 'none';
        }, 300); // 与CSS过渡时间匹配
    });
    document.getElementById('confirmClearBtn').addEventListener('click', () => {
        clearAllHistory();
        clearAllModal.classList.remove('show');
        setTimeout(() => {
            clearAllModal.style.display = 'none';
        }, 300); // 与CSS过渡时间匹配
    });
    document.getElementById('closeDetailBtn').addEventListener('click', () => {
        detailModal.classList.remove('show');
        setTimeout(() => {
            detailModal.style.display = 'none';
        }, 300); // 与CSS过渡时间匹配
    });
    document.getElementById('useThisJsonBtn').addEventListener('click', () => {
        useSelectedJson();
        detailModal.classList.remove('show');
        setTimeout(() => {
            detailModal.style.display = 'none';
        }, 300); // 与CSS过渡时间匹配
    });
    
    // 点击模态框背景关闭模态框
    window.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.remove('show');
            setTimeout(() => {
                deleteModal.style.display = 'none';
            }, 300);
        }
        if (e.target === clearAllModal) {
            clearAllModal.classList.remove('show');
            setTimeout(() => {
                clearAllModal.style.display = 'none';
            }, 300);
        }
        if (e.target === detailModal) {
            detailModal.classList.remove('show');
            setTimeout(() => {
                detailModal.style.display = 'none';
            }, 300);
        }
    });
    
    // 加载历史记录
    loadHistory();
});