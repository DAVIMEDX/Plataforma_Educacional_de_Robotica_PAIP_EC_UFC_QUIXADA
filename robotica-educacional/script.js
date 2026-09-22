// ================================
// ESTADO DA APLICAÇÃO
// ================================
const AppState = {
    currentLang: localStorage.getItem('language') || 'pt',
    modules: null,
    currentView: 'home',
    currentModule: null,
    currentPractice: null
};

// ================================
// INICIALIZAÇÃO
// ================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadModulesData();
    initializeLanguage();
    initializeRouter();
    updateLanguage();
});

// ================================
// CARREGAR DADOS
// ================================
async function loadModulesData() {
    try {
        const response = await fetch('data/modules.json');
        AppState.modules = await response.json();
    } catch (error) {
        console.error('Erro ao carregar modules.json:', error);
        showError('Erro ao carregar dados. Por favor, recarregue a página.');
    }
}

async function loadPracticeData(moduleId, practiceId) {
    try {
        const lang = AppState.currentLang;
        const response = await fetch(`data/practices/${lang}/${moduleId}-${practiceId}.json`);
        if (!response.ok) {
            throw new Error('Practice not found');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar prática:', error);
        return null;
    }
}

// ================================
// ROUTER (Hash-based)
// ================================
function initializeRouter() {
    window.addEventListener('hashchange', router);
    router();
}

async function router() {
    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(p => p);

    if (parts.length === 0) {
        await renderHome();
    } else if (parts[0] === 'module' && parts.length === 2) {
        await renderModule(parts[1]);
    } else if (parts[0] === 'module' && parts.length === 4 && parts[2] === 'practice') {
        await renderPractice(parts[1], parts[3]);
    } else {
        await renderHome();
    }

    window.scrollTo(0, 0);
}

// ================================
// NAVEGAÇÃO
// ================================
function navigateHome() {
    window.location.hash = '/';
}

function navigateToModule(moduleId) {
    window.location.hash = `/module/${moduleId}`;
}

function navigateToPractice(moduleId, practiceId) {
    window.location.hash = `/module/${moduleId}/practice/${practiceId}`;
}

// ================================
// INTERNACIONALIZAÇÃO (i18n)
// ================================
function initializeLanguage() {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        AppState.currentLang = savedLang;
        updateLanguageButtons();
    }
}

function switchLanguage(lang) {
    AppState.currentLang = lang;
    localStorage.setItem('language', lang);
    updateLanguageButtons();
    updateLanguage();
    router();
}

function updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === AppState.currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateLanguage() {
    const lang = AppState.currentLang;
    const data = AppState.modules?.[lang];

    if (!data) return;

    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    const siteName = document.getElementById('siteName');
    if (siteName) siteName.textContent = data.siteName;

    const homeText = document.getElementById('homeText');
    if (homeText) homeText.textContent = data.home;
}

