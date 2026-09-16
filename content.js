// 秋招网申一键填表 - Content Script
// Day 6: 注入到招聘网站，智能识别字段并自动填充

console.log('[秋招网申一键填表] content script 已加载');

// 字段关键词映射表：字段类型 -> 匹配关键词
const FIELD_KEYWORDS = {
  name: ['姓名', '真实姓名', 'name', 'fullname', 'full_name', 'realname', 'real_name', 'username', 'candidate_name', '名字', '您的姓名', '联系人', 'contact_name', 'person_name'],
  phone: ['手机', '手机号', '电话', '联系方式', '联系电话', 'phone', 'mobile', 'tel', 'telephone', 'cellphone', 'contact', 'contact_number', 'phone_number', 'mobile_number', '手機', '聯繫電話'],
  email: ['邮箱', '电子邮件', 'email', 'mail', 'e-mail', 'e_mail', 'email_address', '电子邮箱', '郵箱', '電子郵件'],
  gender: ['性别', 'gender', 'sex', '性別'],
  birthday: ['生日', '出生日期', '出生年月', 'birthday', 'birth', 'birthdate', 'birth_date', 'date_of_birth', 'dob', '出生年月日'],
  school: ['学校', '毕业院校', '院校', '大学', 'school', 'university', 'college', 'institution', 'alma_mater', 'graduation_school', '毕业学校', '就读学校', '所在学校', '學校', '畢業院校'],
  major: ['专业', 'major', 'subject', 'specialty', 'discipline', '所学专业', '专业名称', '專業'],
  degree: ['学历', '学位', 'degree', 'education', 'education_level', 'qualification', '最高学历', '學歷', '學位'],
  gpa: ['gpa', '绩点', '平均成绩', 'grade_point', 'grade_point_average', '平均学分绩点', '成绩排名', 'GPA'],
  rank: ['排名', '名次', 'rank', 'ranking', 'class_rank', '专业排名', '年级排名'],
  address: ['地址', '住址', '现居', '现居地', '居住地址', 'address', 'residence', 'location', 'current_address', 'home_address', '现居住地', '家庭住址', '聯繫地址', '現居地'],
  idCard: ['身份证', '身份证号', '证件号', 'idcard', 'id_card', 'identity', 'identity_card', 'id_number', 'certificate_number', '身份证件', '身份證', '身份證號'],
  politicalStatus: ['政治面貌', 'political', 'political_status', 'party', '政治面目'],
  languages: ['语言', '外语', '语言能力', 'language', 'languages', 'foreign_language', '外语能力', '語言能力'],
  skills: ['技能', '专业技能', 'skill', 'skills', 'technical_skills', 'competencies', '特长', '专业特长', '技能特长', '專業技能'],
  certificates: ['证书', '资格证', 'certificate', 'certificates', 'certification', 'qualifications', '资格证书', '职业资格', '證書'],
  awards: ['获奖', '奖项', '荣誉', 'award', 'awards', 'honor', 'honors', 'prize', 'prizes', '获奖情况', '荣誉称号', '獲獎', '榮譽'],
  company: ['公司', '企业', '单位', '公司名称', '企业名称', '单位名称', 'company', 'corporation', 'enterprise', 'organization', 'employer', 'work_company', 'intern_company', '工作单位', '实习单位', '所在公司', '公司名', '企業名稱'],
  position: ['岗位', '职位', '职务', '岗位名称', '职位名称', 'position', 'job_title', 'title', 'role', 'job', 'intern_position', 'job_name', '担任职务', '实习岗位', '工作岗位', '職位', '崗位'],
  startDate: ['开始时间', '开始日期', '入职时间', 'start', 'start_date', 'start_time', 'from', 'begin_date', '起始时间', '起始日期', '入学时间', '入司时间', '開始時間'],
  endDate: ['结束时间', '结束日期', '离职时间', 'end', 'end_date', 'end_time', 'to', 'finish_date', 'graduation_date', '截止时间', '截止日期', '毕业时间', '结束年月', '結束時間'],
  description: ['工作内容', '工作职责', '项目描述', '描述', 'description', 'responsibilities', 'duties', 'summary', 'details', '工作描述', '职责描述', '主要职责', '工作经历描述', '项目介绍', '工作內容', '工作職責', '详细内容', '详细描述', '项目详情', '具体内容', '内容详情', '项目内容'],
  achievements: ['工作成果', '项目成果', '业绩', '成果', 'achievement', 'achievements', 'accomplishments', 'outcome', 'results', '主要业绩', '工作业绩', '项目业绩', '獲獎成果'],
  projectName: ['项目名称', '项目名', 'project', 'project_name', 'project_title', '项目全称', '項目名稱'],
  role: ['角色', '担任角色', 'role', 'position_in_project', '项目角色', '担任职务'],
  courses: ['主修课程', '课程', 'course', 'courses', 'main_courses', 'subjects', '核心课程', '专业课程'],
  // 新增：网申常见字段
  hometown: ['籍贯', '户籍', '户口', 'hometown', 'native_place', 'origin', '户籍所在地', '籍貫', '老家'],
  currentCity: ['现居', '现居地', '现居住地', '居住城市', '所在城市', 'current_city', 'current_residence', '现居城市', '目前所在地', '所在地'],
  nation: ['民族', 'nation', 'nationality', 'ethnic'],
  height: ['身高', 'height', 'stature'],
  weight: ['体重', 'weight'],
  marriage: ['婚姻', '婚否', '婚姻状况', 'marital', 'marriage', 'marital_status'],
  wechat: ['微信', 'wechat', 'weixin', 'qq', '微信号'],
  emergencyContact: ['紧急联系人', 'emergency', 'emergency_contact', '紧急联系'],
  expectedSalary: ['期望薪资', '期望工资', '期望月薪', 'salary', 'expected_salary', '薪资要求', '待遇要求', '税前月薪', '期望薪酬'],
  expectedCity: ['期望城市', '期望工作城市', '工作城市', 'expected_city', 'city_preference', '意向城市', '期望地点', '工作地点'],
  expectedPosition: ['期望岗位', '期望职位', '意向岗位', 'expected_position', 'job_intention', '求职意向', '目标岗位', '应聘岗位'],
  expectedIndustry: ['期望行业', '意向行业', 'expected_industry', 'industry_preference', '目标行业', '意向行业类别'],
  availableDate: ['到岗时间', '可到岗时间', '入职时间', 'available_date', 'start_date', '到岗日期', '可入职时间', '预计到岗', '报到时间'],
  jobStatus: ['求职状态', '工作状态', '就业状态', 'job_status', 'employment_status', '当前状态', '求职意向状态'],
  selfEvaluation: ['自我评价', '个人评价', 'self_evaluation', 'personal_evaluation', '自我介绍', '个人总结', '自我描述', '个人优势'],
  jobObjective: ['求职意向', '求职目标', 'job_objective', 'career_objective', '求职方向']
};

// 从元素提取可用于匹配的文本
function getFieldText(el) {
  let text = '';

  // 1. 优先使用 input 自身的属性（最可靠）
  if (el.name) text += ' ' + el.name;
  if (el.id) text += ' ' + el.id;
  if (el.placeholder) text += ' ' + el.placeholder;
  if (el.getAttribute('aria-label')) text += ' ' + el.getAttribute('aria-label');

  // select 元素：获取第一个 option 的文本（通常是默认提示，如"选择开始时间"）
  if (el.tagName === 'SELECT') {
    const firstOption = el.querySelector('option');
    if (firstOption && firstOption.textContent) {
      text += ' ' + firstOption.textContent;
    }
    // 也获取所有 option 的文本，帮助识别
    const allOptions = el.querySelectorAll('option');
    for (const opt of allOptions) {
      if (opt.textContent && opt.textContent.length < 15) {
        text += ' ' + opt.textContent;
      }
    }
  }

  // data-* 属性中的字段名
  for (const attr of el.attributes) {
    if (attr.name.startsWith('data-') && (attr.name.includes('field') || attr.name.includes('prop') || attr.name.includes('key'))) {
      text += ' ' + attr.value;
    }
  }

  // 2. 关联的 label（for 属性）
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label) text += ' ' + label.textContent;
  }

  // 3. 只向上查找 2 层，找最近的直接关联 label（避免把整个页面的 label 都加进来）
  let parent = el.parentElement;
  let depth = 0;
  let foundLabel = false;
  while (parent && depth < 3 && !foundLabel) {
    // 只查找直接子元素中的 label（不是所有后代）
    const directLabels = parent.querySelectorAll(':scope > label, :scope > .label, :scope > [class*="form-item-label"], :scope > [class*="field-label"], :scope > [class*="input-label"]');
    for (const labelEl of directLabels) {
      if (labelEl !== el && !labelEl.contains(el)) {
        const labelText = labelEl.textContent.trim();
        if (labelText && labelText.length < 20) {
          text += ' ' + labelText;
          foundLabel = true;
          break;
        }
      }
    }

    // 如果父元素本身就是 label 或包含 label 文本在前面
    if (!foundLabel) {
      // 查找父元素中第一个文本节点（很多表单把 label 文本直接放在 input 前面）
      const children = parent.childNodes;
      for (const child of children) {
        if (child === el) break;
        if (child.nodeType === Node.TEXT_NODE) {
          const t = child.textContent.trim();
          if (t && t.length < 20 && t.length > 1) {
            text += ' ' + t;
            foundLabel = true;
            break;
          }
        }
        if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'INPUT' && child.tagName !== 'TEXTAREA' && child.tagName !== 'SELECT') {
          const t = child.textContent.trim();
          if (t && t.length < 20 && t.length > 1) {
            text += ' ' + t;
            foundLabel = true;
            break;
          }
        }
      }
    }

    if (parent.tagName === 'LABEL') {
      text += ' ' + parent.textContent;
      foundLabel = true;
    }

    parent = parent.parentElement;
    depth++;
  }

  // 4. 如果元素在 iframe 内部（富文本编辑器），查找 iframe 外部的 label
  if (el.__ownerIframe) {
    const iframe = el.__ownerIframe;

    // TinyMCE 专用处理：向上找到 .tox-tinymce 容器，然后在其父元素中找 label
    let tinymceContainer = null;
    let p = iframe.parentElement;
    while (p && !tinymceContainer) {
      if (p.classList && (p.classList.contains('tox-tinymce') || p.classList.contains('tox'))) {
        tinymceContainer = p;
      }
      p = p.parentElement;
    }
    if (tinymceContainer && tinymceContainer.parentElement) {
      const formItem = tinymceContainer.parentElement;
      // 在表单项中查找 label
      const labelInForm = formItem.querySelector('label, .label, [class*="form-item-label"], [class*="field-label"], [class*="input-label"], [class*="title"], [class*="name"]');
      if (labelInForm) {
        const labelText = labelInForm.textContent.trim();
        if (labelText && labelText.length < 20) {
          text += ' ' + labelText;
        }
      }
      // 查找 tinymce 容器前面的兄弟元素中的文本
      const children = formItem.childNodes;
      for (const child of children) {
        if (child === tinymceContainer) break;
        if (child.nodeType === Node.TEXT_NODE) {
          const t = child.textContent.trim();
          if (t && t.length < 20 && t.length > 1) {
            text += ' ' + t;
            break;
          }
        }
        if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
          const t = child.textContent.trim();
          if (t && t.length < 20 && t.length > 1) {
            text += ' ' + t;
            break;
          }
        }
      }
    }

    // 通用处理：向上查找 label
    if (!text.includes('详细') && !text.includes('描述') && !text.includes('内容')) {
      let iframeParent = iframe.parentElement;
      let iframeDepth = 0;
      while (iframeParent && iframeDepth < 8) {
        const labelElements = iframeParent.querySelectorAll(':scope > label, :scope > .label, :scope > [class*="form-item-label"], :scope > [class*="field-label"], :scope > [class*="input-label"], :scope > [class*="title"], :scope > [class*="name"]');
        for (const labelEl of labelElements) {
          if (labelEl !== iframe && !labelEl.contains(iframe)) {
            const labelText = labelEl.textContent.trim();
            if (labelText && labelText.length < 20) {
              text += ' ' + labelText;
              break;
            }
          }
        }

        if (iframeParent) {
          const children = iframeParent.childNodes;
          for (const child of children) {
            if (child === iframe) break;
            if (child.nodeType === Node.TEXT_NODE) {
              const t = child.textContent.trim();
              if (t && t.length < 20 && t.length > 1) {
                text += ' ' + t;
                break;
              }
            }
            if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'IFRAME' && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
              const t = child.textContent.trim();
              if (t && t.length < 20 && t.length > 1) {
                text += ' ' + t;
                break;
              }
            }
          }
        }

        iframeParent = iframeParent.parentElement;
        iframeDepth++;
      }
    }
  }

  // 5. 如果元素在 shadow DOM 内部，查找 shadow DOM 外部的 label
  if (el.__ownerShadowRoot) {
    const shadowRoot = el.__ownerShadowRoot;
    const host = shadowRoot.host;
    if (host) {
      let shadowParent = host.parentElement;
      let shadowDepth = 0;
      while (shadowParent && shadowDepth < 5) {
        // 查找直接子元素中的 label 或标题文本
        const labelElements = shadowParent.querySelectorAll(':scope > label, :scope > .label, :scope > [class*="form-item-label"], :scope > [class*="field-label"], :scope > [class*="input-label"], :scope > [class*="title"], :scope > [class*="name"]');
        for (const labelEl of labelElements) {
          if (labelEl !== host && !labelEl.contains(host)) {
            const labelText = labelEl.textContent.trim();
            if (labelText && labelText.length < 20) {
              text += ' ' + labelText;
              break;
            }
          }
        }

        // 查找 host 前面的兄弟元素中的文本
        if (shadowParent) {
          const children = shadowParent.childNodes;
          for (const child of children) {
            if (child === host) break;
            if (child.nodeType === Node.TEXT_NODE) {
              const t = child.textContent.trim();
              if (t && t.length < 20 && t.length > 1) {
                text += ' ' + t;
                break;
              }
            }
            if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
              const t = child.textContent.trim();
              if (t && t.length < 20 && t.length > 1) {
                text += ' ' + t;
                break;
              }
            }
          }
        }

        shadowParent = shadowParent.parentElement;
        shadowDepth++;
      }
    }
  }

  return text.toLowerCase();
}

