// 秋招网申一键填表 - Popup 弹窗逻辑
// Day 10: 体验打磨 - 首次使用引导 + 填充结果反馈 + 界面美化
// Day 13: 简化版激活码机制

// 预设有效激活码列表（你可以随时在这里加新的激活码）
// 格式：QZ2024-XXXX-XXXX
const VALID_ACTIVATION_CODES = [
  'QZ2024-VIP888',
  'QZ2024-PRO666',
  'QZ2024-FREE2024',
  'QZ2024-TEST123',
];

document.addEventListener('DOMContentLoaded', function () {
  const fillBtn = document.getElementById('fillBtn');
  const status = document.getElementById('status');
  const autoFillCheckbox = document.getElementById('autoFill');
  const onboarding = document.getElementById('onboarding');
  const mainContent = document.getElementById('mainContent');
  const startBtn = document.getElementById('startBtn');
  const uploadResumeBtn = document.getElementById('uploadResumeBtn');
  const manageInfoBtn = document.getElementById('manageInfoBtn');
  const helpBtn = document.getElementById('helpBtn');
  const feedbackBtn = document.getElementById('feedbackBtn');
  const resultToggle = document.getElementById('resultToggle');
  const toggleIcon = document.getElementById('toggleIcon');
  const resultDetails = document.getElementById('resultDetails');
  const modeBoss = document.getElementById('modeBoss');
  const modeWangShen = document.getElementById('modeWangShen');
  const guideTitle = document.getElementById('guideTitle');
  const guideSteps = document.getElementById('guideSteps');
  const resumeModeBar = document.getElementById('resumeModeBar');

  // ========== 当前填表简历状态条 ==========
  function updateResumeModeBar() {
    if (!resumeModeBar) return;
    chrome.storage.local.get(['customResume'], (res) => {
      const cr = res.customResume;
      if (cr) {
        const internCount = (cr.internship || []).length;
        const projCount = (cr.project || []).length;
        const eduCount = (cr.education || []).length;
        resumeModeBar.style.background = '#f6ffed';
        resumeModeBar.style.border = '1px solid #b7eb8f';
        resumeModeBar.style.color = '#237804';
        resumeModeBar.innerHTML =
          '<div style="font-weight:600;margin-bottom:4px;">📌 当前使用「岗位定制简历」填表</div>' +
          '<div style="font-size:11px;color:#52c41a;margin-bottom:6px;">教育' + eduCount + '段 · 实习' + internCount + '段 · 项目' + projCount + '段</div>' +
          '<button id="restoreFullBtn" style="width:100%;padding:6px;background:#fff;color:#237804;border:1px solid #b7eb8f;border-radius:6px;font-size:12px;cursor:pointer;font-weight:600;">↩️ 恢复完整经历库</button>';
        document.getElementById('restoreFullBtn').addEventListener('click', () => {
          if (confirm('确定恢复为完整经历库？')) {
            chrome.storage.local.remove(['customResume'], () => {
              updateResumeModeBar();
              showStatus('✅ 已恢复为完整经历库');
            });
          }
        });
      } else {
        resumeModeBar.style.background = '#fafafa';
        resumeModeBar.style.border = '1px solid #e8e8e8';
        resumeModeBar.style.color = '#666';
        resumeModeBar.innerHTML =
          '<div>📋 当前使用「完整经历库」填表</div>' +
          '<div style="font-size:11px;color:#999;margin-top:2px;">在岗位页生成定制简历后，点"用此简历填表"可切换为定制版</div>';
      }
    });
  }
  updateResumeModeBar();

  // ========== 激活码验证 ==========
  const activationArea = document.getElementById('activationArea');
  const activatedBadge = document.getElementById('activatedBadge');
  const activationCodeInput = document.getElementById('activationCode');
  const activateBtn = document.getElementById('activateBtn');
  const activationError = document.getElementById('activationError');

  function checkActivation() {
    chrome.storage.local.get(['activationCode'], function(result) {
      if (result.activationCode && VALID_ACTIVATION_CODES.includes(result.activationCode)) {
        // 已激活，显示正常内容
        activationArea.style.display = 'none';
        activatedBadge.style.display = 'block';
        if (mainContent) mainContent.style.display = 'block';
      } else {
        // 未激活，显示激活输入框，隐藏核心内容
        activationArea.style.display = 'block';
        activatedBadge.style.display = 'none';
        if (mainContent) mainContent.style.display = 'none';
      }
    });
  }

  activateBtn.addEventListener('click', function() {
    const code = activationCodeInput.value.trim().toUpperCase();
    activationError.style.display = 'none';

    if (!code) {
      activationError.textContent = '请输入激活码';
      activationError.style.display = 'block';
      return;
    }

    if (!code.startsWith('QZ2024-')) {
      activationError.textContent = '激活码格式不正确，应为：QZ2024-XXXX-XXXX';
      activationError.style.display = 'block';
      return;
    }

    if (VALID_ACTIVATION_CODES.includes(code)) {
      // 激活成功
      chrome.storage.local.set({ activationCode: code }, function() {
        activationArea.style.display = 'none';
        activatedBadge.style.display = 'block';
        if (mainContent) mainContent.style.display = 'block';
      });
    } else {
      activationError.textContent = '激活码无效，请检查后重试';
      activationError.style.display = 'block';
    }
  });

  // 页面加载时先检查激活状态（移到最后，覆盖其他显示逻辑）
  // checkActivation();  // 移到初始化最后调用

  let fillStartTime = 0;
  let currentMode = 'boss'; // 默认BOSS直聘模式

  // ========== 首次使用引导 ==========
  function checkFirstTime() {
    chrome.storage.local.get(['onboardingComplete', 'userProfile'], function(result) {
      if (!result.onboardingComplete) {
        // 第一次使用，显示引导
        onboarding.style.display = 'block';
        mainContent.style.display = 'none';
      } else {
        // 已完成引导，显示主界面
        onboarding.style.display = 'none';
        mainContent.style.display = 'block';
        updateUserInfo(result.userProfile);
      }
    });
  }

  // 开始使用按钮
  startBtn.addEventListener('click', function() {
    chrome.storage.local.set({ onboardingComplete: true }, function() {
      onboarding.style.display = 'none';
      mainContent.style.display = 'block';
      // 自动打开管理信息页面
      openOptionsPage();
    });
  });

  // ========== 用户信息展示 ==========
  function updateUserInfo(userInfo) {
    const usernameEl = document.getElementById('username');
    const userDescEl = document.getElementById('userDesc');
    const userStatusEl = document.getElementById('userStatus');
    const userAvatarEl = document.getElementById('userAvatar');

    const analyzeBtn = document.getElementById('analyzeBtn');
    const generateResumeBtn = document.getElementById('generateResumeBtn');
    const fillBtn = document.getElementById('fillBtn');

    const hasInfo = userInfo && userInfo.basicInfo && userInfo.basicInfo.name;

    const step0El = document.getElementById('step0');
    if (hasInfo) {
      // 已录入信息，第0步打勾完成
      if (step0El) {
        step0El.style.background = '#f6ffed';
        step0El.style.border = '1px solid #b7eb8f';
        step0El.querySelector('.step-num').style.background = '#52c41a';
        step0El.querySelector('span:last-child').innerHTML = '✅ 已上传简历 / 信息已录入';
        step0El.querySelector('span:last-child').style.color = '#52c41a';
      }
      usernameEl.textContent = userInfo.basicInfo.name;
      const school = userInfo.education && userInfo.education[0] ? userInfo.education[0].school : '';
      const major = userInfo.education && userInfo.education[0] ? userInfo.education[0].major : '';
      userDescEl.textContent = school + (major ? ' · ' + major : '');
      userStatusEl.textContent = '✅';
      userAvatarEl.textContent = userInfo.basicInfo.name.charAt(0);

      // 已录入信息，启用核心按钮
      if (analyzeBtn) analyzeBtn.disabled = false;
      if (generateResumeBtn) generateResumeBtn.disabled = false;
      if (fillBtn) fillBtn.disabled = false;
    } else {
      usernameEl.textContent = '未录入信息';
      userDescEl.textContent = '第一步：先上传简历或录入信息';
      userStatusEl.textContent = '⚠️';
      userAvatarEl.textContent = '👤';

      // 未录入信息，禁用核心按钮，提示先填简历
      if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.style.opacity = '0.5';
        analyzeBtn.style.cursor = 'not-allowed';
        analyzeBtn.title = '请先上传简历或录入信息';
      }
      if (generateResumeBtn) {
        generateResumeBtn.disabled = true;
        generateResumeBtn.style.opacity = '0.5';
        generateResumeBtn.style.cursor = 'not-allowed';
        generateResumeBtn.title = '请先上传简历或录入信息';
      }
      if (fillBtn) {
        fillBtn.disabled = true;
        fillBtn.style.opacity = '0.5';
        fillBtn.style.cursor = 'not-allowed';
        fillBtn.title = '请先上传简历或录入信息';
      }
    }
  }

  // 监听存储变化，实时更新用户信息
  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local' && changes.userProfile) {
      updateUserInfo(changes.userProfile.newValue);
    }
  });

  // ========== 读取保存的设置 ==========
  chrome.storage.local.get(['settings'], function(result) {
    if (result.settings) {
      if (result.settings.autoFillNewFields) {
        autoFillCheckbox.checked = true;
      }
    }
  });

  // 自动填充开关
  autoFillCheckbox.addEventListener('change', function() {
    chrome.storage.local.get(['settings'], function(result) {
      const settings = result.settings || {};
      settings.autoFillNewFields = autoFillCheckbox.checked;
      chrome.storage.local.set({ settings: settings }, function() {
        if (autoFillCheckbox.checked) {
          showStatus('✅ 已开启自动填充新增字段');
        } else {
          showStatus('已关闭自动填充');
        }
      });
    });
  });

  // ========== 投递模式切换 ==========
  function updateModeGuide(mode) {
    currentMode = mode;
    if (mode === 'boss') {
      modeBoss.classList.add('active');
      modeWangShen.classList.remove('active');
      guideTitle.textContent = '📋 BOSS直聘投递流程';
      guideSteps.innerHTML = `
        <div class="guide-step"><span class="step-num">1</span><span>分析岗位，匹配度&lt;60分建议跳过</span></div>
        <div class="guide-step"><span class="step-num">2</span><span>补充缺失经历/技能或项目（如果有）</span></div>
        <div class="guide-step"><span class="step-num">3</span><span>生成岗位定制简历</span></div>
        <div class="guide-step"><span class="step-num">4</span><span>用定制内容优化在线简历</span></div>
        <div class="guide-step"><span class="step-num">5</span><span>打招呼，等HR回复</span></div>
        <div class="guide-step"><span class="step-num">6</span><span>回复后发送定制PDF简历</span></div>
      `;
    } else {
      modeWangShen.classList.add('active');
      modeBoss.classList.remove('active');
      guideTitle.textContent = '📝 网申投递流程';
      guideSteps.innerHTML = `
        <div class="guide-step" id="step0" style="background: #fff7e6; border: 1px solid #ffd591; border-radius: 6px; padding: 6px 8px; margin-bottom: 6px;">
          <span class="step-num" style="background: #fa8c16;">0</span>
          <span style="color: #fa8c16; font-weight: 600;">先上传简历 / 录入你的完整经历库</span>
        </div>
        <div class="guide-step"><span class="step-num">1</span><span>分析岗位，匹配度&lt;60分建议跳过</span></div>
        <div class="guide-step"><span class="step-num">2</span><span>补充缺失经历/技能或项目（如果有）</span></div>
        <div class="guide-step"><span class="step-num">3</span><span>生成岗位定制简历（可选：同时生成开放性问题回答）</span></div>
        <div class="guide-step"><span class="step-num">4</span><span>进入网申页面，一键填充表单</span></div>
        <div class="guide-step"><span class="step-num">5</span><span>检查剩余字段后提交</span></div>
      `;
      // 切换模式后重新更新第0步状态
      if (hasInfo) {
        const step0El = document.getElementById('step0');
        if (step0El) {
          step0El.style.background = '#f6ffed';
          step0El.style.border = '1px solid #b7eb8f';
          step0El.querySelector('.step-num').style.background = '#52c41a';
          step0El.querySelector('span:last-child').innerHTML = '✅ 已上传简历 / 信息已录入';
          step0El.querySelector('span:last-child').style.color = '#52c41a';
        }
      }
    }
    // 保存模式选择
    chrome.storage.local.set({ deliveryMode: mode });
  }

  modeBoss.addEventListener('click', function() {
    updateModeGuide('boss');
  });

  modeWangShen.addEventListener('click', function() {
    updateModeGuide('wangshen');
  });

  // 读取保存的模式
  chrome.storage.local.get(['deliveryMode'], function(result) {
    if (result.deliveryMode) {
      updateModeGuide(result.deliveryMode);
    }
  });

  // ========== 一键填充按钮 ==========
  fillBtn.addEventListener('click', async function () {
    const onlyEmpty = document.getElementById('onlyEmpty').checked;
    fillStartTime = Date.now();
    showStatus('⏳ 正在识别并填充表单...');
    document.getElementById('fillStats').style.display = 'none';
    document.getElementById('fillResult').style.display = 'none';
    fillBtn.disabled = true;

    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        showStatus('❌ 无法获取当前页面');
        fillBtn.disabled = false;
        return;
      }

      // 检查是否是浏览器内部页面
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
        showStatus('❌ 请在招聘网站页面上使用');
        fillBtn.disabled = false;
        return;
      }

      // 向 content script 发送填充消息
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'fillForm', onlyEmpty: onlyEmpty });

      if (response.error) {
        showStatus('❌ ' + response.error);
      } else {
        const fillTime = ((Date.now() - fillStartTime) / 1000).toFixed(1);
        showStatus(`✅ 填充完成，耗时 ${fillTime} 秒`);
        showFillStats(response, fillTime);
        showFillResult(response);
      }
    } catch (err) {
      console.error('填充失败:', err);
      if (err.message.includes('Receiving end does not exist')) {
        showStatus('❌ 页面未就绪，请刷新页面后重试');
      } else {
        showStatus('❌ 填充失败: ' + err.message.substring(0, 30));
      }
    }

    fillBtn.disabled = false;
  });

  // ========== 岗位JD分析按钮 ==========
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async function () {
      showStatus('⏳ 正在分析岗位JD...');
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = '<span class="analyze-icon">⏳</span><span>分析中...</span>';

      try {
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
          showStatus('❌ 无法获取当前页面');
          analyzeBtn.disabled = false;
          analyzeBtn.innerHTML = '<span class="analyze-icon">🎯</span><span>分析这个岗位</span>';
          return;
        }

        // 检查是否是浏览器内部页面
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
          showStatus('❌ 请在招聘网站岗位详情页使用');
          analyzeBtn.disabled = false;
          analyzeBtn.innerHTML = '<span class="analyze-icon">🎯</span><span>分析这个岗位</span>';
          return;
        }

        // 向 content script 发送分析消息
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzeJD' });

        if (response.error) {
          showStatus('❌ ' + response.error);
        } else if (response.success) {
          showStatus('✅ 岗位分析完成！结果已显示在页面右侧');
        } else {
          showStatus('⚠️ 分析完成，但未找到岗位描述');
        }
      } catch (err) {
        console.error('岗位分析失败:', err);
        if (err.message.includes('Receiving end does not exist')) {
          showStatus('❌ 页面未就绪，请刷新页面后重试');
        } else {
          showStatus('❌ 分析失败: ' + err.message.substring(0, 30));
        }
      }

      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '<span class="analyze-icon">🎯</span><span>分析这个岗位</span>';
    });
  }

  // ========== AI生成定制简历按钮 ==========
  const generateResumeBtn = document.getElementById('generateResumeBtn');
  if (generateResumeBtn) {
    generateResumeBtn.addEventListener('click', async function () {
      showStatus('⏳ 正在生成岗位定制简历...');
      generateResumeBtn.disabled = true;
      generateResumeBtn.innerHTML = '<span class="generate-icon">⏳</span><span>生成中...</span>';

      try {
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
          showStatus('❌ 无法获取当前页面');
          generateResumeBtn.disabled = false;
          generateResumeBtn.innerHTML = '<span class="generate-icon">📄</span><span>生成岗位定制简历</span>';
          return;
        }

        // 检查是否是浏览器内部页面
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
          showStatus('❌ 请在招聘网站岗位详情页使用');
          generateResumeBtn.disabled = false;
          generateResumeBtn.innerHTML = '<span class="generate-icon">📄</span><span>生成岗位定制简历</span>';
          return;
        }

        // 向 content script 发送生成简历消息
        const wantOpenQuestions = document.getElementById('openQuestions').checked;
        const response = await chrome.tabs.sendMessage(tab.id, { 
          action: 'generateResume',
          includeOpenQuestions: wantOpenQuestions
        });

        if (response.error) {
          showStatus('❌ ' + response.error);
        } else if (response.success) {
          showStatus('✅ 简历已生成！请在页面右侧浮层点「📌 用此简历填表」，再去网申页一键填充');
        } else {
          showStatus('⚠️ 生成完成，但未找到岗位描述');
        }
      } catch (err) {
        console.error('生成简历失败:', err);
        if (err.message.includes('Receiving end does not exist')) {
          showStatus('❌ 页面未就绪，请刷新页面后重试');
        } else {
          showStatus('❌ 生成失败: ' + err.message.substring(0, 30));
        }
      }

      generateResumeBtn.disabled = false;
      generateResumeBtn.innerHTML = '<span class="generate-icon">📄</span><span>生成岗位定制简历</span>';
    });
  }

  // ========== 填充结果统计 ==========
  function showFillStats(response, fillTime) {
    const statsDiv = document.getElementById('fillStats');
    const statFilled = document.getElementById('statFilled');
    const statSkipped = document.getElementById('statSkipped');
    const statUnrecognized = document.getElementById('statUnrecognized');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const fillTimeEl = document.getElementById('fillTime');

    const filled = response.filled || 0;
    const skipped = response.skippedNotEmpty || 0;
    const unrecognized = response.skipped || 0;
    const total = filled + skipped + unrecognized;
    const successRate = total > 0 ? Math.round((filled / total) * 100) : 0;

    statFilled.textContent = filled;
    statSkipped.textContent = skipped;
    statUnrecognized.textContent = unrecognized;
    progressFill.style.width = successRate + '%';
    progressText.textContent = successRate + '%';
    fillTimeEl.textContent = '耗时 ' + fillTime + 's';

    statsDiv.style.display = 'block';
  }

  // ========== 详细填充结果 ==========
  function showFillResult(response) {
    const resultDiv = document.getElementById('fillResult');
    const detailsDiv = document.getElementById('resultDetails');

    const fieldNames = {
      name: '姓名', phone: '手机号', email: '邮箱', gender: '性别',
      birthday: '出生日期', school: '学校', major: '专业', degree: '学历',
      gpa: 'GPA', rank: '排名', address: '地址', idCard: '身份证号',
      politicalStatus: '政治面貌', company: '公司名称', position: '职位',
      startDate: '开始时间', endDate: '结束时间', description: '工作描述',
      achievements: '工作成果', projectName: '项目名称', role: '角色',
      courses: '主修课程', languages: '语言能力', skills: '专业技能',
      certificates: '证书', awards: '获奖经历'
    };

    let html = '';

    // 已填充的字段
    if (response.filledFields && response.filledFields.length > 0) {
      const uniqueFields = [...new Set(response.filledFields)];
      uniqueFields.forEach(field => {
        const name = fieldNames[field] || field;
        html += `<div class="result-item"><span class="field-name">${name}</span><span class="field-status filled">✓ 已填充</span></div>`;
      });
    }

    // 跳过的字段（已有内容）
    if (response.skippedNotEmptyFields && response.skippedNotEmptyFields.length > 0) {
      response.skippedNotEmptyFields.forEach(field => {
        const name = fieldNames[field] || field;
        html += `<div class="result-item"><span class="field-name">${name}</span><span class="field-status skipped">⊘ 已有内容</span></div>`;
      });
    }

    if (html) {
      detailsDiv.innerHTML = html;
      resultDiv.style.display = 'block';
      // 默认展开
      resultDetails.style.display = 'block';
      toggleIcon.textContent = '▲';
    }
  }

  // 展开/收起详细结果
  resultToggle.addEventListener('click', function() {
    if (resultDetails.style.display === 'none') {
      resultDetails.style.display = 'block';
      toggleIcon.textContent = '▲';
    } else {
      resultDetails.style.display = 'none';
      toggleIcon.textContent = '▼';
    }
  });

  // ========== 快捷操作按钮 ==========
  // 上传简历按钮 → 打开 options 页面并自动跳转到简历上传
  uploadResumeBtn.addEventListener('click', function() {
    openOptionsPage();
    window.close();
  });

  // 管理信息按钮 → 打开 options 信息管理面板
  manageInfoBtn.addEventListener('click', function() {
    openOptionsPage();
    window.close();
  });

  function openOptionsPage() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  }

  // ========== 底部按钮 ==========
  helpBtn.addEventListener('click', function() {
    showStatus('📖 使用帮助：先录入信息→打开网申页→一键填充');
  });

  feedbackBtn.addEventListener('click', function() {
    showStatus('💬 反馈问题：请截图并描述遇到的问题');
  });

  // ========== 显示状态提示 ==========
  function showStatus(msg) {
    status.textContent = msg;
    setTimeout(function () {
      if (status.textContent === msg) {
        status.textContent = '';
      }
    }, 4000);
  }

  // 初始化
  checkFirstTime();
  checkActivation();  // 激活检查放在最后，覆盖其他显示逻辑
});