// ================================
// RENDERIZAÇÃO: HOME
// ================================
async function renderHome() {
    AppState.currentView = 'home';
    updateBreadcrumb([]);

    const lang = AppState.currentLang;
    const data = AppState.modules?.[lang];

    if (!data) {
        showError('Dados não carregados');
        return;
    }

    // Agrupa os módulos por categoria
    const groupedModules = {};
    data.modules.forEach(module => {
        const cat = module.category || 'Outros';
        if (!groupedModules[cat]) {
            groupedModules[cat] = [];
        }
        groupedModules[cat].push(module);
    });

    // Gera o HTML das categorias e seus respectivos cards
    let modulesHtml = '';
    for (const [categoryName, modules] of Object.entries(groupedModules)) {
        const cardsHtml = modules.map(module => createModuleCard(module)).join('');
        modulesHtml += `
            <div class="category-section">
                <h3 class="category-title">${categoryName}</h3>
                <div class="modules-grid">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }

    const html = `
        <section class="hero-section">
            <div class="container">
                <h1 class="hero-title">${data.siteName}</h1>
                <p class="hero-subtitle">${data.siteSubtitle}</p>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-number">${data.modules.length}</span>
                        <span class="stat-label">${lang === 'pt' ? 'Módulos' : 'Modules'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">10</span>
                        <span class="stat-label">${lang === 'pt' ? 'Práticas' : 'Practices'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">21-31h</span>
                        <span class="stat-label">${lang === 'pt' ? 'Duração Total' : 'Total Duration'}</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="modules-section">
            <div class="container">
                <h2 class="section-title">${lang === 'pt' ? 'Escolha sua Trilha' : 'Choose Your Path'}</h2>
                ${modulesHtml}
            </div>
        </section>

        <section class="info-section">
            <div class="container">
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-icon">🎯</div>
                        <h3>${lang === 'pt' ? 'Progressivo' : 'Progressive'}</h3>
                        <p>${lang === 'pt' ? 'Aprenda do básico ao avançado com práticas estruturadas' : 'Learn from basic to advanced with structured practices'}</p>
                    </div>
                    <div class="info-card">
                        <div class="info-icon">🔧</div>
                        <h3>${lang === 'pt' ? 'Prático' : 'Hands-on'}</h3>
                        <p>${lang === 'pt' ? 'Projetos reais com hardware e sucata integrados' : 'Real projects with integrated hardware and scrap'}</p>
                    </div>
                    <div class="info-card">
                        <div class="info-icon">🌐</div>
                        <h3>${lang === 'pt' ? 'Padrão Industrial' : 'Industry Standard'}</h3>
                        <p>${lang === 'pt' ? 'Usando ROS2, o sistema mais utilizado em robótica profissional' : 'Using ROS2, the most used system in professional robotics'}</p>
                    </div>
                </div>
            </div>
        </section>
    `;

    document.getElementById('app').innerHTML = html;
}
function createModuleCard(module) {
    const lang = AppState.currentLang;
    return `
        <div class="module-card" style="border-left-color: ${module.color}" onclick="navigateToModule('${module.id}')">
            <div class="module-header">
                <span class="module-icon">${module.icon}</span>
                <div class="module-title-group">
                    <h3 class="module-title">${module.title}</h3>
                    <p class="module-subtitle">${module.subtitle}</p>
                </div>
            </div>
            <p class="module-description">${module.description}</p>
            <div class="module-meta">
                <span class="meta-item">
                    <span class="meta-icon">📚</span>
                    ${module.practiceCount} ${lang === 'pt' ? 'práticas' : 'practices'}
                </span>
                <span class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    ${module.duration}
                </span>
                <span class="meta-item">
                    <span class="meta-icon">📊</span>
                    ${module.level}
                </span>
            </div>
            <button class="module-button" onclick="event.stopPropagation(); navigateToModule('${module.id}')">
                ${lang === 'pt' ? 'Ver Práticas' : 'View Practices'} →
            </button>
        </div>
    `;
}

// ================================
// RENDERIZAÇÃO: MÓDULO
// ================================
async function renderModule(moduleId) {
    AppState.currentView = 'module';
    AppState.currentModule = moduleId;

    const lang = AppState.currentLang;
    const data = AppState.modules?.[lang];
    const module = data?.modules.find(m => m.id === moduleId);

    if (!module) {
        renderHome();
        return;
    }

    updateBreadcrumb([
        { text: data.home, link: '/' },
        { text: module.title, link: null }
    ]);

    const practicesHtml = module.practices.map((practice, index) => createPracticeCard(practice, module, index + 1)).join('');

    const html = `
        <div class="container">
            <div class="module-detail-header" style="border-left-color: ${module.color}">
                <span class="module-detail-icon">${module.icon}</span>
                <div>
                    <h1 class="module-detail-title">${module.title}</h1>
                    <p class="module-detail-subtitle">${module.subtitle}</p>
                </div>
            </div>
            
            <div class="module-detail-meta">
                <span class="meta-badge">📊 ${module.level}</span>
                <span class="meta-badge">⏱️ ${module.duration}</span>
                <span class="meta-badge">�� ${module.practiceCount} ${lang === 'pt' ? 'práticas' : 'practices'}</span>
            </div>
            
            <p class="module-detail-description">${module.description}</p>
            
            <h2 class="practices-title">${lang === 'pt' ? 'Práticas' : 'Practices'}</h2>
            <div class="practices-list">
                ${practicesHtml}
            </div>
        </div>
    `;

    document.getElementById('app').innerHTML = html;
}

function createPracticeCard(practice, module, number) {
    const lang = AppState.currentLang;
    return `
        <div class="practice-card-compact" onclick="navigateToPractice('${module.id}', '${practice.id}')">
            <div class="practice-number">${number}</div>
            <div class="practice-icon-large">${practice.icon}</div>
            <div class="practice-content-compact">
                <h3 class="practice-title-compact">${practice.title}</h3>
                <p class="practice-description-compact">${practice.shortDescription}</p>
                <div class="practice-meta-compact">
                    <span class="meta-badge-small">⏱️ ${practice.duration}</span>
                    <span class="meta-badge-small">📊 ${practice.difficulty}</span>
                </div>
            </div>
            <button class="practice-button-compact" onclick="event.stopPropagation(); navigateToPractice('${module.id}', '${practice.id}')">
                ${lang === 'pt' ? 'Iniciar' : 'Start'} →
            </button>
        </div>
    `;
}

// ================================
// BREADCRUMB
// ================================
function updateBreadcrumb(items) {
    const breadcrumb = document.getElementById('breadcrumb');
    const breadcrumbItems = document.getElementById('breadcrumbItems');

    if (!breadcrumb || !breadcrumbItems) return;

    if (items.length === 0) {
        breadcrumb.style.display = 'none';
        return;
    }

    breadcrumb.style.display = 'block';
    breadcrumbItems.innerHTML = items.map((item, index) => {
        if (item.link) {
            return `<a href="#${item.link}" class="breadcrumb-item">${item.text}</a>`;
        } else {
            return `<span class="breadcrumb-item active">${item.text}</span>`;
        }
    }).join('<span class="breadcrumb-separator">›</span>');
}

// ================================
// RENDERIZAÇÃO: PRÁTICA
// ================================
async function renderPractice(moduleId, practiceId) {
    document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div><p>Carregando prática...</p></div>';

    const lang = AppState.currentLang;
    const data = AppState.modules?.[lang];
    const module = data?.modules.find(m => m.id === moduleId);
    const practiceInfo = module?.practices.find(p => p.id === practiceId);

    if (!module || !practiceInfo) {
        renderHome();
        return;
    }

    const practiceData = await loadPracticeData(moduleId, practiceId);

    if (!practiceData) {
        showError(lang === 'pt' ? 'Prática não encontrada ou em desenvolvimento.' : 'Practice not found or under development.');
        return;
    }

    updateBreadcrumb([
        { text: data.home, link: '/' },
        { text: module.title, link: `/module/${moduleId}` },
        { text: practiceData.title, link: null }
    ]);

    const html = `
        <div class="container practice-container">
            <div class="practice-header-full">
                <span class="practice-icon-huge">${practiceInfo.icon}</span>
                <div>
                    <h1 class="practice-title-full">${practiceData.title}</h1>
                    <p class="practice-description-full">${practiceData.description}</p>
                </div>
            </div>
            
            <div class="practice-meta-full">
                <span class="meta-badge">⏱️ ${practiceData.duration}</span>
                <span class="meta-badge">📊 ${practiceData.difficulty}</span>
            </div>
            
            ${createPracticeSections(practiceData, lang)}
            ${createNavigationButtons(practiceData, module, lang)}
        </div>
    `;

    document.getElementById('app').innerHTML = html;
}

function createPracticeSections(practice, lang) {
    let html = '';

    // 1. Renderização para práticas no formato PDF
    if (practice.pdfUrl) {
        html += `
            <section class="practice-section pdf-section">
                <div class="pdf-header">
                    <span class="pdf-title-label">📄 ${lang === 'pt' ? 'Guia Prático Passo a Passo' : 'Step-by-Step Practical Guide'}</span>
                    <a href="${practice.pdfUrl}" target="_blank" class="btn btn-primary">
                        📥 ${lang === 'pt' ? 'Abrir / Baixar PDF' : 'Open / Download PDF'}
                    </a>
                </div>
                <div class="pdf-container">
                    <iframe src="${practice.pdfUrl}" class="pdf-viewer" frameborder="0"></iframe>
                </div>
            </section>
        `;

        // Se houver arquivos para download abaixo do PDF (ex: perfis .ini do PrusaSlicer)
        if (practice.resources && practice.resources.length > 0) {
            html += `
                <section class="practice-section resources-section">
                    <h2 class="section-heading">⚙️ ${lang === 'pt' ? 'Arquivos de Configuração para Download' : 'Configuration Files for Download'}</h2>
                    <div class="resources-grid">
            `;
            
            practice.resources.forEach(res => {
                html += `
                    <div class="resource-card">
                        <div class="resource-info">
                            <span class="resource-icon">${res.icon || '📁'}</span>
                            <div class="resource-text">
                                <h4 class="resource-title">${res.title}</h4>
                                ${res.description ? `<p class="resource-desc">${res.description}</p>` : ''}
                            </div>
                        </div>
                        <a href="${res.url}" download class="btn btn-secondary">
                            📥 ${lang === 'pt' ? 'Baixar' : 'Download'}
                        </a>
                    </div>
                `;
            });

            html += `</div></section>`;
        }

        return html;
    }

    // 2. Renderização para práticas no formato JSON Completo

    // Objetivos
    if (practice.objectives?.length > 0) {
        html += `<section class="practice-section"><h2 class="section-heading">📌 ${lang === 'pt' ? 'Objetivos de Aprendizagem' : 'Learning Objectives'}</h2><ul class="objectives-list">`;
        practice.objectives.forEach(obj => { html += `<li>${obj}</li>`; });
        html += `</ul></section>`;
    }

    // Pré-requisitos
    if (practice.prerequisites?.length > 0) {
        html += `<section class="practice-section"><h2 class="section-heading">🔑 ${lang === 'pt' ? 'Pré-requisitos' : 'Prerequisites'}</h2><ul class="objectives-list">`;
        practice.prerequisites.forEach(pre => { html += `<li>${pre}</li>`; });
        html += `</ul></section>`;
    }

    // Materiais
    if (practice.materials?.length > 0) {
        html += `<section class="practice-section"><h2 class="section-heading">🔧 ${lang === 'pt' ? 'Materiais Necessários' : 'Required Materials'}</h2><div class="materials-grid">`;
        practice.materials.forEach(mat => {
            html += `<div class="material-item"><span class="material-qty">${mat.quantity}x</span><span class="material-name">${mat.name}</span>`;
            if (mat.notes) html += `<span class="material-notes">${mat.notes}</span>`;
            html += `</div>`;
        });
        html += `</div></section>`;
    }

    // Diagrama de Conexões (Wiring)
    if (practice.wiring) {
        html += `<section class="practice-section"><h2 class="section-heading">🔌 ${lang === 'pt' ? 'Conexões e Diagrama' : 'Wiring & Diagram'}</h2>`;
        if (practice.wiring.description) html += `<p>${practice.wiring.description}</p>`;
        if (practice.wiring.diagram) {
            html += `<div class="step-image-container"><img src="${practice.wiring.diagram}" alt="Diagrama de conexões" class="step-image"></div>`;
        }
        if (practice.wiring.warnings?.length > 0) {
            html += `<div class="troubleshooting-item" style="background:#fff3cd; border-color:#ffeba2;">`;
            practice.wiring.warnings.forEach(warn => { html += `<p style="margin:4px 0; color:#856404;">⚠️ ${warn}</p>`; });
            html += `</div>`;
        }
        html += `</section>`;
    }

    // Teoria
    if (practice.theory) {
        html += `<section class="practice-section"><h2 class="section-heading">📚 ${lang === 'pt' ? 'Fundamentos Teóricos' : 'Theoretical Background'}</h2>`;
        Object.entries(practice.theory).forEach(([key, value]) => {
            html += `<div style="margin-bottom: 12px;"><strong>${key.toUpperCase()}:</strong> <p>${value}</p></div>`;
        });
        html += `</section>`;
    }

    // Passo a Passo
    if (practice.steps?.length > 0) {
        html += `<section class="practice-section"><h2 class="section-heading">📝 ${lang === 'pt' ? 'Passo a Passo' : 'Step by Step'}</h2><div class="steps-list">`;
        practice.steps.forEach(step => {
            html += `<div class="step-item"><div class="step-number">${step.number}</div><div class="step-content"><h3 class="step-title">${step.title}</h3><p class="step-description">${step.description}</p>`;
            if (step.image) {
                html += `<div class="step-image-container"><img src="${step.image}" alt="${step.title}" class="step-image"></div>`;
            }
            if (step.details?.length > 0) {
                html += `<ul class="step-details">`;
                step.details.forEach(detail => html += `<li>${detail}</li>`);
                html += `</ul>`;
            }
            if (step.time) html += `<span class="step-time">⏱️ ${step.time}</span>`;
            html += `</div></div>`;
        });
        html += `</div></section>`;
    }

    // Código / Pseudocódigo
    if (practice.code) {
        html += `<section class="practice-section"><h2 class="section-heading">💻 ${lang === 'pt' ? 'Lógica do Código' : 'Code Logic'}</h2>`;
        if (practice.code.description) html += `<p>${practice.code.description}</p>`;
        if (practice.code.pseudocode) {
            html += `<pre style="background:#2d2d2d; color:#f8f8f2; padding:15px; border-radius:8px; overflow-x:auto;"><code>${practice.code.pseudocode}</code></pre>`;
        }
        if (practice.code.notes) html += `<small>${practice.code.notes}</small>`;
        html += `</section>`;
    }

    // Projeto BIPES
    if (practice.bipesProject) {
        html += `<section class="practice-section bipes-section"><h2 class="section-heading">🚀 ${lang === 'pt' ? 'Projeto no BIPES' : 'BIPES Project'}</h2><p>${practice.bipesProject.description || ''}</p><div class="bipes-buttons"><a href="${practice.bipesProject.url}" target="_blank" class="btn btn-primary btn-large">🔗 ${lang === 'pt' ? 'Abrir no BIPES' : 'Open in BIPES'}</a></div></section>`;
    }

    // Desafios
    if (practice.challenges?.length > 0) {
        html += `<section class="practice-section"><h2 class="section-heading">🎯 ${lang === 'pt' ? 'Desafios Práticos' : 'Challenges'}</h2><div class="materials-grid">`;
        practice.challenges.forEach(ch => {
            html += `<div class="material-item"><strong>${ch.title} (${ch.difficulty})</strong><p>${ch.description}</p></div>`;
        });
        html += `</div></section>`;
    }

    // Solução de Problemas (Troubleshooting)
    if (practice.troubleshooting?.length > 0) {
        html += `<section class="practice-section"><h2 class="section-heading">🆘 ${lang === 'pt' ? 'Solução de Problemas' : 'Troubleshooting'}</h2><div class="troubleshooting-list">`;
        practice.troubleshooting.forEach(item => {
            html += `<div class="troubleshooting-item"><h4 class="problem-title">❌ ${item.problem}</h4><ul class="solutions-list">`;
            item.solutions.forEach(solution => html += `<li>✓ ${solution}</li>`);
            html += `</ul></div>`;
        });
        html += `</div></section>`;
    }

    // Arquivos para download no final de práticas formato JSON Completo
    if (practice.resources && practice.resources.length > 0) {
        html += `
            <section class="practice-section resources-section">
                <h2 class="section-heading">⚙️ ${lang === 'pt' ? 'Arquivos de Configuração / Recursos' : 'Configuration Files / Resources'}</h2>
                <div class="resources-grid">
        `;
        practice.resources.forEach(res => {
            html += `
                <div class="resource-card">
                    <div class="resource-info">
                        <span class="resource-icon">${res.icon || '📁'}</span>
                        <div class="resource-text">
                            <h4 class="resource-title">${res.title}</h4>
                            ${res.description ? `<p class="resource-desc">${res.description}</p>` : ''}
                        </div>
                    </div>
                    <a href="${res.url}" download class="btn btn-secondary">
                        📥 ${lang === 'pt' ? 'Baixar' : 'Download'}
                    </a>
                </div>
            `;
        });
        html += `</div></section>`;
    }

    return html;
}

function createNavigationButtons(practice, module, lang) {
    const currentIndex = module.practices.findIndex(p => p.id === practice.id);
    const nextPractice = module.practices[currentIndex + 1];
    const prevPractice = module.practices[currentIndex - 1];

    let html = '<div class="practice-navigation">';

    if (prevPractice) {
        html += `<button class="nav-btn nav-btn-prev" onclick="navigateToPractice('${module.id}', '${prevPractice.id}')">← ${lang === 'pt' ? 'Anterior' : 'Previous'}: ${prevPractice.title}</button>`;
    } else {
        html += '<div></div>';
    }

    if (nextPractice) {
        html += `<button class="nav-btn nav-btn-next" onclick="navigateToPractice('${module.id}', '${nextPractice.id}')">${lang === 'pt' ? 'Próxima' : 'Next'}: ${nextPractice.title} →</button>`;
    }

    html += '</div>';
    return html;
}

// ================================
// UTILIDADES
// ================================
function showError(message) {
    document.getElementById('app').innerHTML = `
        <div class="container">
            <div class="error-box">
                <h2>⚠️ Erro</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="navigateHome()">Voltar ao Início</button>
            </div>
        </div>
    `;
}