// 识别字段类型
function detectFieldType(el) {
  const text = getFieldText(el);
  if (!text.trim()) return null;

  // 判断元素类型
  const isTextarea = el.tagName === 'TEXTAREA' || isContentEditable(el);
  const isSelect = el.tagName === 'SELECT';

  // 短文本字段（不应该出现在 textarea/富文本编辑器中）
  const shortTextFields = ['phone', 'email', 'birthday', 'gender', 'idCard', 'wechat', 'height', 'weight'];

  let bestMatch = null;
  let bestScore = 0;

  for (const [fieldType, keywords] of Object.entries(FIELD_KEYWORDS)) {
    // textarea/富文本编辑器不匹配短文本字段（避免"优势内容"被误识别成手机号）
    if (isTextarea && shortTextFields.includes(fieldType)) continue;

    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        const score = kw.length; // 关键词越长，匹配越精确
        if (score > bestScore) {
          bestScore = score;
          bestMatch = fieldType;
        }
      }
    }
  }
  return bestMatch;
}

// 判断字段属于哪类经历
function getExperienceType(fieldType) {
  const educationFields = ['school', 'major', 'degree', 'gpa', 'rank', 'courses'];
  const internshipFields = ['company', 'position'];
  const projectFields = ['projectName', 'role'];

  if (educationFields.includes(fieldType)) return 'education';
  if (internshipFields.includes(fieldType)) return 'internship';
  if (projectFields.includes(fieldType)) return 'project';
  return null;
}

// 判断是否是经历的标识字段（遇到时计数器+1）
function isIdentifierField(fieldType) {
  return fieldType === 'school' || fieldType === 'company' || fieldType === 'projectName';
}

// 从用户数据中获取字段对应的值（支持经历序号）
function getValueForField(fieldType, userData, experienceType, index) {
  const b = userData.basicInfo || {};
  const s = userData.skills || {};
  const j = userData.jobPreference || {};
  const idx = index || 0;

  // 基本信息
  if (fieldType === 'name') return b.name || '';
  if (fieldType === 'phone') return b.phone || '';
  if (fieldType === 'email') return b.email || '';
  if (fieldType === 'gender') return b.gender || '';
  if (fieldType === 'birthday') return b.birthday || '';
  if (fieldType === 'address') return b.currentCity || b.address || '';
  if (fieldType === 'currentCity') return b.currentCity || b.address || '';
  if (fieldType === 'hometown') return b.hometown || '';
  if (fieldType === 'idCard') return b.idCard || '';
  if (fieldType === 'politicalStatus') return b.politicalStatus || '';
  if (fieldType === 'selfEvaluation') return b.selfEvaluation || '';

  // 求职意向
  if (fieldType === 'expectedCity') return j.expectedCity || '';
  if (fieldType === 'expectedSalary') return j.expectedSalary || '';
  if (fieldType === 'availableDate') return j.availableDate || '';
  if (fieldType === 'jobStatus') return j.jobStatus || '';
  if (fieldType === 'expectedPosition') return j.expectedPosition || '';
  if (fieldType === 'expectedIndustry') return j.expectedIndustry || '';
  if (fieldType === 'jobObjective') return j.expectedPosition || j.expectedIndustry || '';

  // 技能证书
  if (fieldType === 'languages') return s.languages || '';
  if (fieldType === 'skills') return s.professionalSkills || '';
  if (fieldType === 'certificates') return s.certificates || '';
  if (fieldType === 'awards') return s.awards || '';

  // 根据经历类型取对应序号的数据
  let expData = {};
  if (experienceType === 'education') {
    expData = (userData.education && userData.education[idx]) || {};
  } else if (experienceType === 'internship') {
    expData = (userData.internship && userData.internship[idx]) || {};
  } else if (experienceType === 'project') {
    expData = (userData.project && userData.project[idx]) || {};
  }

  // 教育经历字段
  if (fieldType === 'school') return expData.school || '';
  if (fieldType === 'major') return expData.major || '';
  if (fieldType === 'degree') return expData.degree || '';
  if (fieldType === 'gpa') return expData.gpa || '';
  if (fieldType === 'rank') return expData.rank || '';
  if (fieldType === 'courses') return expData.courses || '';

  // 实习/工作经历字段
  if (fieldType === 'company') return expData.company || '';
  if (fieldType === 'position') return expData.position || '';

  // 项目经历字段
  if (fieldType === 'projectName') return expData.name || '';
  if (fieldType === 'role') return expData.role || '';

  // 通用字段（开始/结束时间、描述、成果）根据当前经历类型取
  if (fieldType === 'startDate') return expData.startDate || '';
  if (fieldType === 'endDate') return expData.endDate || '';
  if (fieldType === 'description') return expData.description || '';
  if (fieldType === 'achievements') return expData.achievements || '';

  return '';
}

// 设置 input/textarea 的值（触发 React/Vue 等框架的事件）
function setInputValue(el, value) {
  if (!value) return false;

  // 检测是否在 Element UI 组件内（el-select / el-date-picker 等）
  const isElementUI = !!(el.closest && (el.closest('.el-select') || el.closest('.el-date-editor') || el.closest('.el-cascader') || el.closest('.el-time-editor')));
  // 检测是否在 iView / View UI 组件内
  const isIView = !!(el.closest && (el.closest('.ivu-date-picker') || el.closest('.ivu-select') || el.closest('.ivu-cascader') || el.closest('.ivu-time-picker') || el.closest('.ivu-date-picker-rel')));
  // 检测是否在通用自定义下拉/日期选择器内
  const isGenericPicker = !!(el.closest && (el.closest('[class*="date-picker"]') || el.closest('[class*="time-picker"]') || el.closest('[class*="select-picker"]') || el.closest('[class*="dropdown-picker"]') || el.closest('[class*="year-month"]') || el.closest('[class*="month-picker"]') || el.closest('[class*="datepicker"]') || el.closest('[class*="timepicker"]')));

  // 对于 React 16+ / Vue 受控组件，需要用原生 setter
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  setter.call(el, value);

  if (isElementUI || isIView || isGenericPicker) {
    // Element UI / iView 组件需要触发更多事件才能更新内部状态
    el.dispatchEvent(new Event('focus', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));

    // 尝试通过 Vue 组件实例设置值
    try {
      const componentEl = el.closest('.ivu-date-picker') || el.closest('.ivu-select') || el.closest('.ivu-cascader') || el.closest('.el-select') || el.closest('.el-date-editor') || el;
      if (componentEl && componentEl.__vue__) {
        const vueInstance = componentEl.__vue__;
        if (vueInstance.$emit) {
          vueInstance.$emit('input', value);
          vueInstance.$emit('change', value);
          vueInstance.$emit('on-change', value);
        }
        if (vueInstance.hasOwnProperty('currentValue')) {
          vueInstance.currentValue = value;
        }
        if (vueInstance.hasOwnProperty('selectedLabel')) {
          vueInstance.selectedLabel = value;
        }
        if (vueInstance.hasOwnProperty('value')) {
          vueInstance.value = value;
        }
        // iView DatePicker 特殊属性
        if (vueInstance.hasOwnProperty('date')) {
          vueInstance.date = value;
        }
      }
    } catch (e) {
      // Vue 实例访问失败，忽略
    }
  } else {
    // 普通 input/textarea
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  return true;
}

// 设置 contenteditable 富文本编辑器的值
function setContentEditableValue(el, value) {
  if (!value) return false;

  const doc = el.ownerDocument || document;

  // TinyMCE 专用处理：如果元素是 TinyMCE 的 contenteditable body
  if (el.id === 'tinymce' || (el.classList && el.classList.contains('mce-content-body'))) {
    try {
      // 直接设置 innerHTML
      el.innerHTML = value;
      // 触发 input 事件
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));

      // 同步更新 TinyMCE 关联的隐藏 textarea
      if (el.__ownerIframe) {
        const iframe = el.__ownerIframe;
        const iframeId = iframe.id;
        // TinyMCE 的 textarea id 通常和 iframe 相关，或者在 iframe 附近
        const container = iframe.closest('.tox-tinymce') || iframe.parentElement.parentElement;
        if (container) {
          const textarea = container.previousElementSibling;
          if (textarea && textarea.tagName === 'TEXTAREA') {
            textarea.value = value;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }

      // 尝试调用 TinyMCE API（如果可用）
      try {
        if (window.tinymce && window.tinymce.activeEditor) {
          window.tinymce.activeEditor.setContent(value);
        }
      } catch (e) {
        // TinyMCE API 不可用，忽略
      }

      return true;
    } catch (e) {
      // 降级到通用方案
    }
  }

  try {
    // 聚焦元素
    el.focus();

    // 用 execCommand 插入文本（使用元素所在的 document，支持 iframe 内部的富文本编辑器）
    doc.execCommand('selectAll', false, null);
    doc.execCommand('insertText', false, value);

    // 触发事件
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));

    return true;
  } catch (e) {
    // 降级方案：直接设置 innerText
    try {
      el.innerText = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } catch (e2) {
      return false;
    }
  }
}

// 设置 select 下拉框的值
function setSelectValue(el, value) {
  if (!value) return false;

  const options = el.querySelectorAll('option');
  let matched = false;

  // 精确匹配
  for (const opt of options) {
    if (opt.textContent.trim() === value || opt.value === value) {
      el.value = opt.value;
      matched = true;
      break;
    }
  }

  // 模糊匹配
  if (!matched) {
    for (const opt of options) {
      if (opt.textContent.includes(value) || value.includes(opt.textContent)) {
        el.value = opt.value;
        matched = true;
        break;
      }
    }
  }

  // 日期格式模糊匹配（如 "2022-09" 匹配 "2022年09月"、"2022.09"、"2022/09" 等）
  if (!matched) {
    // 尝试提取日期中的年和月
    const dateMatch = value.match(/(\d{4})[-\/.年](\d{1,2})/);
    if (dateMatch) {
      const year = dateMatch[1];
      const month = dateMatch[2].padStart(2, '0');
      const monthShort = dateMatch[2];

      // 尝试多种日期格式
      const dateFormats = [
        `${year}年${month}月`,
        `${year}年${monthShort}月`,
        `${year}-${month}`,
        `${year}-${monthShort}`,
        `${year}.${month}`,
        `${year}.${monthShort}`,
        `${year}/${month}`,
        `${year}/${monthShort}`,
        `${year}${month}`,
        `${year}.${month}.01`,
        `${year}-${month}-01`
      ];

      for (const fmt of dateFormats) {
        for (const opt of options) {
          if (opt.textContent.trim() === fmt || opt.value === fmt || opt.textContent.includes(fmt)) {
            el.value = opt.value;
            matched = true;
            break;
          }
        }
        if (matched) break;
      }

      // 如果还没匹配，尝试只匹配年份和月份的数字
      if (!matched) {
        for (const opt of options) {
          const optText = opt.textContent.trim();
          if (optText.includes(year) && optText.includes(month)) {
            el.value = opt.value;
            matched = true;
            break;
          }
        }
      }
    }
  }

  if (matched) {
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  return matched;
}

// 判断是否是自定义下拉组件（React/Vue等框架的下拉选择器）
function isCustomSelect(el) {
  if (!el || el.tagName !== 'INPUT') return false;

  // 只有只读的input才可能是下拉触发元素
  if (!el.readOnly) return false;

  // 父元素class明确包含select/dropdown/picker
  const parent = el.parentElement;
  if (parent) {
    const parentClass = typeof parent.className === 'string' ? parent.className : '';
    if (parentClass.includes('select') || parentClass.includes('dropdown') ||
        parentClass.includes('picker') || parentClass.includes('cascader')) {
      return true;
    }
  }

  // 自身的placeholder包含"选择"字样
  const placeholder = el.placeholder || '';
  if (placeholder.includes('选择') || placeholder.includes('请选择') || placeholder.includes('select')) {
    return true;
  }

  return false;
}

// 填充自定义下拉组件（通用方法）
async function fillCustomSelect(el, value, fieldType) {
  if (!el || !value) return false;

  try {
    showDebug(`尝试填充自定义下拉: ${fieldType} = ${value}`);

    // 方法1：如果是可输入的搜索下拉，先输入文字
    if (!el.readOnly) {
      // 先清空原有内容
      el.focus();
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));

      // 输入目标值
      const proto = HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));

      await sleep(500);

      // 查找下拉面板中的选项，点击第一个匹配的
      const option = findAndClickOption(value);
      if (option) {
        showDebug(`搜索下拉填充成功: ${fieldType}`);
        return true;
      }
    }

    // 方法2：点击打开下拉面板，然后选择选项
    simulateClick(el);
    await sleep(500);

    // 查找下拉面板中的选项
    const option = findAndClickOption(value);
    if (option) {
      showDebug(`下拉面板填充成功: ${fieldType}`);
      return true;
    }

    // 方法3：尝试点击父元素（有些下拉组件的触发元素是父元素）
    const parent = el.parentElement;
    if (parent) {
      simulateClick(parent);
      await sleep(500);
      const option2 = findAndClickOption(value);
      if (option2) {
        showDebug(`父元素下拉填充成功: ${fieldType}`);
        return true;
      }
    }

    showDebug(`自定义下拉填充失败: ${fieldType}`);
    return false;
  } catch (e) {
    showDebug(`自定义下拉异常: ${e.message}`);
    return false;
  }
}

