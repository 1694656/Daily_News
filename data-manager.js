/**
 * 光伏早报 - 数据管理模块
 * 用于管理新闻数据的存储、读取和更新
 * 支持LocalStorage本地存储和JSON导出
 */

class NewsDataManager {
    constructor() {
        this.storageKey = 'photovoltaic_news_data';
        this.configKey = 'photovoltaic_config';
    }

    /**
     * 获取默认新闻数据结构
     */
    getDefaultData() {
        const today = new Date();
        return {
            date: today.toISOString().split('T')[0],
            lastUpdate: today.toISOString(),
            policy: {
                news1: { title: "请更新新闻标题", link: "#" },
                news2: { title: "请更新新闻标题", link: "#" },
                news3: { title: "请更新新闻标题", link: "#" }
            },
            industry: {
                news1: { title: "请更新新闻标题", link: "#" },
                news2: { title: "请更新新闻标题", link: "#" },
                news3: { title: "请更新新闻标题", link: "#" }
            },
            tech: {
                news1: { title: "请更新新闻标题", link: "#" },
                news2: { title: "请更新新闻标题", link: "#" },
                news3: { title: "请更新新闻标题", link: "#" }
            }
        };
    }

    /**
     * 从LocalStorage加载新闻数据
     */
    loadData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('加载数据失败:', error);
        }
        return this.getDefaultData();
    }

    /**
     * 保存新闻数据到LocalStorage
     */
    saveData(data) {
        try {
            data.lastUpdate = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('数据已保存到本地存储');
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    /**
     * 更新单条新闻
     */
    updateSingleNews(category, newsNumber, title, link) {
        const data = this.loadData();
        const newsKey = `news${newsNumber}`;
        
        if (data[category] && data[category][newsKey]) {
            data[category][newsKey] = { title, link };
            return this.saveData(data);
        }
        return false;
    }

    /**
     * 批量更新某个板块的新闻
     */
    updateCategoryNews(category, newsArray) {
        const data = this.loadData();
        
        if (data[category]) {
            newsArray.forEach((news, index) => {
                const newsKey = `news${index + 1}`;
                if (news && data[category][newsKey]) {
                    data[category][newsKey] = {
                        title: news.title || data[category][newsKey].title,
                        link: news.link || data[category][newsKey].link
                    };
                }
            });
            return this.saveData(data);
        }
        return false;
    }

    /**
     * 导出数据为JSON文件
     */
    exportToJSON() {
        const data = this.loadData();
        const filename = `光伏早报_${data.date}_${Date.now()}.json`;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('数据已导出:', filename);
        return filename;
    }

    /**
     * 从JSON文件导入数据
     */
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.saveData(data);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * 生成API格式的数据（用于腾讯云/企业微信）
     */
    generateAPIData() {
        const data = this.loadData();
        
        // 格式化为API友好的结构
        const apiData = {
            title: "光伏早报",
            subtitle: "30秒速读前沿新闻",
            date: data.date,
            updateTime: data.lastUpdate,
            sections: [
                {
                    name: "宏观政策",
                    type: "policy",
                    news: [
                        data.policy.news1,
                        data.policy.news2,
                        data.policy.news3
                    ]
                },
                {
                    name: "产经动态",
                    type: "industry",
                    news: [
                        data.industry.news1,
                        data.industry.news2,
                        data.industry.news3
                    ]
                },
                {
                    name: "产技创新",
                    type: "tech",
                    news: [
                        data.tech.news1,
                        data.tech.news2,
                        data.tech.news3
                    ]
                }
            ]
        };
        
        return apiData;
    }

    /**
     * 生成企业微信消息格式
     */
    generateWeChatMessage() {
        const data = this.loadData();
        const date = new Date(data.date);
        const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
        
        let message = `【光伏早报】${dateStr}\n`;
        message += `━━━━━━━━━━━━\n\n`;
        
        // 宏观政策
        message += `📊 宏观政策\n`;
        message += `1. ${data.policy.news1.title}\n`;
        message += `2. ${data.policy.news2.title}\n`;
        message += `3. ${data.policy.news3.title}\n\n`;
        
        // 产经动态
        message += `💼 产经动态\n`;
        message += `1. ${data.industry.news1.title}\n`;
        message += `2. ${data.industry.news2.title}\n`;
        message += `3. ${data.industry.news3.title}\n\n`;
        
        // 产技创新
        message += `🔬 产技创新\n`;
        message += `1. ${data.tech.news1.title}\n`;
        message += `2. ${data.tech.news2.title}\n`;
        message += `3. ${data.tech.news3.title}\n\n`;
        
        message += `━━━━━━━━━━━━\n`;
        message += `详情点击：${window.location.origin}/index.html`;
        
        return message;
    }

    /**
     * 生成Markdown格式（用于企业微信卡片消息）
     */
    generateMarkdown() {
        const data = this.loadData();
        const date = new Date(data.date);
        const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
        
        let markdown = `# 光伏早报 ${dateStr}\n\n`;
        markdown += `> 30秒速读前沿新闻\n\n`;
        
        // 宏观政策
        markdown += `## 📊 宏观政策\n`;
        markdown += `1. [${data.policy.news1.title}](${data.policy.news1.link})\n`;
        markdown += `2. [${data.policy.news2.title}](${data.policy.news2.link})\n`;
        markdown += `3. [${data.policy.news3.title}](${data.policy.news3.link})\n\n`;
        
        // 产经动态
        markdown += `## 💼 产经动态\n`;
        markdown += `1. [${data.industry.news1.title}](${data.industry.news1.link})\n`;
        markdown += `2. [${data.industry.news2.title}](${data.industry.news2.link})\n`;
        markdown += `3. [${data.industry.news3.title}](${data.industry.news3.link})\n\n`;
        
        // 产技创新
        markdown += `## 🔬 产技创新\n`;
        markdown += `1. [${data.tech.news1.title}](${data.tech.news1.link})\n`;
        markdown += `2. [${data.tech.news2.title}](${data.tech.news2.link})\n`;
        markdown += `3. [${data.tech.news3.title}](${data.tech.news3.link})\n`;
        
        return markdown;
    }

    /**
     * 清除所有数据
     */
    clearData() {
        localStorage.removeItem(this.storageKey);
        console.log('数据已清除');
    }

    /**
     * 检查数据是否为今天
     */
    isToday() {
        const data = this.loadData();
        const today = new Date().toISOString().split('T')[0];
        return data.date === today;
    }

    /**
     * 获取数据更新时间
     */
    getLastUpdateTime() {
        const data = this.loadData();
        if (data.lastUpdate) {
            const date = new Date(data.lastUpdate);
            return date.toLocaleString('zh-CN');
        }
        return '未知';
    }
}

// 创建全局实例
window.newsDataManager = new NewsDataManager();