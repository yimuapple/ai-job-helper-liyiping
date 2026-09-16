// 项目配置文件
// 注意：此文件包含敏感信息，请勿提交到公开仓库

const CONFIG = {
  // DeepSeek API 配置（Day 5 简历 AI 解析用）
  deepseek: {
    apiKey: 'sk-0d9d19088afa4e0cbbf90563733f5554',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat'
  },

  // 插件信息
  extension: {
    name: '秋招网申一键填表',
    version: '0.0.1'
  },

  // 功能开关
  features: {
    aiResumeParse: true,    // 简历 AI 解析（Day 5）
    aiOpenQuestion: false,   // AI 开放题助手（Day 9，P1）
    siteAdapter: false       // 高频站点定向适配（Day 8）
  }
};

// 暴露给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