// 查找并点击下拉面板中的匹配选项
function findAndClickOption(value) {
  // 查找所有可见的下拉面板
  const panels = document.querySelectorAll('[class*="select-dropdown"], [class*="dropdown-menu"], [class*="picker-panel"], [class*="select-panel"], [class*="options"], [class*="list"], [role="listbox"], [role="menu"]');

  for (const panel of panels) {
    if (panel.offsetParent === null) continue; // 不可见

    // 查找面板中的所有选项
    const options = panel.querySelectorAll('li, [role="option"], [class*="option"], [class*="item"], div, span');

    for (const opt of options) {
      if (opt.children.length > 0) continue; // 只看叶子节点
      const text = opt.textContent.trim();
      if (!text || text.length > 50) continue;

      // 精确匹配
      if (text === value) {
        simulateClick(opt);
        return opt;
      }
    }

    // 模糊匹配
    for (const opt of options) {
      if (opt.children.length > 0) continue;
      const text = opt.textContent.trim();
      if (!text || text.length > 50) continue;

      if (text.includes(value) || value.includes(text)) {
        simulateClick(opt);
        return opt;
      }
    }
  }

  // 如果没找到特定面板，查找所有可见的、文本匹配的可点击元素
  const allElements = document.querySelectorAll('li, [role="option"], [class*="option"], [class*="item"]');
  for (const el of allElements) {
    if (el.offsetParent === null) continue;
    if (el.children.length > 0) continue;
    const text = el.textContent.trim();
    if (!text || text.length > 50) continue;

    if (text === value || text.includes(value) || value.includes(text)) {
      simulateClick(el);
      return el;
    }
  }

  return null;
}

// 设置 radio/checkbox
function setRadioValue(el, fieldType, value) {
  if (!value) return false;

  // 找到同组的 radio/checkbox
  const name = el.name;
  if (!name) return false;

  const group = document.querySelectorAll(`input[name="${name}"]`);
  for (const input of group) {
    const labelText = (input.parentElement && input.parentElement.textContent) || '';
    const valueText = input.value || '';
    if (labelText.includes(value) || valueText.includes(value)) {
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('click', { bubbles: true }));
      return true;
    }
  }
  return false;
}

// 等待函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 页面调试浮层（在页面上显示调试信息，无需打开控制台）
let debugOverlay = null;
function showDebug(message) {
  try {
    if (!debugOverlay) {
      debugOverlay = document.createElement('div');
      debugOverlay.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;background:rgba(0,0,0,0.85);color:#fff;padding:12px 16px;border-radius:8px;font-size:13px;max-width:400px;max-height:300px;overflow-y:auto;line-height:1.6;';
      document.body.appendChild(debugOverlay);
    }
    const time = new Date().toLocaleTimeString();
    debugOverlay.innerHTML += `<div>[${time}] ${message}</div>`;
    debugOverlay.scrollTop = debugOverlay.scrollHeight;
    // 5秒后清除
    clearTimeout(debugOverlay._timer);
    debugOverlay._timer = setTimeout(() => {
      if (debugOverlay) {
        debugOverlay.remove();
        debugOverlay = null;
      }
    }, 8000);
  } catch (e) {
    // 忽略
  }
}

// 通过React内部状态设置年月选择器的值（BOSS直聘等React网站）
async function fillReactYearMonthPicker(pickerEl, yearMonthValue) {
  const dateMatch = yearMonthValue.match(/(\d{4})[-\/.年](\d{1,2})/);
  if (!dateMatch) {
    showDebug('年月值解析失败: ' + yearMonthValue);
    return false;
  }
  const targetYear = parseInt(dateMatch[1]);
  const targetMonth = parseInt(dateMatch[2]);
  const formattedValue = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

  try {
    // 查找React Fiber节点（React 16+）
    const fiberKey = Object.keys(pickerEl).find(key =>
      key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
    );

    if (!fiberKey) {
      showDebug('未找到React Fiber节点，尝试其他元素...');
      // 尝试在子元素中查找
      const children = pickerEl.querySelectorAll('*');
      for (const child of children) {
        const childFiberKey = Object.keys(child).find(key =>
          key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
        );
        if (childFiberKey) {
          return fillReactYearMonthPicker(child, yearMonthValue);
        }
      }
      return false;
    }

    let fiber = pickerEl[fiberKey];
    showDebug('找到React Fiber节点');

    // 方法1：向上遍历Fiber树，找到有onChange回调的组件
    let current = fiber;
    let depth = 0;
    while (current && depth < 25) {
      const props = current.memoizedProps;
      if (props && typeof props.onChange === 'function') {
        // 尝试调用onChange，传入不同格式的值
        const valueFormats = [
          formattedValue,
          `${targetYear}年${targetMonth}月`,
          `${targetYear}.${String(targetMonth).padStart(2, '0')}`,
          { year: targetYear, month: targetMonth },
          new Date(targetYear, targetMonth - 1, 1)
        ];

        for (const val of valueFormats) {
          try {
            props.onChange(val);
            showDebug('已通过onChange回调设置值: ' + (typeof val === 'object' ? JSON.stringify(val) : val));
            await sleep(300);
            // 检查是否设置成功（触发元素的文本是否变化）
            return true;
          } catch (e) {
            // 继续尝试下一种格式
          }
        }
      }
      current = current.return;
      depth++;
    }

    // 方法2：找到有stateNode的类组件，直接调用setState
    current = fiber;
    depth = 0;
    while (current && depth < 25) {
      if (current.stateNode && current.stateNode.state && typeof current.stateNode.setState === 'function') {
        const state = current.stateNode.state;
        const stateKeys = Object.keys(state);
        showDebug('找到类组件，state keys: ' + stateKeys.join(', '));

        for (const key of stateKeys) {
          if (key.includes('time') || key.includes('date') || key.includes('month') || key.includes('year') || key.includes('start') || key.includes('end') || key.includes('value')) {
            try {
              current.stateNode.setState({ [key]: formattedValue });
              showDebug('已通过setState设置: ' + key + ' = ' + formattedValue);
              await sleep(300);
              return true;
            } catch (e) {
              // 继续尝试
            }
          }
        }
      }
      current = current.return;
      depth++;
    }

    // 方法3：查找props中的value和onChange，直接修改
    current = fiber;
    depth = 0;
    while (current && depth < 25) {
      const props = current.memoizedProps;
      if (props && props.value !== undefined && typeof props.onChange === 'function') {
        try {
          props.onChange(formattedValue);
          showDebug('已通过value+onChange模式设置: ' + formattedValue);
          await sleep(300);
          return true;
        } catch (e) {
          // 继续
        }
      }
      current = current.return;
      depth++;
    }

    showDebug('React内部状态设置失败，所有方法均未成功');
    return false;
  } catch (e) {
    showDebug('React内部状态异常: ' + e.message);
    console.error('[秋招网申一键填表] React年月选择器填充失败:', e);
    return false;
  }
}

// 模拟鼠标点击（触发完整的鼠标事件序列）
function simulateClick(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const eventInit = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y };
  el.dispatchEvent(new MouseEvent('mousedown', eventInit));
  el.dispatchEvent(new MouseEvent('mouseup', eventInit));
  el.dispatchEvent(new MouseEvent('click', eventInit));
}

// 模拟点击选择年月（用于BOSS直聘等自定义年月选择器）
async function fillYearMonthPicker(pickerEl, yearMonthValue) {
  if (!pickerEl || !yearMonthValue) return false;

  // 解析年月值（支持 "2022-09"、"2022.09"、"2022年09月" 等格式）
  const dateMatch = yearMonthValue.match(/(\d{4})[-\/.年](\d{1,2})/);
  if (!dateMatch) {
    showDebug('年月值解析失败: ' + yearMonthValue);
    return false;
  }
  const targetYear = parseInt(dateMatch[1]);
  const targetMonth = parseInt(dateMatch[2]);
  showDebug(`开始填充年月: ${targetYear}年${targetMonth}月`);

  try {
    // 点击选择器，打开年月面板
    simulateClick(pickerEl);
    await sleep(500);

    // 查找弹出的年月选择面板：查找所有可见的、包含至少6个月份的元素
    let panel = null;
    const allDivs = document.querySelectorAll('div, ul, section');
    for (const p of allDivs) {
      if (p.offsetParent === null) continue; // 不可见
      const text = p.textContent || '';
      let monthCount = 0;
      for (let m = 1; m <= 12; m++) {
        if (text.includes(m + '月') || text.includes(String(m).padStart(2, '0') + '月')) {
          monthCount++;
        }
      }
      if (monthCount >= 6) {
        // 选择最小的包含月份的元素（最具体的面板）
        if (!panel || p.querySelectorAll('*').length < panel.querySelectorAll('*').length) {
          panel = p;
        }
      }
    }

    if (!panel) {
      showDebug('未找到年月选择面板');
      return false;
    }
    showDebug('找到年月选择面板');

    // 选择年份：查找面板中包含4位数字年份的元素
    let currentYear = targetYear;
    const allElementsInPanel = panel.querySelectorAll('*');
    for (const el of allElementsInPanel) {
      if (el.children.length === 0) { // 只看叶子节点
        const text = el.textContent.trim();
        const yearMatch = text.match(/^(\d{4})年?$/);
        if (yearMatch) {
          currentYear = parseInt(yearMatch[1]);
          showDebug('当前年份: ' + currentYear);
          break;
        }
      }
    }

    // 如果年份不对，点击上一年/下一年按钮切换
    let yearAttempts = 0;
    while (currentYear !== targetYear && yearAttempts < 30) {
      // 查找面板中的箭头按钮（通常是包含 < 或 > 或 箭头的元素）
      const clickables = panel.querySelectorAll('button, [role="button"], [class*="arrow"], [class*="prev"], [class*="next"], [class*="left"], [class*="right"], span, i, em');
      let clicked = false;
      for (const btn of clickables) {
        const text = btn.textContent.trim();
        const className = typeof btn.className === 'string' ? btn.className : '';
        const isPrev = text === '<' || text === '《' || text === '‹' || className.includes('prev') || className.includes('left') || className.includes('arrow-left');
        const isNext = text === '>' || text === '》' || text === '›' || className.includes('next') || className.includes('right') || className.includes('arrow-right');

        if (targetYear < currentYear && isPrev) {
          simulateClick(btn);
          currentYear--;
          clicked = true;
          break;
        } else if (targetYear > currentYear && isNext) {
          simulateClick(btn);
          currentYear++;
          clicked = true;
          break;
        }
      }
      if (!clicked) {
        showDebug('未找到年份切换按钮，当前年份: ' + currentYear);
        break;
      }
      await sleep(200);
      yearAttempts++;
    }

    showDebug('年份切换完成，目标年份: ' + targetYear + ', 当前: ' + currentYear);
    await sleep(300);

    // 选择月份：查找面板中所有文本为"X月"的可点击元素
    const monthCandidates = panel.querySelectorAll('li, span, div, button, [class*="cell"], [class*="month"]');
    // 中文月份映射
    const chineseMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const targetChineseMonth = chineseMonths[targetMonth - 1] || '';

    for (const item of monthCandidates) {
      if (item.children.length > 0) continue; // 只看叶子节点
      const text = item.textContent.trim();
      const monthMatch = text.match(/^(\d{1,2})月$/);
      // 匹配数字格式"X月"或中文格式"一月"等
      if ((monthMatch && parseInt(monthMatch[1]) === targetMonth) || (targetChineseMonth && text === targetChineseMonth)) {
        simulateClick(item);
        showDebug('已选择月份: ' + text);
        await sleep(300);
        return true;
      }
    }

    // 如果没找到"X月"格式，尝试查找纯数字
    for (const item of panel.querySelectorAll('li, span, div, button, [class*="cell"]')) {
      if (item.children.length > 0) continue;
      const text = item.textContent.trim();
      if (text === String(targetMonth) || text === String(targetMonth).padStart(2, '0')) {
        simulateClick(item);
        showDebug('已选择月份(数字): ' + targetMonth);
        await sleep(300);
        return true;
      }
    }

    showDebug('未找到月份选项: ' + targetMonth + '月 / ' + targetChineseMonth);
    return false;
  } catch (e) {
    showDebug('年月选择器填充异常: ' + e.message);
    console.error('[秋招网申一键填表] 年月选择器填充失败:', e);
    return false;
  }
}

// 高亮已填充的字段（绿色边框闪烁）
function highlightField(el) {
  const originalOutline = el.style.outline;
  const originalBoxShadow = el.style.boxShadow;
  const originalTransition = el.style.transition;

  el.style.transition = 'all 0.3s ease';
  el.style.outline = '2px solid #52C41A';
  el.style.boxShadow = '0 0 8px rgba(82,196,26,0.5)';

  setTimeout(() => {
    el.style.outline = originalOutline;
    el.style.boxShadow = originalBoxShadow;
    el.style.transition = originalTransition;
  }, 2000);
}

// 判断元素是否是富文本编辑器（contenteditable 或常见富文本编辑器类名）
function isContentEditable(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  const ce = el.getAttribute('contenteditable');
  if (ce && ce !== 'false') return true;
  if (el.isContentEditable) return true;
  // 常见富文本编辑器类名
  const editorClasses = ['ql-editor', 'ProseMirror', 'editor-content', 'rich-editor', 'tox-edit-area', 'fr-element', 'cke_editable'];
  for (const cls of editorClasses) {
    if (el.classList && el.classList.contains(cls)) return true;
  }
  return false;
}

// 检查元素是否为空
function isFieldEmpty(el) {
  if (el.tagName === 'SELECT') {
    return !el.value || el.value === '';
  }
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    return !el.value || el.value.trim() === '';
  }
  if (isContentEditable(el)) {
    return !el.textContent || el.textContent.trim() === '';
  }
  return true;
}

// 全局经历计数器（用于弹窗形式的网站，如智联招聘：每次只显示一个项目经历）
let globalExpCounts = { education: 0, internship: 0, project: 0 };

// 获取单个文档中的所有表单元素（包括 shadow DOM 内部的）
function getFormElementsInDoc(doc) {
  let elements = [];

  // 普通查询
  const inputs = doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([disabled]):not([readonly])');
  const textareas = doc.querySelectorAll('textarea:not([disabled]):not([readonly])');
  const selects = doc.querySelectorAll('select:not([disabled])');
  // 扩展富文本编辑器匹配：所有 contenteditable 元素 + 常见编辑器类名
  const contentEditables = doc.querySelectorAll('[contenteditable]:not([disabled]):not([contenteditable="false"]), .ql-editor, .ProseMirror, .editor-content, .rich-editor, .el-editor, .wangEditor, .edui-editor, .cke_editable, .tox-edit-area, .fr-box, .jodit-editor, .trumbowyg-editor, .note-editable, .w-e-text-container, .w-e-text');

  elements = [...inputs, ...textareas, ...selects, ...contentEditables];

  // iView / View UI 组件支持：日期选择器、下拉选择器、级联选择器内部的 input（可能被隐藏）
  const ivuComponents = doc.querySelectorAll('.ivu-date-picker, .ivu-select, .ivu-cascader, .ivu-time-picker, .ivu-date-picker-rel');
  for (const comp of ivuComponents) {
    const compInputs = comp.querySelectorAll('input');
    for (const inp of compInputs) {
      // 标记为 iView 组件内部的 input，用于后续特殊处理
      inp.__ivuComponent = comp;
      if (!elements.includes(inp)) {
        elements.push(inp);
      }
    }
  }

  // Element UI 组件支持：日期选择器、下拉选择器内部的 input
  const elComponents = doc.querySelectorAll('.el-date-editor, .el-select, .el-cascader, .el-time-editor');
  for (const comp of elComponents) {
    const compInputs = comp.querySelectorAll('input');
    for (const inp of compInputs) {
      inp.__elComponent = comp;
      if (!elements.includes(inp)) {
        elements.push(inp);
      }
    }
  }

  // 通用自定义下拉/日期选择器支持（匹配类名包含 date/time/picker/select/dropdown 的组件）
  const genericPickers = doc.querySelectorAll('[class*="date-picker"], [class*="time-picker"], [class*="select-picker"], [class*="dropdown-picker"], [class*="year-month"], [class*="month-picker"], [class*="datepicker"], [class*="timepicker"], [class*="date_select"], [class*="time_select"]');
  for (const comp of genericPickers) {
    const compInputs = comp.querySelectorAll('input');
    for (const inp of compInputs) {
      inp.__genericPicker = comp;
      if (!elements.includes(inp)) {
        elements.push(inp);
      }
    }
  }

  // 遍历所有元素，检查是否有 shadowRoot，递归查询 shadow DOM 内部的元素
  const allElements = doc.querySelectorAll('*');
  for (const el of allElements) {
    if (el.shadowRoot) {
      try {
        const shadowElements = getFormElementsInDoc(el.shadowRoot);
        for (const shadowEl of shadowElements) {
          shadowEl.__ownerShadowRoot = el.shadowRoot;
        }
        elements = elements.concat(shadowElements);
      } catch (e) {
        // shadow DOM 访问失败，跳过
      }
    }
  }

  return elements;
}

// 递归获取所有表单元素（包括 iframe 内部的，很多富文本编辑器基于 iframe）
function getAllFormElements(doc) {
  let elements = getFormElementsInDoc(doc);
  const iframes = doc.querySelectorAll('iframe');
  console.log('[秋招网申一键填表] 文档中 iframe 数量:', iframes.length);
  for (let i = 0; i < iframes.length; i++) {
    const iframe = iframes[i];
    try {
      const iframeDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
      if (iframeDoc) {
        const iframeElements = getAllFormElements(iframeDoc);
        console.log(`[秋招网申一键填表] iframe[${i}] 内部元素数量:`, iframeElements.length, 'class:', iframe.className, 'src:', iframe.src);
        // 给 iframe 内部的元素标记其所在 iframe，用于字段识别时查找外部 label
        for (const el of iframeElements) {
          el.__ownerIframe = iframe;
        }
        elements = elements.concat(iframeElements);
      } else {
        console.log(`[秋招网申一键填表] iframe[${i}] 无法访问 contentDocument（可能跨域）`);
      }
    } catch (e) {
      console.log(`[秋招网申一键填表] iframe[${i}] 访问失败（跨域）:`, e.message);
      // 跨域 iframe 无法访问，跳过
    }
  }
  return elements;
}

// 统计页面上某类标识字段的数量
function countIdentifierFields(elements, fieldType) {
  let count = 0;
  for (const el of elements) {
    const ft = detectFieldType(el);
    if (ft === fieldType) count++;
  }
  return count;
}

// 主填充函数
async function fillForm(options = {}) {
  const onlyEmpty = options.onlyEmpty || false;
  const result = {
    total: 0,
    filled: 0,
    skipped: 0,
    skippedNotEmpty: 0,
    details: [],
    filledFields: [],
    skippedNotEmptyFields: []
  };

  // 读取用户数据（优先用定制简历，否则用完整经历库）
  const data = await new Promise((resolve) => {
    chrome.storage.local.get(['userProfile', 'customResume'], (res) => resolve(res.customResume || res.userProfile || {}));
  });

  if (!data.basicInfo || !data.basicInfo.name) {
    return { error: '未找到个人信息，请先在管理面板中填写或上传简历' };
  }

  // 获取所有可填写的表单元素（包括富文本编辑器和 iframe 内部的元素）
  const radios = document.querySelectorAll('input[type="radio"]:not([disabled])');
  const allElements = getAllFormElements(document);

  // 调试日志：输出所有找到的元素
  console.log('[秋招网申一键填表] 找到表单元素数量:', allElements.length);
  console.log('[秋招网申一键填表] 页面 iframe 数量:', document.querySelectorAll('iframe').length);

  // 调试日志：查找页面上所有可能是时间选择器的元素（BOSS直聘等网站使用自定义组件）
  const allPageElements = document.querySelectorAll('*');
  const timePickers = [];
  for (const el of allPageElements) {
    const text = (el.textContent || '').trim();
    const className = typeof el.className === 'string' ? el.className : '';
    if ((text === '选择年月' || text === '选择时间' || text === '开始时间' || text === '结束时间' || className.includes('time-picker') || className.includes('date-picker') || className.includes('year-month') || className.includes('month-picker')) && el.children.length < 5) {
      timePickers.push({
        tag: el.tagName,
        class: className,
        text: text.substring(0, 30),
        children: el.children.length,
        outerHTML: el.outerHTML.substring(0, 200)
      });
    }
  }
  console.log('[秋招网申一键填表] 找到可能的时间选择器数量:', timePickers.length);
  for (let i = 0; i < timePickers.length; i++) {
    console.log(`[秋招网申一键填表] 时间选择器[${i}]:`, timePickers[i]);
  }
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    const fieldType = detectFieldType(el);
    const fieldText = getFieldText(el);
    const placeholder = el.placeholder || '';
    const value = el.value || '';
    const tag = el.tagName;
    const className = typeof el.className === 'string' ? el.className : '';
    console.log(`[秋招网申一键填表] 元素[${i}]: tag=${tag}, class=${className}, placeholder="${placeholder}", value="${value}", fieldType=${fieldType}, fieldText="${fieldText.substring(0, 80)}"`);
  }

  // 检测是否是弹窗形式（页面上只有1个标识字段，如智联招聘、前程无忧的新增经历弹窗）
  const projectNameCount = countIdentifierFields(allElements, 'projectName');
  const companyCount = countIdentifierFields(allElements, 'company');
  const schoolCount = countIdentifierFields(allElements, 'school');
  const isPopupMode = {
    project: projectNameCount <= 1,
    internship: companyCount <= 1,
    education: schoolCount <= 1
  };

  // 经历计数器和当前经历类型跟踪
  const expCounts = { education: 0, internship: 0, project: 0 };
  let currentExpType = null;
  let filledIdentifierTypes = new Set(); // 记录本次填充成功了哪些标识字段类型

  for (const el of allElements) {
    // 跳过不可见元素
    if (el.offsetParent === null && el.getClientRects().length === 0) continue;

    result.total++;
    const fieldType = detectFieldType(el);

    if (!fieldType) {
      result.skipped++;
      continue;
    }

    // 经历区块识别：遇到标识字段时更新当前经历类型和计数器
    const expType = getExperienceType(fieldType);
    if (expType) {
      currentExpType = expType;
      if (isIdentifierField(fieldType) && !isPopupMode[expType]) {
        expCounts[expType]++; // 页面形式才递增本地计数器
      }
    }

    // 只填空字段模式：跳过已有内容的字段
    if (onlyEmpty && !isFieldEmpty(el)) {
      result.skippedNotEmpty++;
      result.skippedNotEmptyFields.push(fieldType);
      continue;
    }

    // 确定当前字段的经历类型和序号
    let fieldExpType = currentExpType;
    let fieldExpIndex = 0;
    if (expType) {
      fieldExpType = expType;
      fieldExpIndex = isPopupMode[expType] ? globalExpCounts[expType] : Math.max(0, expCounts[expType] - 1);
    } else if (currentExpType) {
      fieldExpIndex = isPopupMode[currentExpType] ? globalExpCounts[currentExpType] : Math.max(0, expCounts[currentExpType] - 1);
    }

    const value = getValueForField(fieldType, data, fieldExpType, fieldExpIndex);
    if (!value) {
      result.skipped++;
      result.details.push({ field: fieldType, status: 'no_value' });
      continue;
    }

    let success = false;
    if (el.tagName === 'SELECT') {
      success = setSelectValue(el, value);
    } else if (el.tagName === 'TEXTAREA') {
      success = setInputValue(el, value);
    } else if (el.tagName === 'INPUT') {
      // 只有明确是自定义下拉组件时才用下拉填充方法
      if (isCustomSelect(el)) {
        // 先尝试普通填充，如果失败再用下拉方法
        success = setInputValue(el, value);
        if (!success) {
          success = await fillCustomSelect(el, value, fieldType);
        }
      } else {
        success = setInputValue(el, value);
      }
    } else if (isContentEditable(el)) {
      success = setContentEditableValue(el, value);
    }

    if (success) {
      result.filled++;
      result.filledFields.push(fieldType);
      result.details.push({ field: fieldType, status: 'filled', value: value.substring(0, 30) });
      highlightField(el);
      // 弹窗形式：记录成功填充的标识字段，最后全局计数器+1
      if (isIdentifierField(fieldType) && expType && isPopupMode[expType]) {
        filledIdentifierTypes.add(expType);
      }
    } else {
      result.skipped++;
      result.details.push({ field: fieldType, status: 'failed' });
    }
  }

  // 弹窗形式：成功填充标识字段后，全局计数器+1
  for (const expType of filledIdentifierTypes) {
    globalExpCounts[expType]++;
  }

  // 处理 radio（性别等）
  for (const radio of radios) {
    if (radio.checked) continue;
    const fieldType = detectFieldType(radio);
    if (fieldType === 'gender') {
      const value = getValueForField('gender', data);
      if (value) {
        const success = setRadioValue(radio, 'gender', value);
        if (success) {
          result.total++;
          result.filled++;
          result.filledFields.push('gender');
          result.details.push({ field: 'gender', status: 'filled' });
        }
      }
      break; // 只处理一组性别
    }
  }

  // 处理"至今"复选框（项目/实习/教育经历的结束时间为至今时自动勾选）
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:not([disabled])');
  const zhiJinCheckboxes = [];
  for (const cb of checkboxes) {
    const cbText = getFieldText(cb);
    if (cbText.includes('至今') || cbText.includes('在职') || cbText.includes('在读') || cbText.includes('仍在') || cbText.includes('present') || cbText.includes('now')) {
      zhiJinCheckboxes.push(cb);
    }
  }

  // 按从上到下的顺序，检查对应经历的结束时间是否为至今
  for (let i = 0; i < zhiJinCheckboxes.length; i++) {
    const cb = zhiJinCheckboxes[i];
    if (cb.checked) continue;

    // 尝试判断这个复选框属于哪类经历
    const cbText = getFieldText(cb);
    let expType = null;
    let expData = null;

    // 向上查找最近的经历区块标题
    let parent = cb.parentElement;
    let depth = 0;
    while (parent && depth < 10) {
      const parentText = parent.textContent || '';
      if (parentText.includes('项目') && !parentText.includes('项目时间')) {
        expType = 'project';
        break;
      }
      if (parentText.includes('工作') || parentText.includes('实习')) {
        expType = 'internship';
        break;
      }
      if (parentText.includes('教育') || parentText.includes('学校')) {
        expType = 'education';
        break;
      }
      parent = parent.parentElement;
      depth++;
    }

    // 如果无法从父元素判断，按顺序尝试
    if (!expType) {
      if (data.project && data.project[i]) {
        expType = 'project';
      } else if (data.internship && data.internship[i]) {
        expType = 'internship';
      } else if (data.education && data.education[i]) {
        expType = 'education';
      }
    }

    if (expType) {
      const expList = data[expType] || [];
      const expItem = expList[i] || expList[0];
      if (expItem && expItem.endDate) {
        const endDate = expItem.endDate.toLowerCase();
        if (endDate.includes('至今') || endDate.includes('现在') || endDate.includes('present') || endDate.includes('now') || endDate === '至今') {
          cb.click();
          cb.checked = true;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
          result.total++;
          result.filled++;
          result.filledFields.push('zhiJin');
          result.details.push({ field: '至今复选框', status: 'filled' });
        }
      }
    }
  }

  // 处理自定义年月选择器（BOSS直聘等网站使用点击弹出面板的选择器）
  const allElements2 = document.querySelectorAll('*');
  const yearMonthPickers = [];
  const seenClickables = new Set();
  for (const el of allElements2) {
    // 排除HTML、BODY等顶层元素
    if (el.tagName === 'HTML' || el.tagName === 'BODY') continue;
    // 排除子元素太多的大容器
    if (el.children.length > 5) continue;

    const text = (el.textContent || '').trim();
    // 只匹配文本很短且包含"选择年月"的元素（真正的触发元素，不是大容器）
    if (text && text.length <= 15 && (text === '选择年月' || text === '选择时间' || (text.includes('选择年月') && text.length <= 10))) {
      // 找到可点击的父元素（向上查找5层）
      let clickable = el;
      for (let i = 0; i < 5; i++) {
        if (clickable.parentElement) {
          clickable = clickable.parentElement;
          const style = window.getComputedStyle(clickable);
          if (clickable.onclick || clickable.getAttribute('role') === 'button' || style.cursor === 'pointer' || clickable.tagName === 'BUTTON') {
            break;
          }
        }
      }
      // 去重
      if (!seenClickables.has(clickable)) {
        seenClickables.add(clickable);
        yearMonthPickers.push({ el: clickable, text: text.substring(0, 20), originalEl: el });
      }
    }
  }

  showDebug('找到年月选择器数量: ' + yearMonthPickers.length);
  for (let i = 0; i < yearMonthPickers.length; i++) {
    showDebug(`选择器[${i}]: text=${yearMonthPickers[i].text}, tag=${yearMonthPickers[i].el.tagName}`);
  }

  // 按位置排序（从左到右），第一个通常是开始时间，第二个是结束时间
  yearMonthPickers.sort((a, b) => {
    const rectA = a.el.getBoundingClientRect();
    const rectB = b.el.getBoundingClientRect();
    return rectA.left - rectB.left;
  });

  // 获取项目经历的开始和结束时间
  const projectData = data.project && data.project[0] ? data.project[0] : {};
  const startDate = projectData.startDate || '';
  const endDate = projectData.endDate || '';
  showDebug('项目经历时间: start=' + startDate + ', end=' + endDate);

  // 填充开始时间（第一个选择器）
  if (yearMonthPickers.length >= 1 && startDate && startDate !== '至今') {
    showDebug('开始填充开始时间（优先React内部状态）...');
    // 优先使用React内部状态方法
    let success = await fillReactYearMonthPicker(yearMonthPickers[0].el, startDate);
    // 如果失败，回退到模拟点击方法
    if (!success) {
      showDebug('React方法失败，回退到模拟点击方法...');
      success = await fillYearMonthPicker(yearMonthPickers[0].el, startDate);
    }
    if (success) {
      result.total++;
      result.filled++;
      result.filledFields.push('startDate');
      result.details.push({ field: '开始时间', status: 'filled' });
      showDebug('开始时间填充成功');
    } else {
      showDebug('开始时间填充失败（所有方法均未成功）');
    }
    await sleep(300);
  }

  // 填充结束时间（第二个选择器）
  if (yearMonthPickers.length >= 2 && endDate && endDate !== '至今') {
    showDebug('开始填充结束时间（优先React内部状态）...');
    // 优先使用React内部状态方法
    let success = await fillReactYearMonthPicker(yearMonthPickers[1].el, endDate);
    // 如果失败，回退到模拟点击方法
    if (!success) {
      showDebug('React方法失败，回退到模拟点击方法...');
      success = await fillYearMonthPicker(yearMonthPickers[1].el, endDate);
    }
    if (success) {
      result.total++;
      result.filled++;
      result.filledFields.push('endDate');
      result.details.push({ field: '结束时间', status: 'filled' });
      showDebug('结束时间填充成功');
    } else {
      showDebug('结束时间填充失败（所有方法均未成功）');
    }
  }

  return result;
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    fillForm({ onlyEmpty: request.onlyEmpty || false }).then(result => {
      sendResponse(result);
    }).catch(err => {
      sendResponse({ error: err.message });
    });
    return true; // 异步响应
  }

  if (request.action === 'analyzeJD') {
    analyzeJobDescription().then(result => {
      sendResponse(result);
    }).catch(err => {
      sendResponse({ error: err.message });
    });
    return true; // 异步响应
  }

  if (request.action === 'generateResume') {
    generateCustomResume(request.includeOpenQuestions || false).then(result => {
      sendResponse(result);
    }).catch(err => {
      sendResponse({ error: err.message });
    });
    return true; // 异步响应
  }
});

// ========== 自动填充新字段（MutationObserver） ==========

let autoFillEnabled = false;
let autoFillObserver = null;
let isAutoFilling = false;

// 从存储读取自动填充开关状态
chrome.storage.local.get(['settings'], function(result) {
  if (result.settings && result.settings.autoFillNewFields) {
    autoFillEnabled = true;
    initAutoFillObserver();
  }
});

// 监听存储变化，实时更新开关状态
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === 'local' && changes.settings) {
    const newSettings = changes.settings.newValue || {};
    autoFillEnabled = !!newSettings.autoFillNewFields;
    if (autoFillEnabled) {
      initAutoFillObserver();
    } else {
      disconnectAutoFillObserver();
    }
  }
});

// 初始化 MutationObserver
function initAutoFillObserver() {
  if (autoFillObserver) return;

  autoFillObserver = new MutationObserver(function(mutations) {
    if (!autoFillEnabled || isAutoFilling) return;

    // 收集所有新增的表单元素
    const newFormElements = [];
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          // 查找新增节点中的所有表单元素
          const elements = node.querySelectorAll ? node.querySelectorAll('input, textarea, select, [contenteditable="true"]') : [];
          for (const el of elements) {
            if (isFormElement(el) && isFieldEmpty(el) && isElementVisible(el)) {
              newFormElements.push(el);
            }
          }
          // 如果新增节点本身就是表单元素
          if (isFormElement(node) && isFieldEmpty(node) && isElementVisible(node)) {
            newFormElements.push(node);
          }
        }
      }
    }

    // 有新的空表单元素时，延迟填充（等待页面渲染完成）
    if (newFormElements.length > 0) {
      isAutoFilling = true;
      setTimeout(function() {
        autoFillNewElements(newFormElements);
        setTimeout(function() { isAutoFilling = false; }, 500);
      }, 300);
    }
  });

  autoFillObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function disconnectAutoFillObserver() {
  if (autoFillObserver) {
    autoFillObserver.disconnect();
    autoFillObserver = null;
  }
}

// 判断是否是可填充的表单元素
function isFormElement(el) {
  if (el.tagName === 'INPUT') {
    const type = el.type.toLowerCase();
    return !['hidden', 'submit', 'button', 'checkbox', 'radio', 'file'].includes(type) && !el.disabled && !el.readOnly;
  }
  if (el.tagName === 'TEXTAREA') return !el.disabled && !el.readOnly;
  if (el.tagName === 'SELECT') return !el.disabled;
  if (isContentEditable(el)) return !el.disabled;
  return false;
}

// 判断元素是否可见
function isElementVisible(el) {
  return el.offsetParent !== null || el.getClientRects().length > 0;
}

// 自动填充新增的表单元素
async function autoFillNewElements(elements) {
  try {
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(['userProfile', 'customResume'], (res) => resolve(res.customResume || res.userProfile || {}));
    });

    if (!data.basicInfo || !data.basicInfo.name) return;

    // 使用当前的经历计数器（需要和 fillForm 共享状态，这里简化处理）
    // 对于自动填充，我们只填充能明确识别的字段
    let filledCount = 0;

    for (const el of elements) {
      // 再次确认元素还是空的（用户可能已经开始输入）
      if (!isFieldEmpty(el)) continue;
      if (!isElementVisible(el)) continue;

      const fieldType = detectFieldType(el);
      if (!fieldType) continue;

      // 自动填充只填充基本信息和技能，不填充经历（避免序号错乱）
      const basicFields = ['name', 'phone', 'email', 'gender', 'birthday', 'address', 'idCard', 'politicalStatus', 'languages', 'skills', 'certificates', 'awards'];
      if (!basicFields.includes(fieldType)) continue;

      const value = getValueForField(fieldType, data, null, 0);
      if (!value) continue;

      let success = false;
      if (el.tagName === 'SELECT') {
        success = setSelectValue(el, value);
      } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        success = setInputValue(el, value);
      } else if (isContentEditable(el)) {
        success = setContentEditableValue(el, value);
      }

      if (success) {
        filledCount++;
        highlightField(el);
      }
    }

    if (filledCount > 0) {
      console.log(`[秋招网申一键填表] 自动填充了 ${filledCount} 个新字段`);
    }
  } catch (e) {
    console.error('[秋招网申一键填表] 自动填充失败:', e);
  }
}

// ========== 岗位JD分析功能 ==========

// 从页面提取岗位描述文本
function extractJDText() {
  // 方法1：查找常见的岗位描述容器
  const selectors = [
    '[class*="job-detail"]', '[class*="jobDescription"]', '[class*="job-desc"]',
    '[class*="position-detail"]', '[class*="positionDesc"]',
    '[class*="job-info"]', '[class*="job-content"]',
    '[class*="detail-content"]', '[class*="description"]',
    '[class*="jd"]', '[class*="JD"]',
    'article', '.job-detail', '.position-detail',
    '[data-testid*="job"]', '[data-testid*="position"]'
  ];

  let jdText = '';
  let bestElement = null;
  let maxLength = 0;

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      if (!isElementVisible(el)) continue;
      const text = el.innerText || el.textContent || '';
      // 岗位描述通常比较长，至少100字
      if (text.length > 100 && text.length > maxLength) {
        // 排除导航栏、侧边栏等
        const rect = el.getBoundingClientRect();
        if (rect.width > 200 && rect.height > 100) {
          maxLength = text.length;
          bestElement = el;
          jdText = text;
        }
      }
    }
  }

  // 方法2：如果没找到，取页面主体内容中最长的文本块
  if (!jdText) {
    const mainContent = document.querySelector('main') || document.querySelector('.main') || document.body;
    if (mainContent) {
      const divs = mainContent.querySelectorAll('div, section, article');
      for (const div of divs) {
        if (!isElementVisible(div)) continue;
        const text = div.innerText || div.textContent || '';
        if (text.length > 200 && text.length < 5000 && text.length > maxLength) {
          // 确保不是整个页面
          const childDivs = div.querySelectorAll('div');
          if (childDivs.length < 50) {
            maxLength = text.length;
            bestElement = div;
            jdText = text;
          }
        }
      }
    }
  }

  // 方法3：如果还是没找到，取整个页面的文本（去掉导航等）
  if (!jdText || jdText.length < 100) {
    const bodyText = document.body.innerText || document.body.textContent || '';
    // 简单过滤：取中间部分
    const lines = bodyText.split('\n').filter(l => l.trim().length > 10);
    jdText = lines.join('\n');
  }

  // 限制长度，避免太长
  if (jdText.length > 3000) {
    jdText = jdText.substring(0, 3000) + '...';
  }

  return { text: jdText, element: bestElement };
}

// 调用DeepSeek API分析岗位
async function analyzeJobWithAI(jdText, userProfile) {
  const API_KEY = 'sk-0d9d19088afa4e0cbbf90563733f5554';
  const API_URL = 'https://api.deepseek.com/chat/completions';

  // 构建用户简历摘要
  let resumeSummary = '';
  if (userProfile && userProfile.basicInfo) {
    const b = userProfile.basicInfo;
    resumeSummary += `姓名：${b.name || '未填写'}\n`;
    if (b.phone) resumeSummary += `电话：${b.phone}\n`;
    if (b.email) resumeSummary += `邮箱：${b.email}\n`;
  }
  if (userProfile && userProfile.education && userProfile.education.length > 0) {
    const edu = userProfile.education[0];
    resumeSummary += `学校：${edu.school || '未填写'}\n`;
    resumeSummary += `专业：${edu.major || '未填写'}\n`;
    resumeSummary += `学历：${edu.degree || '未填写'}\n`;
    if (edu.gpa) resumeSummary += `GPA：${edu.gpa}\n`;
  }
  if (userProfile && userProfile.internship && userProfile.internship.length > 0) {
    resumeSummary += '\n实习经历：\n';
    userProfile.internship.forEach((exp, i) => {
      resumeSummary += `${i + 1}. ${exp.company || ''} - ${exp.position || ''}\n`;
      if (exp.description) resumeSummary += `   ${exp.description.substring(0, 100)}\n`;
    });
  }
  if (userProfile && userProfile.project && userProfile.project.length > 0) {
    resumeSummary += '\n项目经历：\n';
    userProfile.project.forEach((proj, i) => {
      resumeSummary += `${i + 1}. ${proj.name || ''}\n`;
      if (proj.description) resumeSummary += `   ${proj.description.substring(0, 100)}\n`;
    });
  }
  if (userProfile && userProfile.skills) {
    if (userProfile.skills.professionalSkills) resumeSummary += `\n技能：${userProfile.skills.professionalSkills}\n`;
    if (userProfile.skills.awards) resumeSummary += `获奖：${userProfile.skills.awards}\n`;
  }

  const prompt = `你是一个专业的求职顾问。请分析以下岗位JD，并对比用户的简历，给出匹配度分析和简历修改建议。

【岗位JD】
${jdText}

【用户简历摘要】
${resumeSummary || '用户尚未录入简历信息'}

【字段说明】
- resumeSuggestions：针对用户已有经历，给出怎么修改/包装的建议
- experienceSuggestions：根据岗位要求，列出"如果你有以下经历/技能，建议补充到简历里"的建议（用户现在的简历里可能没有，但如果他有的话，补充进去会大大提升匹配度），要具体、可操作，比如"如果你做过XX相关的项目，建议补充到项目经历里"

请严格按照以下JSON格式输出（不要输出其他内容）：
{
  "jobTitle": "岗位名称",
  "company": "公司名称（如能识别）",
  "industry": "所属行业",
  "requiredSkills": ["技能1", "技能2", "技能3"],
  "requiredExperience": "经验要求",
  "requiredEducation": "学历要求",
  "matchScore": 75,
  "matchedPoints": ["匹配点1", "匹配点2"],
  "missingPoints": ["缺失点1", "缺失点2"],
  "resumeSuggestions": [
    {"section": "项目经历", "suggestion": "具体修改建议"},
    {"section": "实习经历", "suggestion": "具体修改建议"},
    {"section": "技能", "suggestion": "具体修改建议"}
  ],
  "experienceSuggestions": [
    {"type": "项目经历", "suggestion": "如果你做过XX相关的事情，建议补充到简历里"},
    {"type": "实习经历", "suggestion": "如果你有XX相关实习，建议补充"},
    {"type": "技能", "suggestion": "如果你掌握XX技能，建议在简历里突出"}
  ],
  "interviewTips": ["面试准备建议1", "面试准备建议2"]
}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个专业的求职顾问，擅长分析岗位要求和优化简历。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 尝试解析JSON
    try {
      // 提取JSON部分（可能有markdown代码块包裹）
      let jsonStr = content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      return JSON.parse(jsonStr);
    } catch (e) {
      // 如果解析失败，返回原始文本
      return { rawText: content, parseError: true };
    }
  } catch (error) {
    console.error('岗位分析API调用失败:', error);
    throw error;
  }
}

// 在页面上显示分析结果
function showAnalysisResult(analysis) {
  // 移除已存在的分析面板
  const existingPanel = document.getElementById('job-analysis-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  // 创建分析面板
  const panel = document.createElement('div');
  panel.id = 'job-analysis-panel';
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 380px;
    max-height: 85vh;
    overflow-y: auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    color: #333;
  `;

  // 匹配度分数颜色
  const score = analysis.matchScore || 0;
  let scoreColor = '#52c41a';
  if (score < 60) scoreColor = '#ff4d4f';
  else if (score < 80) scoreColor = '#faad14';

  // 构建HTML内容
  let html = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; border-radius: 12px 12px 0 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 15px; font-weight: 600;">🎯 岗位匹配分析</div>
        <button onclick="document.getElementById('job-analysis-panel').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 14px;">×</button>
      </div>
      <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">${analysis.jobTitle || '未知岗位'} ${analysis.company ? '· ' + analysis.company : ''}</div>
    </div>

    <div style="padding: 16px;">
      <!-- 匹配度分数 -->
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 36px; font-weight: 700; color: ${scoreColor};">${score}<span style="font-size: 16px;">分</span></div>
        <div style="font-size: 11px; color: #999; margin-top: 4px;">岗位匹配度</div>
      </div>

      <!-- 岗位要求 -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 600; color: #666; margin-bottom: 8px;">📋 岗位要求</div>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 10px;">
  `;

  if (analysis.requiredSkills && analysis.requiredSkills.length > 0) {
    html += `<div style="margin-bottom: 6px;"><span style="color: #666;">技能：</span>${analysis.requiredSkills.join('、')}</div>`;
  }
  if (analysis.requiredExperience) {
    html += `<div style="margin-bottom: 6px;"><span style="color: #666;">经验：</span>${analysis.requiredExperience}</div>`;
  }
  if (analysis.requiredEducation) {
    html += `<div><span style="color: #666;">学历：</span>${analysis.requiredEducation}</div>`;
  }

  html += `
        </div>
      </div>

      <!-- 匹配点 -->
  `;

  if (analysis.matchedPoints && analysis.matchedPoints.length > 0) {
    html += `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 600; color: #52c41a; margin-bottom: 8px;">✅ 匹配点</div>
        <ul style="margin: 0; padding-left: 18px;">
    `;
    analysis.matchedPoints.forEach(p => {
      html += `<li style="margin-bottom: 4px; color: #333;">${p}</li>`;
    });
    html += `</ul></div>`;
  }

  // 缺失点
  if (analysis.missingPoints && analysis.missingPoints.length > 0) {
    html += `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 600; color: #ff4d4f; margin-bottom: 8px;">⚠️ 缺失点</div>
        <ul style="margin: 0; padding-left: 18px;">
    `;
    analysis.missingPoints.forEach(p => {
      html += `<li style="margin-bottom: 4px; color: #333;">${p}</li>`;
    });
    html += `</ul></div>`;
  }

  // 简历修改建议
  if (analysis.resumeSuggestions && analysis.resumeSuggestions.length > 0) {
    html += `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 600; color: #1890ff; margin-bottom: 8px;">💡 简历修改建议</div>
    `;
    analysis.resumeSuggestions.forEach(s => {
      html += `
        <div style="background: #e6f7ff; border-left: 3px solid #1890ff; padding: 8px 10px; margin-bottom: 8px; border-radius: 0 6px 6px 0;">
          <div style="font-weight: 600; font-size: 11px; color: #1890ff; margin-bottom: 4px;">${s.section || '建议'}</div>
          <div style="color: #333; line-height: 1.5;">${s.suggestion || ''}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // 经历补充建议
  if (analysis.experienceSuggestions && analysis.experienceSuggestions.length > 0) {
    html += `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 600; color: #fa8c16; margin-bottom: 8px;">✨ 经历补充建议（如果你有的话，建议补充到简历里）</div>
    `;
    analysis.experienceSuggestions.forEach(s => {
      html += `
        <div style="background: #fff7e6; border-left: 3px solid #fa8c16; padding: 8px 10px; margin-bottom: 8px; border-radius: 0 6px 6px 0;">
          <div style="font-weight: 600; font-size: 11px; color: #fa8c16; margin-bottom: 4px;">${s.type || '建议'}</div>
          <div style="color: #333; line-height: 1.5;">${s.suggestion || ''}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // 面试准备建议
  if (analysis.interviewTips && analysis.interviewTips.length > 0) {
    html += `
      <div style="margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: 600; color: #722ed1; margin-bottom: 8px;">🎤 面试准备建议</div>
        <ul style="margin: 0; padding-left: 18px;">
    `;
    analysis.interviewTips.forEach(t => {
      html += `<li style="margin-bottom: 4px; color: #333;">${t}</li>`;
    });
    html += `</ul></div>`;
  }

  // 补充经历区域
  html += `
    <div style="margin-bottom: 16px; padding: 12px; background: #f0f5ff; border: 1px solid #d6e4ff; border-radius: 8px;">
      <div style="font-size: 12px; font-weight: 600; color: #2f54eb; margin-bottom: 8px;">➕ 补充经历/项目/技能（AI自动优化成简历语言）</div>
      <div style="font-size: 11px; color: #666; margin-bottom: 8px;">看到上面的建议，如果你确实有相关经历、项目或技能，简单描述一下，AI帮你优化成专业简历语言。支持补充：实习经历、项目经历、专业技能、获奖证书等。</div>
      <textarea id="supplementInput" placeholder="举例：&#10;• 实习：2024.07-2024.09 在字节跳动做用户运营实习，负责用户反馈收集和社群运营，整理了50+条用户反馈&#10;• 项目：做过一个校园二手交易平台项目，负责需求调研和原型设计，上线后有200+用户使用&#10;• 技能：熟练使用Python做数据分析，会用SQL查询数据库，能用Excel做透视表和数据可视化"
        style="width: 100%; height: 100px; padding: 8px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 12px; resize: vertical; box-sizing: border-box; margin-bottom: 8px; line-height: 1.5;"></textarea>
      <div style="display: flex; gap: 6px;">
        <button data-action="optimize-supplement" style="flex:1; padding: 8px; background: #2f54eb; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">✨ AI优化</button>
      </div>
      <div id="supplementResult" style="display: none; margin-top: 10px;">
        <div style="font-size: 11px; font-weight: 600; color: #2f54eb; margin-bottom: 6px;">优化结果：</div>
        <div id="optimizedText" style="background: white; border: 1px solid #d9d9d9; border-radius: 6px; padding: 8px; font-size: 12px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 8px;"></div>
        <div style="display: flex; gap: 6px;">
          <button data-action="save-supplement" style="flex:1; padding: 6px; background: #52c41a; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">💾 保存到管理信息</button>
          <button data-action="use-supplement" style="flex:1; padding: 6px; background: #fa8c16; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">📄 加到本次简历</button>
        </div>
      </div>
    </div>
  `;

  // 如果解析失败，显示原始文本
  if (analysis.parseError && analysis.rawText) {
    html += `
      <div style="background: #fffbe6; border: 1px solid #ffe58f; padding: 10px; border-radius: 8px; white-space: pre-wrap; font-size: 12px;">
        ${analysis.rawText}
      </div>
    `;
  }

  html += `
    </div>
    <div style="padding: 10px 16px; background: #fafafa; border-radius: 0 0 12px 12px; font-size: 10px; color: #999; text-align: center;">
      秋招AI求职助手 · 岗位JD分析
    </div>
  `;

  panel.innerHTML = html;
  document.body.appendChild(panel);

  // 面板可拖动
  makePanelDraggable(panel);

  // 补充经历按钮事件
  panel.addEventListener('click', async function(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');

    if (action === 'optimize-supplement') {
      const input = panel.querySelector('#supplementInput');
      const text = input.value.trim();
      if (!text) {
        alert('请先输入你的经历描述');
        return;
      }

      btn.disabled = true;
      btn.textContent = '✨ 优化中...';

      try {
        const optimized = await optimizeExperienceText(text);
        const resultDiv = panel.querySelector('#supplementResult');
        const optimizedTextDiv = panel.querySelector('#optimizedText');
        optimizedTextDiv.textContent = optimized;
        resultDiv.style.display = 'block';
        window.__lastOptimizedSupplement = optimized;
      } catch (err) {
        alert('优化失败: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = '✨ AI优化';
      }
    } else if (action === 'save-supplement') {
      const optimized = window.__lastOptimizedSupplement;
      if (!optimized) {
        alert('请先优化经历描述');
        return;
      }

      // 保存到管理信息（临时追加到项目经历或实习经历）
      // 简单处理：追加到项目经历数组
      chrome.storage.local.get(['userProfile'], function(result) {
        const profile = result.userProfile || {};
        if (!profile.project) profile.project = [];
        profile.project.push({
          name: '补充经历',
          role: '',
          startDate: '',
          endDate: '',
          description: optimized,
          achievements: ''
        });
        chrome.storage.local.set({ userProfile: profile }, function() {
          alert('✅ 已保存到管理信息！下次生成简历时会自动包含这段经历。');
        });
      });
    } else if (action === 'use-supplement') {
      const optimized = window.__lastOptimizedSupplement;
      if (!optimized) {
        alert('请先优化经历描述');
        return;
      }

      // 保存到临时存储，只用于本次生成简历
      chrome.storage.local.set({ tempSupplement: optimized }, function() {
        alert('✅ 已添加到本次简历！请关闭此面板，然后点击「生成岗位定制简历」按钮。');
      });
    }
  });
}

// AI优化经历描述
async function optimizeExperienceText(rawText) {
  const API_KEY = 'sk-0d9d19088afa4e0cbbf90563733f5554';
  const API_URL = 'https://api.deepseek.com/chat/completions';

  const prompt = `请把以下用户的原始描述，优化成专业的简历语言。用户可能输入的是实习经历、项目经历、专业技能、获奖证书等任何简历内容。要求：
1. 保留所有真实信息，绝对不编造
2. 如果是经历类（实习/项目），用STAR法则（情境-任务-行动-结果）优化表达
3. 突出量化成果和能力
4. 语言简洁专业，适合写在简历里
5. 直接输出优化后的文本，不要解释

原始描述：
${rawText}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个专业的简历优化顾问，擅长把口语化的经历描述优化成专业的简历语言。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// 让面板可拖动
function makePanelDraggable(panel) {
  const header = panel.querySelector('div');
  let isDragging = false;
  let startX, startY, initialX, initialY;

  header.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    panel.style.right = 'auto';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.left = (initialX + dx) + 'px';
    panel.style.top = (initialY + dy) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// 主函数：分析岗位JD
async function analyzeJobDescription() {
  try {
    showDebug('开始分析岗位JD...');

    // 1. 提取页面上的岗位描述文本
    const { text: jdText, element } = extractJDText();

    if (!jdText || jdText.length < 50) {
      showDebug('未找到岗位描述文本');
      return { success: false, error: '未在当前页面找到岗位描述，请确保在岗位详情页使用' };
    }

    showDebug(`提取到岗位描述，长度: ${jdText.length} 字`);

    // 2. 获取用户简历信息
    const userProfile = await new Promise((resolve) => {
      chrome.storage.local.get(['userProfile'], (res) => resolve(res.userProfile || {}));
    });

    // 3. 调用AI分析
    showDebug('正在调用AI分析岗位...');
    const analysis = await analyzeJobWithAI(jdText, userProfile);

    showDebug('AI分析完成');

    // 4. 在页面上显示分析结果
    showAnalysisResult(analysis);

    return { success: true, analysis: analysis };
  } catch (error) {
    console.error('岗位分析失败:', error);
    showDebug(`岗位分析失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ========== AI生成岗位定制简历功能 ==========

// 调用DeepSeek API生成定制简历
async function generateResumeWithAI(jdText, userProfile, includeOpenQuestions = false) {
  const API_KEY = 'sk-0d9d19088afa4e0cbbf90563733f5554';
  const API_URL = 'https://api.deepseek.com/chat/completions';

  // 构建用户简历的完整信息
  let resumeContent = '';

  if (userProfile && userProfile.basicInfo) {
    const b = userProfile.basicInfo;
    resumeContent += `【基本信息】\n`;
    resumeContent += `姓名：${b.name || '未填写'}\n`;
    resumeContent += `电话：${b.phone || '未填写'}\n`;
    resumeContent += `邮箱：${b.email || '未填写'}\n`;
    if (b.gender) resumeContent += `性别：${b.gender}\n`;
    if (b.birthday) resumeContent += `出生年月：${b.birthday}\n`;
    if (b.politicalStatus) resumeContent += `政治面貌：${b.politicalStatus}\n`;
    if (b.currentCity) resumeContent += `现居地：${b.currentCity}\n`;
    if (b.hometown) resumeContent += `籍贯：${b.hometown}\n`;
    if (b.idCard) resumeContent += `身份证号：${b.idCard}\n`;
    if (b.selfEvaluation) resumeContent += `自我评价：${b.selfEvaluation}\n`;
    resumeContent += '\n';
  }

  if (userProfile && userProfile.education && userProfile.education.length > 0) {
    resumeContent += `【教育经历】\n`;
    userProfile.education.forEach((edu, i) => {
      resumeContent += `${i + 1}. ${edu.school || ''} - ${edu.major || ''} - ${edu.degree || ''}\n`;
      if (edu.startDate || edu.endDate) resumeContent += `   时间：${edu.startDate || ''} - ${edu.endDate || ''}\n`;
      if (edu.gpa) resumeContent += `   GPA：${edu.gpa}\n`;
      if (edu.rank) resumeContent += `   排名：${edu.rank}\n`;
      if (edu.courses) resumeContent += `   主修课程：${edu.courses}\n`;
    });
    resumeContent += '\n';
  }

  if (userProfile && userProfile.internship && userProfile.internship.length > 0) {
    resumeContent += `【实习经历】\n`;
    userProfile.internship.forEach((exp, i) => {
      resumeContent += `${i + 1}. ${exp.company || ''} - ${exp.position || ''}\n`;
      if (exp.startDate || exp.endDate) resumeContent += `   时间：${exp.startDate || ''} - ${exp.endDate || ''}\n`;
      if (exp.description) resumeContent += `   工作内容：${exp.description}\n`;
      if (exp.achievements) resumeContent += `   工作成果：${exp.achievements}\n`;
    });
    resumeContent += '\n';
  }

  if (userProfile && userProfile.project && userProfile.project.length > 0) {
    resumeContent += `【项目经历】\n`;
    userProfile.project.forEach((proj, i) => {
      resumeContent += `${i + 1}. ${proj.name || ''}\n`;
      if (proj.role) resumeContent += `   角色：${proj.role}\n`;
      if (proj.startDate || proj.endDate) resumeContent += `   时间：${proj.startDate || ''} - ${proj.endDate || ''}\n`;
      if (proj.description) resumeContent += `   描述：${proj.description}\n`;
      if (proj.achievements) resumeContent += `   成果：${proj.achievements}\n`;
    });
    resumeContent += '\n';
  }

  if (userProfile && userProfile.skills) {
    const s = userProfile.skills;
    resumeContent += `【技能证书】\n`;
    if (s.professionalSkills) resumeContent += `专业技能：${s.professionalSkills}\n`;
    if (s.languages) resumeContent += `语言能力：${s.languages}\n`;
    if (s.certificates) resumeContent += `证书：${s.certificates}\n`;
    if (s.awards) resumeContent += `获奖经历：${s.awards}\n`;
    resumeContent += '\n';
  }

  if (userProfile && userProfile.jobPreference) {
    const j = userProfile.jobPreference;
    resumeContent += `【求职意向】\n`;
    if (j.expectedPosition) resumeContent += `意向岗位：${j.expectedPosition}\n`;
    if (j.expectedCity) resumeContent += `期望城市：${j.expectedCity}\n`;
    if (j.expectedSalary) resumeContent += `期望薪资：${j.expectedSalary}\n`;
    if (j.expectedIndustry) resumeContent += `意向行业：${j.expectedIndustry}\n`;
    if (j.availableDate) resumeContent += `可到岗时间：${j.availableDate}\n`;
    if (j.jobStatus) resumeContent += `求职状态：${j.jobStatus}\n`;
  }

  // 读取临时补充的经历（用户从岗位分析面板补充的）
  const tempSupplement = await new Promise((resolve) => {
    chrome.storage.local.get(['tempSupplement'], (res) => resolve(res.tempSupplement || ''));
  });
  if (tempSupplement) {
    resumeContent += `\n【本次补充经历】\n${tempSupplement}\n（这段经历是用户刚补充的，请纳入项目经历或实习经历部分，和其他经历一起优化）\n`;
  }

  // 根据是否需要开放性问题，构建不同的输出格式要求
  let openQuestionsSection = '';
  if (includeOpenQuestions) {
    openQuestionsSection = `
# 开放性问题回答

## 1. 为什么选择我们公司？
（结合公司业务+岗位要求+你的背景，200字左右）

## 2. 为什么应聘这个岗位？
（结合岗位要求+你的匹配点+职业规划，200字左右）

## 3. 你的职业规划是什么？
（短期1-2年+长期3-5年，结合公司和岗位，200字左右）

---
【优化说明】`;
  } else {
    openQuestionsSection = `---
【优化说明】`;
  }

  const prompt = `你是一个专业的资深HR和简历优化顾问，拥有10年招聘经验。请根据以下用户的原始简历信息和目标岗位的JD，生成一份针对该岗位的**高度定制化**求职简历。

【最重要的铁律 - 必须严格遵守】
1. 绝对禁止编造任何用户没有提到的经历、项目、数据、成果、技能、奖项
2. 只能基于用户提供的原始简历信息，调整表达方式、描述侧重点和语句顺序
3. 如果用户某方面信息不足，直接保留原样或简略描述，绝对不要补充编造
4. 必须**主动筛选和取舍**：不是所有经历都要放上去！只保留和目标岗位最相关的内容
5. 项目经历**不要全部保留**：从用户提供的所有项目中，挑选**3-4个和目标岗位最相关的**，按**相关度从高到低**排序，完全不相关的项目直接删掉，不要硬凑
6. 实习经历也一样：只保留和岗位相关的工作内容，不相关的工作内容直接删掉，不要全部保留
7. 主修课程**不要全部列出**：只保留3-5门和岗位最相关的课程，其他全部删掉
8. 技能按岗位相关度排序，岗位要求的技能放在最前面，不相关的技能可以删掉
9. 可以优化语句表达，使其更专业、更贴合岗位，但不能改变事实
10. 整个简历要像"为这个岗位量身定做的"，而不是"通用简历稍微改了改"
11. 开放性问题回答也必须基于用户真实经历，绝对不编造

【目标岗位JD】
${jdText}

【用户原始简历信息】
${resumeContent || '用户尚未录入简历信息'}

【输出格式要求】
请严格按照以下Markdown格式输出，不要输出其他内容：

# 个人信息
姓名：...
电话：...
邮箱：...
（其他信息按需保留）

# 教育经历
（学校、专业、时间保留；主修课程只列3-5门和岗位最相关的，其他删掉）

# 实习经历
（只保留和岗位相关的工作内容，不相关的删掉；每段实习用3-4条要点）

# 项目经历
（**只保留3-4个和岗位最相关的项目**，按**相关度从高到低**排序，不是按时间！完全不相关的项目直接删掉。每个项目用3-4条要点，重点突出和岗位要求匹配的部分）

# 技能特长
（按岗位相关度排序，岗位要求的技能放最前面，不相关的删掉）

# 证书奖项
（只保留和岗位相关的）

# 自我评价
（针对目标岗位定制，2-3句话说清楚你是谁、为什么适合这个岗位）
${openQuestionsSection}
（用3-5句话说明你做了哪些优化，比如：选了哪几个项目、删掉了哪些不相关的内容、调整了哪些侧重点、为什么这样调整）

---

最后，在简历正文之后，另起一行输出一个 \`\`\`json 代码块，内容是和原始简历相同结构的JSON，但只包含你保留下来的经历和优化后的描述。这个JSON会用于自动填表，字段必须完整：
\`\`\`json
{
  "basicInfo": {"name":"","phone":"","email":"","gender":"","birthday":"","politicalStatus":"","address":"","idCard":"","selfEvaluation":""},
  "education": [{"school":"","major":"","degree":"","gpa":"","rank":"","startDate":"","endDate":"","courses":""}],
  "internship": [{"company":"","position":"","startDate":"","endDate":"","description":"","achievements":""}],
  "project": [{"name":"","role":"","startDate":"","endDate":"","description":"","achievements":""}],
  "skills": {"languages":"","professionalSkills":"","certificates":"","awards":""}
}
\`\`\`
注意：JSON里的描述字段要和上面简历正文里的优化后文字一致；删掉的经历不要出现在JSON里。`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个专业的简历优化顾问，擅长根据岗位要求定制简历。最重要的原则是：绝对不编造用户没有的经历，只调整表达方式和侧重点。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: includeOpenQuestions ? 8000 : 6000
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 从返回内容中提取 ```json 代码块，作为填表用的结构化数据
    let structuredData = null;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        structuredData = JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.warn('解析结构化JSON失败:', e);
      }
    }

    return { rawText: content, structuredData };
  } catch (error) {
    console.error('生成简历API调用失败:', error);
    throw error;
  }
}

// 在页面上显示生成的简历
function showResumeResult(resumeData) {
  // 移除已存在的简历面板
  const existingPanel = document.getElementById('resume-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  // 创建简历面板
  const panel = document.createElement('div');
  panel.id = 'resume-panel';
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 420px;
    max-height: 85vh;
    overflow-y: auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    color: #333;
  `;

  // 把Markdown简单转换为HTML
  let htmlContent = resumeData.rawText || '';

  // 简单的Markdown渲染
  htmlContent = htmlContent
    .replace(/^# (.*$)/gm, '<h2 style="font-size:15px;font-weight:600;color:#1a1a1a;margin:16px 0 8px;padding-bottom:6px;border-bottom:2px solid #43e97b;">$1</h2>')
    .replace(/^## (.*$)/gm, '<h3 style="font-size:14px;font-weight:600;color:#333;margin:12px 0 6px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600;">$1</strong>')
    .replace(/\n\n/g, '</p><p style="margin:6px 0;line-height:1.6;">')
    .replace(/\n/g, '<br>');

  // 构建面板HTML
  const html = `
    <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: #1a1a1a; padding: 16px; border-radius: 12px 12px 0 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 15px; font-weight: 600;">📄 岗位定制简历</div>
        <button onclick="document.getElementById('resume-panel').remove()" style="background: rgba(0,0,0,0.1); border: none; color: #1a1a1a; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 14px;">×</button>
      </div>
      <div style="margin-top: 4px; font-size: 11px; opacity: 0.8;">AI已根据目标岗位优化简历侧重点</div>
    </div>

    <div style="padding: 16px;">
      <!-- 警告提示 -->
      <div style="background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 11px; color: #8c6d1f; line-height: 1.5;">
        ⚠️ <strong>重要提示：</strong>AI生成的内容仅供参考，请仔细核对，确保没有编造经历。您对最终简历内容负责。
      </div>

      <!-- 操作按钮 -->
      <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
        <button data-action="preview-resume" style="flex:1; min-width: 100px; padding: 8px 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">👁️ 预览HTML简历</button>
        <button id="useForFillBtn" style="flex:1; min-width: 100px; padding: 8px 6px; background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">📌 用此简历填表</button>
        <button data-action="copy-resume" style="flex:1; min-width: 80px; padding: 8px 6px; background: #43e97b; color: #1a1a1a; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">📋 复制内容</button>
        <button data-action="download-resume" style="flex:1; min-width: 80px; padding: 8px 6px; background: #f0f0f0; color: #333; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">💾 下载MD</button>
      </div>

      <!-- 填表状态提示 -->
      <div id="fillModeHint" style="display:none; background:#e8f5e9; border:1px solid #a5d6a7; border-radius:6px; padding:8px 10px; margin-bottom:12px; font-size:11px; color:#2e7d32; line-height:1.5;"></div>

      <!-- 简历内容 -->
      <div id="resume-content" style="line-height: 1.6; font-size: 12.5px;">
        <p style="margin:6px 0;line-height:1.6;">${htmlContent}</p>
      </div>
    </div>

    <div style="padding: 10px 16px; background: #fafafa; border-radius: 0 0 12px 12px; font-size: 10px; color: #999; text-align: center;">
      秋招AI求职助手 · AI定制简历
    </div>
  `;

  panel.innerHTML = html;
  document.body.appendChild(panel);

  // 直接绑定"用此简历填表"按钮
  const useForFillBtn = panel.querySelector('#useForFillBtn');
  if (useForFillBtn) {
    useForFillBtn.addEventListener('click', function() {
      if (!window.__customResumeData) {
        alert('AI未返回结构化数据，请重新生成简历');
        return;
      }
      chrome.storage.local.set({ customResume: window.__customResumeData }, () => {
        useForFillBtn.textContent = '✅ 已启用';
        useForFillBtn.style.background = '#43e97b';
        useForFillBtn.style.color = '#1a1a1a';
        refreshFillModeHint();
        alert('✅ 已切换为「定制简历」填表！\n\n现在打开网申页面点一键填表，就会用这份针对当前岗位优化过的内容。\n\n投完别的岗位后，记得点「恢复完整简历」切回完整版。');
      });
    });
  }

  // 把原始内容存到全局变量，供复制/下载使用
  window.__resumeRawContent = resumeData.rawText || '';
  window.__customResumeData = resumeData.structuredData || null;

  // 检查当前是否已启用定制简历填表
  refreshFillModeHint();

  // 事件委托：处理面板内所有按钮点击
  panel.addEventListener('click', function(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const text = window.__resumeRawContent || '';

    if (action === 'copy-resume') {
      // 复制内容
      navigator.clipboard.writeText(text).then(() => {
        alert('简历内容已复制到剪贴板！');
      }).catch(() => {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('简历内容已复制到剪贴板！');
      });
    } else if (action === 'download-resume') {
      // 下载Markdown
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '岗位定制简历.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (action === 'preview-resume') {
      // 预览HTML简历
      if (typeof window.openResumePreview === 'function') {
        window.openResumePreview();
      } else {
        alert('预览功能加载中，请稍后再试');
      }
    } else if (action === 'use-for-fill') {
      // 用此定制简历作为一键填表的数据
      if (!window.__customResumeData) {
        alert('AI未返回结构化数据，请重新生成简历');
        return;
      }
      chrome.storage.local.set({ customResume: window.__customResumeData }, () => {
        btn.textContent = '✅ 已启用';
        btn.style.background = '#43e97b';
        btn.style.color = '#1a1a1a';
        refreshFillModeHint();
        alert('已切换为「定制简历」填表！\n\n现在打开网申页面点一键填表，就会用这份针对当前岗位优化过的内容。\n\n投完别的岗位后，记得点「恢复完整简历」切回完整版。');
      });
    }
  });

  // 面板可拖动
  makePanelDraggable(panel);
}

// 全局函数：用当前定制简历填表
window.useForFill = function() {
  if (!window.__customResumeData) {
    alert('AI未返回结构化数据，请重新生成简历');
    return;
  }
  chrome.storage.local.set({ customResume: window.__customResumeData }, () => {
    alert('✅ 已切换为「定制简历」填表！\n\n现在打开网申页面点一键填表，就会用这份针对当前岗位优化过的内容。\n\n投完别的岗位后，记得点「恢复完整简历」切回完整版。');
    // 更新按钮状态
    const btns = document.querySelectorAll('button');
    btns.forEach(b => {
      if (b.textContent.includes('用此简历填表')) {
        b.textContent = '✅ 已启用';
        b.style.background = '#43e97b';
        b.style.color = '#1a1a1a';
      }
    });
    refreshFillModeHint();
  });
};

// 刷新面板上的"填表模式"提示
function refreshFillModeHint() {
  const hint = document.getElementById('fillModeHint');
  if (!hint) return;
  chrome.storage.local.get(['customResume'], (res) => {
    if (res.customResume) {
      const b = res.customResume.basicInfo || {};
      const edu = (res.customResume.education || [])[0] || {};
      const projCount = (res.customResume.project || []).length;
      const internCount = (res.customResume.internship || []).length;
      hint.style.display = 'block';
      hint.innerHTML = `📌 <strong>当前使用定制简历填表</strong><br>教育1段 · 实习${internCount}段 · 项目${projCount}段<br><a href="#" data-action="restore-full" style="color:#2e7d32;text-decoration:underline;">↩️ 恢复完整经历库</a>`;
    } else {
      hint.style.display = 'none';
    }
  });
}

// 恢复完整经历库
document.addEventListener('click', function(e) {
  const link = e.target.closest('a[data-action="restore-full"]');
  if (!link) return;
  e.preventDefault();
  if (confirm('确定恢复为完整经历库？\n（定制简历只影响本次填表，完整经历库不会被删除）')) {
    chrome.storage.local.remove(['customResume'], () => {
      refreshFillModeHint();
      alert('已恢复为完整经历库');
    });
  }
});

// 全局函数：打开HTML简历预览（供按钮onclick调用）
window.openResumePreview = function() {
  let markdownText = window.__resumeRawContent || '';
  if (!markdownText) {
    alert('没有可预览的简历内容，请先生成岗位定制简历');
    return;
  }

  // 去掉AI附加的"【优化说明】"部分及其前面的分隔线，只保留正式简历正文
  markdownText = markdownText.split('【优化说明】')[0].replace(/\n*-{3,}\s*$/, '').trim();

  // 简单的Markdown渲染
  let htmlContent = markdownText
    .replace(/^# (.*$)/gm, '<h1 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 4px 0;border-bottom:none;">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size:15px;font-weight:600;color:#2c3e50;margin:20px 0 10px 0;padding-bottom:6px;border-bottom:2px solid #3498db;">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 style="font-size:13px;font-weight:600;color:#34495e;margin:12px 0 6px 0;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600;">$1</strong>')
    .replace(/\* (.*?)$/gm, '<li style="margin:3px 0;">$1</li>')
    .replace(/\n\n/g, '</p><p style="margin:6px 0;line-height:1.7;">')
    .replace(/\n/g, '<br>');

  // 把<li>包裹在<ul>里
  htmlContent = htmlContent.replace(/(<li[^>]*>.*<\/li>)+/g, '<ul style="margin:6px 0;padding-left:20px;">$&</ul>');

  // 提取姓名作为标题
  let name = '个人简历';
  const nameMatch = markdownText.match(/姓名[：:]\s*(.+)/);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  // 构建完整的HTML页面
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} - 个人简历</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: #f5f5f5;
    color: #333;
    line-height: 1.6;
    padding: 20px;
  }
  .toolbar {
    max-width: 800px;
    margin: 0 auto 16px auto;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  .toolbar button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-print {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  .btn-print:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  .btn-back {
    background: #e0e0e0;
    color: #333;
  }
  .resume-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px 50px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    border-radius: 4px;
  }
  .resume-header {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
  }
  .resume-header h1 {
    font-size: 26px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8px;
  }
  .resume-content {
    font-size: 13px;
    color: #333;
  }
  .resume-content h2 {
    font-size: 15px;
    font-weight: 600;
    color: #2c3e50;
    margin: 20px 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 2px solid #3498db;
  }
  .resume-content h3 {
    font-size: 13px;
    font-weight: 600;
    color: #34495e;
    margin: 12px 0 6px 0;
  }
  .resume-content p {
    margin: 6px 0;
    line-height: 1.7;
  }
  .resume-content ul {
    margin: 6px 0;
    padding-left: 20px;
  }
  .resume-content li {
    margin: 3px 0;
    line-height: 1.6;
  }
  .resume-content strong {
    font-weight: 600;
    color: #1a1a1a;
  }
  .watermark {
    text-align: center;
    margin-top: 30px;
    padding-top: 16px;
    border-top: 1px solid #eee;
    font-size: 11px;
    color: #bbb;
  }
  @media print {
    body { background: white; padding: 0; }
    .toolbar { display: none; }
    .resume-container { box-shadow: none; padding: 20px 30px; max-width: 100%; }
    .watermark { display: none; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="btn-back" onclick="window.close()">← 返回</button>
    <button class="btn-print" onclick="window.print()">🖨️ 导出PDF / 打印</button>
  </div>
  <div class="resume-container">
    <div class="resume-header">
      <h1>${name}</h1>
    </div>
    <div class="resume-content">
      <p style="margin:6px 0;line-height:1.7;">${htmlContent}</p>
    </div>
    <div class="watermark">由「秋招AI求职助手」AI生成 · 仅供参考，请仔细核对</div>
  </div>
</body>
</html>`;

  // 打开新标签页并写入HTML
  try {
    const previewWindow = window.open('about:blank', '_blank');
    if (previewWindow) {
      previewWindow.document.open();
      previewWindow.document.write(fullHtml);
      previewWindow.document.close();
    } else {
      alert('无法打开预览页面，请检查浏览器弹窗设置，允许此网站弹出窗口');
    }
  } catch (e) {
    console.error('打开预览页面失败:', e);
    alert('打开预览页面失败: ' + e.message);
  }
};

// 主函数：生成岗位定制简历
async function generateCustomResume(includeOpenQuestions = false) {
  try {
    showDebug('开始生成岗位定制简历...');

    // 1. 提取页面上的岗位描述文本
    const { text: jdText } = extractJDText();

    if (!jdText || jdText.length < 50) {
      showDebug('未找到岗位描述文本');
      return { success: false, error: '未在当前页面找到岗位描述，请确保在岗位详情页使用' };
    }

    showDebug(`提取到岗位描述，长度: ${jdText.length} 字`);

    // 2. 获取用户简历信息
    const userProfile = await new Promise((resolve) => {
      chrome.storage.local.get(['userProfile'], (res) => resolve(res.userProfile || {}));
    });

    // 检查用户是否录入了简历信息（只要有任意一项数据即可）
    const hasData = userProfile && (
      (userProfile.basicInfo && (userProfile.basicInfo.name || userProfile.basicInfo.phone || userProfile.basicInfo.email)) ||
      (userProfile.education && userProfile.education.length > 0) ||
      (userProfile.internship && userProfile.internship.length > 0) ||
      (userProfile.project && userProfile.project.length > 0) ||
      (userProfile.skills && (userProfile.skills.professionalSkills || userProfile.skills.awards))
    );

    if (!hasData) {
      showDebug('用户未录入简历信息');
      return { success: false, error: '请先在「管理信息」中录入你的简历信息（或上传简历AI解析），才能生成定制简历' };
    }

    // 3. 调用AI生成定制简历
    showDebug('正在调用AI生成定制简历...');
    if (includeOpenQuestions) {
      showDebug('同时生成开放性问题回答...');
    }
    const resumeData = await generateResumeWithAI(jdText, userProfile, includeOpenQuestions);

    showDebug('AI生成完成');

    // 4. 在页面上显示生成的简历
    showResumeResult(resumeData);

    return { success: true, resume: resumeData };
  } catch (error) {
    console.error('生成简历失败:', error);
    showDebug(`生成简历失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}
