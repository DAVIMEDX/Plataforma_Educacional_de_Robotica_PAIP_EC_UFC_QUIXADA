
/* ==========================================================
   ROBÓTICA EDUCACIONAL — SCRIPT.JS

   Versão integrada:
   - Base: script.js refatorado e validado
   - Módulos práticos preservados
   - Módulos teóricos acrescentados
   - Navegação por hash
   - Arquivos JSON em português
   - Idioma inglês desativado
   - BIPES, ROS 2 e recursos preservados

   Diretórios:
   data/modules.json
   data/practices/pt/
   data/theory/pt/
========================================================== */

'use strict';

// ==========================================================
// 1. ESTADO DA APLICAÇÃO
// ==========================================================

const AppState = {
    currentLang: 'pt',
    modules: null,
    currentView: 'home',
    currentModule: null,
    currentPractice: null,
    navigationVersion: 0
};

// ==========================================================
// 2. INICIALIZAÇÃO
// ==========================================================

document.addEventListener('DOMContentLoaded', async () => {
    const loaded = await loadModulesData();

    if (!loaded) {
        return;
    }

    // Mantém o idioma inglês desativado.
    // initializeLanguage();

    updateLanguage();
    initializeRouter();
});

// ==========================================================
// 3. FUNÇÕES UTILITÁRIAS
// ==========================================================

function escapeHtml(value) {
    return String(value ?? '').replace(
        /[&<>"']/g,
        char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char])
    );
}

function safeId(value) {
    const id = String(value ?? '');

    return /^[a-zA-Z0-9_-]+$/.test(id)
        ? id
        : '';
}

function safeColor(value) {
    const color = String(value ?? '');

    return /^#[0-9a-fA-F]{3,8}$/.test(color)
        ? color
        : '#64748b';
}

function safeUrl(value, allowExternal = true) {
    if (typeof value !== 'string') {
        return '';
    }

    const url = value.trim();

    if (!url || /[\u0000-\u001F\u007F\\]/.test(url)) {
        return '';
    }

    if (url.startsWith('//')) {
        return '';
    }

    if (/^https?:\/\//i.test(url)) {
        if (!allowExternal) {
            return '';
        }

        try {
            const parsed = new URL(url);

            return ['http:', 'https:'].includes(parsed.protocol)
                ? parsed.href
                : '';
        } catch {
            return '';
        }
    }

    // Impede esquemas como javascript:, data: e file:.
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
        return '';
    }

    // Evita caminhos externos disfarçados.
    if (
        url.startsWith('/') &&
        !url.startsWith('./') &&
        !url.startsWith('../')
    ) {
        return url.startsWith('//') ? '' : url;
    }

    if (
        url.startsWith('./') ||
        url.startsWith('../') ||
        /^[a-zA-Z0-9_-]/.test(url)
    ) {
        return url;
    }

    return '';
}

function renderText(value) {
    return escapeHtml(value);
}

function renderList(items, className = 'step-details') {
    if (!Array.isArray(items) || !items.length) {
        return '';
    }

    return `
        <ul class="${escapeHtml(className)}">
            ${items.map(item => `
                <li>${renderText(item)}</li>
            `).join('')}
        </ul>
    `;
}

function renderCode(code, language = '') {
    if (code === undefined || code === null) {
        return '';
    }

    return `
        <pre><code class="language-${escapeHtml(language)}">${escapeHtml(code)}</code></pre>
    `;
}

function renderCommand(command) {
    if (typeof command === 'string') {
        return renderCode(command, 'bash');
    }

    if (!command || typeof command !== 'object') {
        return '';
    }

    return `
        <div class="resource-card">
            <div class="resource-text" style="width:100%">
                ${command.description ? `
                    <p class="resource-desc">
                        ${renderText(command.description)}
                    </p>
                ` : ''}

                ${renderCode(command.command, 'bash')}
            </div>
        </div>
    `;
}

function section(title, content, extraClass = '') {
    if (!content || !String(content).trim()) {
        return '';
    }

    return `
        <section class="practice-section ${escapeHtml(extraClass)}">
            <h2 class="section-heading">
                ${renderText(title)}
            </h2>
            ${content}
        </section>
    `;
}

function renderStructuredValue(value) {
    if (value === null || value === undefined) {
        return '';
    }

    if (Array.isArray(value)) {
        return renderList(value.map(item =>
            typeof item === 'object'
                ? JSON.stringify(item)
                : item
        ));
    }

    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([key, item]) => `
                <div style="margin-bottom:12px">
                    <strong>${renderText(key)}:</strong>
                    ${renderStructuredValue(item)}
                </div>
            `)
            .join('');
    }

    return `<p>${renderText(value)}</p>`;
}

// ==========================================================
// 4. CARREGAMENTO DOS DADOS
// ==========================================================

async function loadModulesData() {
    try {
        const response = await fetch('data/modules.json');

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} ao carregar modules.json`
            );
        }

        const data = await response.json();

        if (
            !data ||
            !data.pt ||
            !Array.isArray(data.pt.modules)
        ) {
            throw new Error('Estrutura de módulos inválida.');
        }

        // Os módulos teóricos são opcionais para manter
        // compatibilidade com o catálogo já validado.
        if (
            data.pt.theoryModules !== undefined &&
            !Array.isArray(data.pt.theoryModules)
        ) {
            throw new Error(
                'A propriedade pt.theoryModules deve ser um array.'
            );
        }

        AppState.modules = data;
        return true;

    } catch (error) {
        console.error('Erro nos módulos:', error);

        AppState.modules = null;

        showError(
            'Não foi possível carregar os módulos da plataforma.'
        );

        return false;
    }
}

async function loadPracticeData(moduleId, practiceId) {
    const lang = AppState.currentLang;

    if (!safeId(moduleId) || !safeId(practiceId)) {
        console.error('Identificador de prática inválido.');
        return null;
    }

    const path =
        `data/practices/${lang}/` +
        `${moduleId}-${practiceId}.json`;

    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${path}`
            );
        }

        const data = await response.json();

        if (!data || typeof data !== 'object') {
            throw new Error('Conteúdo JSON inválido.');
        }

        return data;

    } catch (error) {
        console.error('Erro ao carregar prática:', error);
        return null;
    }
}

// ==========================================================
// 5. CARREGAMENTO DAS AULAS TEÓRICAS — NOVO
// ==========================================================

function getTheoryModules() {
    const modules = AppState.modules?.pt?.theoryModules;

    return Array.isArray(modules)
        ? modules
        : [];
}

function getTheoryModule(moduleId) {
    if (!safeId(moduleId)) {
        return null;
    }

    return getTheoryModules().find(
        module => module.id === moduleId
    ) || null;
}

function getOrderedTheoryLessons(module) {
    if (!Array.isArray(module?.lessons)) {
        return [];
    }

    return module.lessons.slice().sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
}

async function loadTheoryData(moduleId, lessonInfo) {
    const lessonId = safeId(lessonInfo?.id);

    if (!safeId(moduleId) || !lessonId) {
        throw new Error('Identificador da aula inválido.');
    }

    const expectedPath =
        `data/theory/pt/${lessonId}.json`;

    // Somente permite arquivos teóricos cadastrados
    // no diretório em português da plataforma.
    if (lessonInfo.file !== expectedPath) {
        throw new Error(
            'Caminho da aula não corresponde ao catálogo.'
        );
    }

    const response = await fetch(expectedPath);

    if (!response.ok) {
        throw new Error(
            `HTTP ${response.status}: ${expectedPath}`
        );
    }

    const lesson = await response.json();

    if (
        !lesson ||
        typeof lesson !== 'object' ||
        Array.isArray(lesson) ||
        lesson.id !== lessonId ||
        lesson.moduleId !== moduleId ||
        lesson.type !== 'theory'
    ) {
        throw new Error(
            'Os dados da aula não correspondem ao módulo.'
        );
    }

    return lesson;
}

// ==========================================================
// 6. ROTEAMENTO
// ==========================================================

function initializeRouter() {
    window.addEventListener('hashchange', router);
    router();
}


async function router() {
    const version = ++AppState.navigationVersion;

    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);

    if (parts.length === 0) {
        renderHome();

    } else if (
        parts.length === 1 &&
        parts[0] === 'aprender'
    ) {
        renderCatalog();

    } else if (
        parts.length === 2 &&
        parts[0] === 'theory'
    ) {
        renderTheoryModule(parts[1]);

    } else if (
        parts.length === 4 &&
        parts[0] === 'theory' &&
        parts[2] === 'lesson'
    ) {
        await renderTheoryLesson(
            parts[1],
            parts[3],
            version
        );

    } else if (
        parts.length === 2 &&
        parts[0] === 'module'
    ) {
        renderModule(parts[1]);

    } else if (
        parts.length === 4 &&
        parts[0] === 'module' &&
        parts[2] === 'practice'
    ) {
        await renderPractice(
            parts[1],
            parts[3],
            version
        );

    } else {
        renderHome();
    }

    if (version === AppState.navigationVersion) {
        window.scrollTo(0, 0);
    }
}


function navigateHome() {
    if (window.location.hash === '#/') {
        router();
    } else {
        window.location.hash = '/';
    }
}

function navigateToModule(moduleId) {
    if (!safeId(moduleId)) {
        return;
    }

    const route = `/module/${moduleId}`;

    if (window.location.hash === `#${route}`) {
        router();
    } else {
        window.location.hash = route;
    }
}

function navigateToPractice(moduleId, practiceId) {
    if (!safeId(moduleId) || !safeId(practiceId)) {
        return;
    }

    const route =
        `/module/${moduleId}/practice/${practiceId}`;

    if (window.location.hash === `#${route}`) {
        router();
    } else {
        window.location.hash = route;
    }
}

// ==========================================================
// 7. NAVEGAÇÃO TEÓRICA — NOVO
// ==========================================================

function navigateToTheoryModule(moduleId) {
    if (!safeId(moduleId)) {
        return;
    }

    const route = `/theory/${moduleId}`;

    if (window.location.hash === `#${route}`) {
        router();
    } else {
        window.location.hash = route;
    }
}

function navigateToTheoryLesson(moduleId, lessonId) {
    if (!safeId(moduleId) || !safeId(lessonId)) {
        return;
    }

    const route =
        `/theory/${moduleId}/lesson/${lessonId}`;

    if (window.location.hash === `#${route}`) {
        router();
    } else {
        window.location.hash = route;
    }
}

// ==========================================================
// 8. IDIOMA
// ==========================================================

// Idioma inglês mantido no projeto, porém desativado.
// Nenhuma função de troca é inicializada.

function updateLanguage() {
    const data = AppState.modules?.[AppState.currentLang];

    if (!data) {
        return;
    }

    document.documentElement.lang = 'pt-BR';

    const siteName = document.getElementById('siteName');
    const homeText = document.getElementById('homeText');

    if (siteName) {
        siteName.textContent = data.siteName || '';
    }

    if (homeText) {
        homeText.textContent = data.home || 'Início';
    }
}

// ==========================================================
// 9. BREADCRUMB
// ==========================================================

function updateBreadcrumb(items) {
    const breadcrumb =
        document.getElementById('breadcrumb');

    const container =
        document.getElementById('breadcrumbItems');

    if (!breadcrumb || !container) {
        return;
    }

    if (!Array.isArray(items) || items.length === 0) {
        breadcrumb.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    breadcrumb.style.display = 'block';

    container.innerHTML = items.map(item => {
        if (item.link) {
            const route = item.link === '/'
                ? '/'
                : safeUrl(item.link, false);

            return `
                <a
                    class="breadcrumb-item"
                    href="#${escapeHtml(route || '/')}"
                >
                    ${renderText(item.text)}
                </a>
            `;
        }

        return `
            <span class="breadcrumb-item active">
                ${renderText(item.text)}
            </span>
        `;
    }).join('<span class="breadcrumb-separator">›</span>');
}

// ==========================================================
// 10. PÁGINA INICIAL
// ==========================================================

function renderCatalog() {
    const app = document.getElementById('app');
    const data = AppState.modules?.pt;

    if (!app || !data) {
        showError('Dados não carregados.');
        return;
    }

    AppState.currentView = 'home';
    AppState.currentModule = null;
    AppState.currentPractice = null;

    updateBreadcrumb([]);

    // Agrupamento original dos módulos práticos.
    const groups = {};

    data.modules.forEach(module => {
        const category = module.category || 'Outros';

        if (!groups[category]) {
            groups[category] = [];
        }

        groups[category].push(module);
    });

    const totalPractices = data.modules.reduce(
        (total, module) =>
            total + (module.practices?.length || 0),
        0
    );

    const modulesHtml = Object.entries(groups)
        .map(([category, modules]) => `
            <div class="category-section">
                <h3 class="category-title">
                    ${renderText(category)}
                </h3>

                <div class="modules-grid">
                    ${modules.map(createModuleCard).join('')}
                </div>
            </div>
        `).join('');

    // NOVO: conteúdo teórico antes das práticas.
    const theoryModules = getTheoryModules()
        .slice()
        .sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );

    const theoryHtml = theoryModules
        .map(createTheoryModuleCard)
        .join('');

    const totalTheoryLessons = theoryModules.reduce(
        (total, module) =>
            total + (
                Array.isArray(module.lessons)
                    ? module.lessons.length
                    : 0
            ),
        0
    );

    app.innerHTML = `
        <section class="hero-section">
            <div class="container">

                <h1 class="hero-title">
                    ${renderText(data.siteName)}
                </h1>

                <p class="hero-subtitle">
                    ${renderText(data.siteSubtitle)}
                </p>

                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-number">
                            ${data.modules.length}
                        </span>
                        <span class="stat-label">
                            Módulos Práticos
                        </span>
                    </div>

                    <div class="stat-item">
                        <span class="stat-number">
                            ${totalPractices}
                        </span>
                        <span class="stat-label">
                            Práticas
                        </span>
                    </div>

                    <div class="stat-item">
                        <span class="stat-number">
                            ${totalTheoryLessons}
                        </span>
                        <span class="stat-label">
                            Aulas Teóricas
                        </span>
                    </div>
                </div>

            </div>
        </section>

        ${theoryHtml ? `
            <section class="modules-section theory-home-section">
                <div class="container">

                    <h2 class="section-title">
                        📖 Comece por Aqui
                    </h2>

                    <p class="module-detail-description">
                        Conheça os fundamentos da robótica,
                        entenda como os sistemas funcionam e
                        prepare-se para as atividades práticas.
                    </p>

                    <div class="modules-grid">
                        ${theoryHtml}
                    </div>

                </div>
            </section>
        ` : ''}

        <section class="modules-section">
            <div class="container">

                <h2 class="section-title">
                    Escolha sua Trilha
                </h2>

                ${modulesHtml}

            </div>
        </section>

        <section class="info-section">
            <div class="container">
                <div class="info-grid">

                    <div class="info-card">
                        <div class="info-icon">🎯</div>
                        <h3>Progressivo</h3>
                        <p>
                            Aprenda do básico ao avançado
                            com conteúdos e práticas estruturados.
                        </p>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">🔧</div>
                        <h3>Prático</h3>
                        <p>
                            Projetos reais com hardware
                            e sucata integrados.
                        </p>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">🌐</div>
                        <h3>Padrão Industrial</h3>
                        <p>
                            Tecnologias ROS 2 para
                            desenvolvimento robótico.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    `;
}


function renderHome() {
    const app = document.getElementById('app');
    const data = AppState.modules?.pt;

    if (!app || !data) {
        showError('Dados não carregados.');
        return;
    }

    AppState.currentView = 'home';
    AppState.currentModule = null;
    AppState.currentPractice = null;

    updateBreadcrumb([]);

    const totalPractices = data.modules.reduce(
        (total, module) =>
            total + (module.practices?.length || 0),
        0
    );

    const theoryModules = getTheoryModules();

    const totalLessons = theoryModules.reduce(
        (total, module) =>
            total + (module.lessons?.length || 0),
        0
    );

    app.innerHTML = `
        <section class="hero-section landing-hero">
            <div class="container">

                <p class="landing-eyebrow">
                    UFC · Engenharia de Computação · Disciplina de Robótica
                </p>

                <h1 class="hero-title">
                    Aprenda robótica na teoria e na prática.
                </h1>

                <p class="hero-subtitle">
                    Plataforma educacional de apoio à disciplina
                    de Robótica, integrando fundamentos teóricos,
                    experimentação, programação, simulação,
                    sistemas embarcados e fabricação digital.
                </p>

                <a
                    href="#/aprender"
                    class="btn btn-primary landing-cta"
                >
                    Explorar aulas e práticas →
                </a>

            </div>
        </section>

        <section class="info-section landing-pedagogy">
            <div class="container">

                <h2 class="section-title">
                    Aprendizagem progressiva e aplicada
                </h2>

                <p class="landing-introduction">
                    Desenvolvida para apoiar as atividades da
                    disciplina de Robótica, esta plataforma
                    reúne conteúdos, tutoriais e desafios que
                    favorecem a aprendizagem por meio da
                    investigação, da experimentação e da
                    resolução de problemas.

                    O Loki 200 mm é um dos projetos integradores
                    nos quais os estudantes podem aplicar
                    os conhecimentos desenvolvidos.
                </p>

                <div class="info-grid">

                    <article class="info-card">
                        <div class="info-icon">📖</div>

                        <h3>Fundamentação teórica</h3>

                        <p>
                            Estudo dos princípios fundamentais
                            dos sistemas robóticos, comunicação,
                            controle e autonomia.
                        </p>
                    </article>

                    <article class="info-card">
                        <div class="info-icon">🧪</div>

                        <h3>Experimentação prática</h3>

                        <p>
                            Atividades de programação, simulação,
                            fabricação digital e integração
                            de componentes físicos.
                        </p>
                    </article>

                    <article class="info-card">
                        <div class="info-icon">🤖</div>

                        <h3>Projetos integradores</h3>

                        <p>
                            Aplicação de conceitos em projetos
                            que relacionam teoria, prática e
                            solução de problemas reais.
                        </p>
                    </article>

                </div>

                <p class="landing-counts">
                    ${theoryModules.length} módulo(s) teórico(s) ·
                    ${totalLessons} aulas teóricas ·
                    ${data.modules.length} módulos práticos ·
                    ${totalPractices} práticas
                </p>

            </div>
        </section>
    `;
}


function navigateToCatalog() {
    if (window.location.hash === '#/aprender') {
        router();
    } else {
        window.location.hash = '/aprender';
    }
}



// ==========================================================
// 11. CARTÕES DOS MÓDULOS PRÁTICOS
// ==========================================================

function createModuleCard(module) {
    const id = safeId(module.id);

    if (!id) {
        return '';
    }

    return `
        <div
            class="module-card"
            style="border-left-color:${safeColor(module.color)}"
        >
            <div class="module-header">
                <span class="module-icon">
                    ${renderText(module.icon)}
                </span>

                <div class="module-title-group">
                    <h3 class="module-title">
                        ${renderText(module.title)}
                    </h3>

                    <p class="module-subtitle">
                        ${renderText(module.subtitle)}
                    </p>
                </div>
            </div>

            <p class="module-description">
                ${renderText(module.description)}
            </p>

            <div class="module-meta">
                <span class="meta-item">
                    📚 ${module.practices?.length || 0} práticas
                </span>

                <span class="meta-item">
                    ⏱️ ${renderText(module.duration)}
                </span>

                <span class="meta-item">
                    📊 ${renderText(module.level)}
                </span>
            </div>

            <button
                type="button"
                class="module-button"
                onclick="navigateToModule('${id}')"
            >
                Ver Práticas →
            </button>
        </div>
    `;
}

// ==========================================================
// 12. CARTÕES DOS MÓDULOS TEÓRICOS — NOVO
// ==========================================================

function createTheoryModuleCard(module) {
    const id = safeId(module.id);

    if (!id) {
        return '';
    }

    const count = Array.isArray(module.lessons)
        ? module.lessons.length
        : 0;

    return `
        <div
            class="module-card theory-module-card"
            style="border-left-color:${safeColor(module.color)}"
        >
            <div class="module-header">
                <span class="module-icon">
                    ${renderText(module.icon || '📖')}
                </span>

                <div class="module-title-group">
                    <h3 class="module-title">
                        ${renderText(module.title)}
                    </h3>

                    <p class="module-subtitle">
                        ${renderText(module.subtitle)}
                    </p>
                </div>
            </div>

            <p class="module-description">
                ${renderText(module.description)}
            </p>

            <div class="module-meta">
                <span class="meta-item">
                    📖 ${count} aulas
                </span>

                <span class="meta-item">
                    ⏱️ ${renderText(module.duration)}
                </span>

                <span class="meta-item">
                    📊 ${renderText(module.level)}
                </span>
            </div>

            <button
                type="button"
                class="module-button"
                onclick="navigateToTheoryModule('${id}')"
            >
                Ver Aulas →
            </button>
        </div>
    `;
}

// ==========================================================
// 13. PÁGINA DO MÓDULO TEÓRICO — NOVO
// ==========================================================

function renderTheoryModule(moduleId) {
    const module = getTheoryModule(moduleId);

    if (!module) {
        showError('Módulo teórico não encontrado.');
        return;
    }

    const app = document.getElementById('app');

    if (!app) {
        return;
    }

    const lessons = getOrderedTheoryLessons(module);

    AppState.currentView = 'theory-module';
    AppState.currentModule = moduleId;
    AppState.currentPractice = null;

    updateBreadcrumb([
        {
            text: AppState.modules.pt.home || 'Início',
            link: '/'
        },
        {
            text: module.title,
            link: null
        }
    ]);

    const cards = lessons.map((lesson, index) => {
        const lessonId = safeId(lesson.id);

        if (!lessonId) {
            return '';
        }

        return `
            <div class="practice-card-compact">

                <div class="practice-number">
                    ${index + 1}
                </div>

                <div class="practice-icon-large">
                    ${renderText(lesson.icon || '📖')}
                </div>

                <div class="practice-content-compact">
                    <h3 class="practice-title-compact">
                        ${renderText(lesson.title)}
                    </h3>

                    <p class="practice-description-compact">
                        ${renderText(
            lesson.shortDescription ||
            lesson.description
        )}
                    </p>

                    <div class="practice-meta-compact">
                        <span class="meta-badge-small">
                            ⏱️ ${renderText(lesson.duration)}
                        </span>

                        <span class="meta-badge-small">
                            📊 ${renderText(lesson.difficulty)}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    class="practice-button-compact"
                    onclick="navigateToTheoryLesson(
                        '${safeId(moduleId)}',
                        '${lessonId}'
                    )"
                >
                    Estudar →
                </button>
            </div>
        `;
    }).join('');

    app.innerHTML = `
        <div class="container">

            <div
                class="module-detail-header"
                style="border-left-color:${safeColor(module.color)}"
            >
                <span class="module-detail-icon">
                    ${renderText(module.icon || '📖')}
                </span>

                <div>
                    <h1 class="module-detail-title">
                        ${renderText(module.title)}
                    </h1>

                    <p class="module-detail-subtitle">
                        ${renderText(module.subtitle)}
                    </p>
                </div>
            </div>

            <div class="module-detail-meta">
                <span class="meta-badge">
                    📖 ${lessons.length} aulas
                </span>

                <span class="meta-badge">
                    ⏱️ ${renderText(module.duration)}
                </span>

                <span class="meta-badge">
                    📊 ${renderText(module.level)}
                </span>
            </div>

            <p class="module-detail-description">
                ${renderText(module.description)}
            </p>

            <h2 class="practices-title">
                Sequência de Aprendizagem
            </h2>

            <div class="practices-list">
                ${cards}
            </div>

        </div>
    `;
}

// ==========================================================
// 14. PÁGINA DA AULA TEÓRICA — NOVO
// ==========================================================

async function renderTheoryLesson(
    moduleId,
    lessonId,
    navigationVersion = AppState.navigationVersion
) {
    const app = document.getElementById('app');
    const module = getTheoryModule(moduleId);

    const lessons = getOrderedTheoryLessons(module);

    const index = lessons.findIndex(
        item => item.id === lessonId
    );

    const lessonInfo = lessons[index];

    if (
        !app ||
        !module ||
        !lessonInfo ||
        !safeId(lessonId)
    ) {
        showError('Aula teórica não encontrada.');
        return;
    }

    app.innerHTML = `
        <div class="loading" role="status">
            <div class="spinner"></div>
            <p>Carregando aula...</p>
        </div>
    `;

    let lesson;

    try {
        lesson = await loadTheoryData(
            moduleId,
            lessonInfo
        );
    } catch (error) {
        console.error(
            'Erro ao carregar aula teórica:',
            error
        );

        if (
            navigationVersion ===
            AppState.navigationVersion
        ) {
            showError(
                'Não foi possível carregar esta aula. ' +
                'Confira o caminho e o conteúdo do JSON.'
            );
        }

        return;
    }

    // Impede navegação antiga de sobrescrever
    // outra página carregada posteriormente.
    if (
        navigationVersion !==
        AppState.navigationVersion
    ) {
        return;
    }

    AppState.currentView = 'theory-lesson';
    AppState.currentModule = moduleId;
    AppState.currentPractice = lessonId;

    updateBreadcrumb([
        {
            text: AppState.modules.pt.home || 'Início',
            link: '/'
        },
        {
            text: module.title,
            link: `/theory/${moduleId}`
        },
        {
            text: lesson.title || lessonInfo.title,
            link: null
        }
    ]);

    const previous = lessons[index - 1];
    const next = lessons[index + 1];

    const previousButton = previous ? `
        <button
            type="button"
            class="nav-btn nav-btn-prev"
            onclick="navigateToTheoryLesson(
                '${safeId(moduleId)}',
                '${safeId(previous.id)}'
            )"
        >
            ← Anterior:
            ${renderText(previous.title)}
        </button>
    ` : `
        <button
            type="button"
            class="nav-btn nav-btn-prev"
            onclick="navigateToTheoryModule(
                '${safeId(moduleId)}'
            )"
        >
            ← Todas as Aulas
        </button>
    `;

    const nextButton = next ? `
        <button
            type="button"
            class="nav-btn nav-btn-next"
            onclick="navigateToTheoryLesson(
                '${safeId(moduleId)}',
                '${safeId(next.id)}'
            )"
        >
            Próxima:
            ${renderText(next.title)} →
        </button>
    ` : `
        <button
            type="button"
            class="nav-btn nav-btn-next"
            onclick="navigateToCatalog()"
        >
            Explorar Trilhas Práticas →
        </button>
    `;

    app.innerHTML = `
        <div class="container practice-container theory-lesson">

            <div class="practice-header-full">
                <span class="practice-icon-huge">
                    ${renderText(lessonInfo.icon || '📖')}
                </span>

                <div>
                    <h1 class="practice-title-full">
                        ${renderText(
        lesson.title ||
        lessonInfo.title
    )}
                    </h1>

                    <p class="practice-description-full">
                        ${renderText(
        lesson.subtitle ||
        lesson.description
    )}
                    </p>
                </div>
            </div>

            <div class="practice-meta-full">
                <span class="meta-badge">
                    📖 Aula Teórica
                </span>

                <span class="meta-badge">
                    ⏱️ ${renderText(
        lesson.duration ||
        lessonInfo.duration
    )}
                </span>

                <span class="meta-badge">
                    📊 ${renderText(
        lesson.difficulty ||
        lessonInfo.difficulty
    )}
                </span>
            </div>

            ${createTheorySections(lesson)}

            <div class="practice-navigation">
                ${previousButton}
                ${nextButton}
            </div>

        </div>
    `;
}

// ==========================================================
// 15. CONTEÚDO DAS AULAS TEÓRICAS — NOVO
// ==========================================================

function createTheorySections(lesson) {
    const blocks = [];

    blocks.push(section(
        '📌 Objetivos de Aprendizagem',
        renderList(
            lesson.objectives,
            'objectives-list'
        )
    ));

    blocks.push(section(
        '🔑 Pré-requisitos',
        renderList(
            lesson.prerequisites,
            'objectives-list'
        )
    ));

    // Renderização do conteúdo teórico em Markdown.
    blocks.push(renderMarkdownSection(lesson));

    if (lesson.theory) {
        blocks.push(section(
            '📖 Glossário e Conceitos-Chave',
            renderStructuredValue(lesson.theory)
        ));
    }

    // Reaproveita renderizadores já validados.
    blocks.push(renderStepsSection(lesson));

    blocks.push(renderChallengesSection(lesson));

    blocks.push(renderNextStepsSection(lesson));

    blocks.push(
        renderTheoryReferences(lesson.references)
    );

    return blocks.filter(Boolean).join('\n');
}

function renderTheoryReferences(references) {
    if (!Array.isArray(references) || !references.length) {
        return '';
    }

    const items = references.map(reference => {
        const url = safeUrl(reference?.url);

        // As referências bibliográficas utilizam
        // somente links HTTP ou HTTPS.
        if (!url || !/^https?:\/\//i.test(url)) {
            return '';
        }

        return `
            <li>
                <a
                    href="${escapeHtml(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${renderText(reference.title || url)}
                </a>
            </li>
        `;
    }).filter(Boolean).join('');

    return section(
        '📚 Referências Bibliográficas',
        items
            ? `<ul class="step-details">${items}</ul>`
            : ''
    );
}

// ==========================================================
// 16. PÁGINA DO MÓDULO PRÁTICO
// ==========================================================

function renderModule(moduleId) {
    const data = AppState.modules?.pt;

    const module = data?.modules.find(
        item => item.id === moduleId
    );

    if (!module) {
        renderHome();
        return;
    }

    AppState.currentView = 'module';
    AppState.currentModule = moduleId;
    AppState.currentPractice = null;

    updateBreadcrumb([
        { text: data.home, link: '/' },
        { text: module.title, link: null }
    ]);

    const practices = Array.isArray(module.practices)
        ? module.practices
        : [];

    const cards = practices.map(
        (practice, index) =>
            createPracticeCard(practice, module, index + 1)
    ).join('');

    document.getElementById('app').innerHTML = `
        <div class="container">

            <div
                class="module-detail-header"
                style="border-left-color:${safeColor(module.color)}"
            >
                <span class="module-detail-icon">
                    ${renderText(module.icon)}
                </span>

                <div>
                    <h1 class="module-detail-title">
                        ${renderText(module.title)}
                    </h1>

                    <p class="module-detail-subtitle">
                        ${renderText(module.subtitle)}
                    </p>
                </div>
            </div>

            <div class="module-detail-meta">
                <span class="meta-badge">
                    📊 ${renderText(module.level)}
                </span>

                <span class="meta-badge">
                    ⏱️ ${renderText(module.duration)}
                </span>

                <span class="meta-badge">
                    📚 ${practices.length} práticas
                </span>
            </div>

            <p class="module-detail-description">
                ${renderText(module.description)}
            </p>

            <h2 class="practices-title">Práticas</h2>

            <div class="practices-list">
                ${cards}
            </div>

        </div>
    `;
}

function createPracticeCard(practice, module, number) {
    const moduleId = safeId(module.id);
    const practiceId = safeId(practice.id);

    if (!moduleId || !practiceId) {
        return '';
    }

    return `
        <div class="practice-card-compact">

            <div class="practice-number">
                ${number}
            </div>

            <div class="practice-icon-large">
                ${renderText(practice.icon)}
            </div>

            <div class="practice-content-compact">
                <h3 class="practice-title-compact">
                    ${renderText(practice.title)}
                </h3>

                <p class="practice-description-compact">
                    ${renderText(
        practice.shortDescription ||
        practice.description
    )}
                </p>

                <div class="practice-meta-compact">
                    <span class="meta-badge-small">
                        ⏱️ ${renderText(practice.duration)}
                    </span>

                    <span class="meta-badge-small">
                        📊 ${renderText(practice.difficulty)}
                    </span>
                </div>
            </div>

            <button
                type="button"
                class="practice-button-compact"
                onclick="navigateToPractice(
                    '${moduleId}',
                    '${practiceId}'
                )"
            >
                Iniciar →
            </button>

        </div>
    `;
}

// ==========================================================
// 17. PÁGINA DA PRÁTICA
// ==========================================================

async function renderPractice(
    moduleId,
    practiceId,
    navigationVersion = AppState.navigationVersion
) {
    const app = document.getElementById('app');
    const data = AppState.modules?.pt;

    const module = data?.modules.find(
        item => item.id === moduleId
    );

    const practiceInfo = module?.practices.find(
        item => item.id === practiceId
    );

    if (!module || !practiceInfo) {
        renderHome();
        return;
    }

    app.innerHTML = `
        <div class="loading" role="status">
            <div class="spinner"></div>
            <p>Carregando prática...</p>
        </div>
    `;

    const practice = await loadPracticeData(
        moduleId,
        practiceId
    );

    // Impede resposta antiga de sobrescrever a tela.
    if (
        navigationVersion !==
        AppState.navigationVersion
    ) {
        return;
    }

    if (!practice) {
        showError(
            'Prática não encontrada ou indisponível.'
        );
        return;
    }

    AppState.currentView = 'practice';
    AppState.currentModule = moduleId;
    AppState.currentPractice = practiceId;

    updateBreadcrumb([
        { text: data.home, link: '/' },
        {
            text: module.title,
            link: `/module/${moduleId}`
        },
        {
            text: practice.title || practiceInfo.title,
            link: null
        }
    ]);

    app.innerHTML = `
        <div class="container practice-container">

            <div class="practice-header-full">
                <span class="practice-icon-huge">
                    ${renderText(practiceInfo.icon)}
                </span>

                <div>
                    <h1 class="practice-title-full">
                        ${renderText(
        practice.title ||
        practiceInfo.title
    )}
                    </h1>

                    <p class="practice-description-full">
                        ${renderText(practice.description)}
                    </p>
                </div>
            </div>

            <div class="practice-meta-full">
                <span class="meta-badge">
                    ⏱️ ${renderText(practice.duration)}
                </span>

                <span class="meta-badge">
                    📊 ${renderText(practice.difficulty)}
                </span>
            </div>

            ${createPracticeSections(practice)}

            ${createNavigationButtons(
        practiceId,
        module
    )}

        </div>
    `;
}

// ==========================================================
// 18. CONTEÚDO DA PRÁTICA
// ==========================================================

function createPracticeSections(practice) {
    const blocks = [];

    blocks.push(renderPdfSection(practice));

    blocks.push(renderMarkdownSection(practice));

    blocks.push(section(
        '📌 Objetivos de Aprendizagem',
        renderList(practice.objectives, 'objectives-list')
    ));

    blocks.push(section(
        '🔑 Pré-requisitos',
        renderList(practice.prerequisites, 'objectives-list')
    ));

    blocks.push(renderMaterialsSection(practice));

    blocks.push(renderWiringSection(practice));

    if (practice.theory) {
        blocks.push(section(
            '📚 Fundamentos Teóricos',
            renderStructuredValue(practice.theory)
        ));
    }

    blocks.push(renderStepsSection(practice));

    blocks.push(renderCodeSection(practice));

    blocks.push(renderRosCommandsSection(practice));

    blocks.push(renderBipesSection(practice));

    blocks.push(renderChallengesSection(practice));

    blocks.push(renderTroubleshootingSection(practice));

    blocks.push(renderResourcesSection(practice));

    blocks.push(renderNextStepsSection(practice));

    return blocks.filter(Boolean).join('\n');
}

// ==========================================================
// 19. PDF
// ==========================================================

function renderPdfSection(practice) {
    if (!practice.pdfUrl) {
        return '';
    }

    const url = safeUrl(practice.pdfUrl);

    if (!url) {
        return '';
    }

    return `
        <section class="practice-section pdf-section">
            <div class="pdf-header">
                <span class="pdf-title-label">
                    📄 Guia Prático Passo a Passo
                </span>

                <a
                    href="${escapeHtml(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-primary"
                >
                    📥 Abrir / Baixar PDF
                </a>
            </div>

            <div class="pdf-container">
                <iframe
                    src="${escapeHtml(url)}"
                    class="pdf-viewer"
                    title="Guia prático em PDF"
                    loading="lazy"
                ></iframe>
            </div>
        </section>
    `;
}

// ==========================================================
// 20. MARKDOWN
// ==========================================================

function renderMarkdownSection(practice) {
    if (!practice.content) {
        return '';
    }

    const title = practice.type === 'theory'
        ? 'Conteúdo da Aula'
        : 'Conteúdo da Prática';

    if (
        typeof marked === 'undefined' ||
        typeof DOMPurify === 'undefined'
    ) {
        return section(
            title,
            renderCode(practice.content, 'text')
        );
    }

    try {
        const html = marked.parse(practice.content);

        return `
            <section class="practice-section markdown-content">
                ${DOMPurify.sanitize(html)}
            </section>
        `;

    } catch (error) {
        console.error('Erro ao renderizar Markdown:', error);

        return section(
            title,
            renderCode(practice.content, 'text')
        );
    }
}

// ==========================================================
// 21. MATERIAIS
// ==========================================================

function renderMaterialsSection(practice) {
    if (!Array.isArray(practice.materials)) {
        return '';
    }

    const cards = practice.materials.map(material => {
        if (typeof material === 'string') {
            return `
                <div class="material-item">
                    <span class="material-name">
                        ${renderText(material)}
                    </span>
                </div>
            `;
        }

        return `
            <div class="material-item">
                <span class="material-qty">
                    ${renderText(material.quantity ?? '')}
                    ${material.quantity != null ? 'x' : ''}
                </span>

                <span class="material-name">
                    ${renderText(material.name)}
                </span>

                ${material.notes ? `
                    <span class="material-notes">
                        ${renderText(material.notes)}
                    </span>
                ` : ''}
            </div>
        `;
    }).join('');

    return section(
        '🔧 Materiais Necessários',
        `<div class="materials-grid">${cards}</div>`
    );
}

// ==========================================================
// 22. CONEXÕES ELÉTRICAS
// ==========================================================

function renderWiringSection(practice) {
    const wiring = practice.wiring;

    if (!wiring || typeof wiring !== 'object') {
        return '';
    }

    let html = '';

    if (wiring.description) {
        html += `<p>${renderText(wiring.description)}</p>`;
    }

    if (wiring.diagram) {
        const imageUrl = safeUrl(wiring.diagram);

        if (imageUrl) {
            html += `
                <div class="step-image-container">
                    <img
                        src="${escapeHtml(imageUrl)}"
                        alt="Diagrama de conexões elétricas"
                        class="step-image"
                        loading="lazy"
                    >
                </div>
            `;
        }
    }

    if (Array.isArray(wiring.connections)) {
        html += '<h3>Relação de conexões</h3>';

        wiring.connections.forEach(group => {
            if (typeof group === 'string') {
                html += `
                    <div
                        class="material-item"
                        style="margin-bottom:8px"
                    >
                        ${renderText(group)}
                    </div>
                `;

                return;
            }

            if (!group || typeof group !== 'object') {
                return;
            }

            if (Array.isArray(group.connections)) {
                html += `
                    <h4 style="margin:16px 0 8px">
                        ${renderText(group.component)}
                    </h4>
                `;

                html += renderWiringTable(
                    group.connections
                );

            } else if (group.from || group.to) {
                html += renderWiringTable([group]);
            }
        });
    }

    if (
        Array.isArray(wiring.warnings) &&
        wiring.warnings.length
    ) {
        html += `
            <div
                class="troubleshooting-item"
                style="
                    margin-top:20px;
                    background:#fff3cd;
                    border-color:#fbbc05;
                "
            >
                <h3
                    style="
                        margin-bottom:10px;
                        color:#856404;
                    "
                >
                    ⚠️ Avisos importantes
                </h3>

                <ul class="step-details">
                    ${wiring.warnings.map(warning => `
                        <li style="color:#856404">
                            ${renderText(warning)}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    return section('🔌 Conexões e Diagrama', html);
}

function renderWiringTable(connections) {
    if (!Array.isArray(connections) || !connections.length) {
        return '';
    }

    const rows = connections.map(connection => {
        if (typeof connection === 'string') {
            return `
                <tr>
                    <td colspan="3">
                        ${renderText(connection)}
                    </td>
                </tr>
            `;
        }

        return `
            <tr>
                <td>${renderText(connection.from)}</td>
                <td>${renderText(connection.to)}</td>
                <td>${renderText(
            connection.function ||
            connection.color ||
            ''
        )}</td>
            </tr>
        `;
    }).join('');

    return `
        <div style="overflow-x:auto;margin-bottom:12px">
            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                    text-align:left;
                "
            >
                <thead>
                    <tr>
                        <th
                            style="
                                padding:10px;
                                border:1px solid #ddd;
                            "
                        >
                            Origem
                        </th>

                        <th
                            style="
                                padding:10px;
                                border:1px solid #ddd;
                            "
                        >
                            Destino
                        </th>

                        <th
                            style="
                                padding:10px;
                                border:1px solid #ddd;
                            "
                        >
                            Função / Identificação
                        </th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// ==========================================================
// 23. PASSO A PASSO
// ==========================================================

function renderStepsSection(practice) {
    if (!Array.isArray(practice.steps)) {
        return '';
    }

    const stepsHtml = practice.steps.map((step, index) => {
        let html = `
            <div class="step-item">

                <div class="step-number">
                    ${renderText(step.number ?? index + 1)}
                </div>

                <div class="step-content">

                    <h3 class="step-title">
                        ${renderText(step.title)}
                    </h3>

                    <p class="step-description">
                        ${renderText(step.description)}
                    </p>
        `;

        if (step.image) {
            const image = safeUrl(step.image);

            if (image) {
                html += `
                    <div class="step-image-container">
                        <img
                            src="${escapeHtml(image)}"
                            alt="${renderText(step.title)}"
                            class="step-image"
                            loading="lazy"
                        >
                    </div>
                `;
            }
        }

        html += renderList(step.details);

        if (
            Array.isArray(step.commands) &&
            step.commands.length
        ) {
            html += `
                <h4 style="margin:16px 0 8px">
                    Comandos desta etapa
                </h4>

                ${step.commands.map(renderCommand).join('')}
            `;
        }

        if (step.time) {
            html += `
                <span class="step-time">
                    ⏱️ ${renderText(step.time)}
                </span>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }).join('');

    return section(
        '📝 Passo a Passo',
        `<div class="steps-list">${stepsHtml}</div>`
    );
}

// ==========================================================
// 24. CÓDIGO E PSEUDOCÓDIGO
// ==========================================================

function renderCodeSection(practice) {
    const code = practice.code;

    if (!code) {
        return '';
    }

    let html = '';

    if (typeof code === 'string') {
        html = renderCode(code);

    } else {
        if (code.description) {
            html += `<p>${renderText(code.description)}</p>`;
        }

        if (code.pseudocode) {
            html += renderCode(
                code.pseudocode,
                'text'
            );
        }

        if (code.source) {
            html += renderCode(
                code.source,
                code.language || 'text'
            );
        }

        if (code.notes) {
            html += `
                <p style="margin-top:12px">
                    <small>
                        ${renderText(code.notes)}
                    </small>
                </p>
            `;
        }
    }

    return section('💻 Lógica do Código', html);
}

// ==========================================================
// 25. COMANDOS ROS 2
// ==========================================================

function renderRosCommandsSection(practice) {
    const rosCommands = practice.rosCommands;

    if (!rosCommands) {
        return '';
    }

    let html = '';

    if (rosCommands.title) {
        html += `
            <p>
                <strong>
                    ${renderText(rosCommands.title)}
                </strong>
            </p>
        `;
    }

    if (Array.isArray(rosCommands)) {
        html += rosCommands
            .map(renderCommand)
            .join('');

    } else if (Array.isArray(rosCommands.commands)) {
        html += rosCommands.commands
            .map(renderCommand)
            .join('');
    }

    return section('💻 Comandos ROS 2', html);
}

// ==========================================================
// 26. PROJETO BIPES
// ==========================================================

function renderBipesSection(practice) {
    const project = practice.bipesProject;

    if (!project) {
        return '';
    }

    let html = '';

    if (project.description) {
        html += `<p>${renderText(project.description)}</p>`;
    }

    const mainUrl = safeUrl(project.url);
    const alternativeUrl = safeUrl(project.alternativeUrl);

    html += '<div class="bipes-buttons">';

    if (mainUrl) {
        html += `
            <a
                href="${escapeHtml(mainUrl)}"
                class="btn btn-primary btn-large"
                target="_blank"
                rel="noopener noreferrer"
            >
                🔗 Abrir no BIPES
            </a>
        `;
    }

    if (alternativeUrl) {
        html += `
            <a
                href="${escapeHtml(alternativeUrl)}"
                class="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
            >
                Abrir ambiente alternativo
            </a>
        `;
    }

    html += '</div>';

    if (project.instructions) {
        html += `
            <p style="margin-top:12px">
                ${renderText(project.instructions)}
            </p>
        `;
    }

    if (Array.isArray(project.requiredBlocks)) {
        html += `
            <h3 style="margin-top:16px">
                Blocos necessários
            </h3>

            ${renderList(project.requiredBlocks)}
        `;
    }

    return section(
        '🚀 Projeto no BIPES',
        html,
        'bipes-section'
    );
}

// ==========================================================
// 27. DESAFIOS
// ==========================================================

function renderChallengesSection(practice) {
    if (!Array.isArray(practice.challenges)) {
        return '';
    }

    const html = practice.challenges.map(challenge => {
        const difficulty =
            challenge.difficulty ||
            challenge.level ||
            '';

        return `
            <div class="material-item">

                <strong>
                    ${renderText(challenge.title)}

                    ${difficulty ? `
                        (${renderText(difficulty)})
                    ` : ''}
                </strong>

                <p>
                    ${renderText(challenge.description)}
                </p>

                ${Array.isArray(challenge.objectives) ? `
                    <div style="margin-top:12px">
                        <strong>
                            Objetivos do desafio
                        </strong>

                        ${renderList(challenge.objectives)}
                    </div>
                ` : ''}

            </div>
        `;
    }).join('');

    return section(
        '🎯 Desafios Práticos',
        `<div class="materials-grid">${html}</div>`
    );
}

// ==========================================================
// 28. SOLUÇÃO DE PROBLEMAS
// ==========================================================

function renderTroubleshootingSection(practice) {
    if (!Array.isArray(practice.troubleshooting)) {
        return '';
    }

    const html = practice.troubleshooting.map(item => `
        <div class="troubleshooting-item">

            <h4 class="problem-title">
                ❌ ${renderText(item.problem)}
            </h4>

            <ul class="solutions-list">
                ${(item.solutions || []).map(solution => `
                    <li>
                        ✓ ${renderText(solution)}
                    </li>
                `).join('')}
            </ul>

        </div>
    `).join('');

    return section(
        '🆘 Solução de Problemas',
        `<div class="troubleshooting-list">${html}</div>`
    );
}

// ==========================================================
// 29. RECURSOS E DOWNLOADS
// ==========================================================

function renderResourcesSection(practice) {
    if (!Array.isArray(practice.resources)) {
        return '';
    }

    const html = practice.resources.map(resource => {
        const url = safeUrl(resource.url);

        if (!url) {
            return '';
        }

        return `
            <div class="resource-card">

                <div class="resource-info">
                    <span class="resource-icon">
                        ${renderText(resource.icon || '📁')}
                    </span>

                    <div class="resource-text">
                        <h4 class="resource-title">
                            ${renderText(resource.title)}
                        </h4>

                        ${resource.description ? `
                            <p class="resource-desc">
                                ${renderText(resource.description)}
                            </p>
                        ` : ''}
                    </div>
                </div>

                <a
                    href="${escapeHtml(url)}"
                    class="btn btn-secondary"
                    download
                >
                    📥 Baixar
                </a>

            </div>
        `;
    }).join('');

    return section(
        '⚙️ Arquivos de Configuração / Recursos',
        `<div class="resources-grid">${html}</div>`
    );
}

// ==========================================================
// 30. PRÓXIMOS PASSOS
// ==========================================================

function renderNextStepsSection(practice) {
    const nextSteps = practice.nextSteps;

    if (!nextSteps) {
        return '';
    }

    let html = '';

    if (Array.isArray(nextSteps)) {
        html = renderList(nextSteps);

    } else if (typeof nextSteps === 'object') {
        if (nextSteps.nextPractice) {
            const next = nextSteps.nextPractice;

            html += `
                <h3>
                    Próxima prática recomendada
                </h3>

                <p>
                    <strong>
                        ${renderText(next.title)}
                    </strong>
                </p>
            `;

            if (
                safeId(next.moduleId) &&
                safeId(next.practiceId)
            ) {
                html += `
                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="navigateToPractice(
                            '${safeId(next.moduleId)}',
                            '${safeId(next.practiceId)}'
                        )"
                    >
                        Acessar próxima prática →
                    </button>
                `;
            }
        }

        if (Array.isArray(nextSteps.relatedTopics)) {
            html += `
                <h3 style="margin-top:16px">
                    Assuntos relacionados
                </h3>

                ${renderList(nextSteps.relatedTopics)}
            `;
        }
    }

    return section('➡️ Próximos Passos', html);
}

// ==========================================================
// 31. NAVEGAÇÃO ANTERIOR / PRÓXIMA — PRÁTICAS
// ==========================================================

function createNavigationButtons(practiceId, module) {
    const practices = module.practices || [];

    const index = practices.findIndex(
        practice => practice.id === practiceId
    );

    if (index === -1) {
        return '';
    }

    const previous = practices[index - 1];
    const next = practices[index + 1];

    const moduleId = safeId(module.id);

    let html = '<div class="practice-navigation">';

    if (previous) {
        html += `
            <button
                type="button"
                class="nav-btn nav-btn-prev"
                onclick="navigateToPractice(
                    '${moduleId}',
                    '${safeId(previous.id)}'
                )"
            >
                ← Anterior:
                ${renderText(previous.title)}
            </button>
        `;
    } else {
        html += '<div></div>';
    }

    if (next) {
        html += `
            <button
                type="button"
                class="nav-btn nav-btn-next"
                onclick="navigateToPractice(
                    '${moduleId}',
                    '${safeId(next.id)}'
                )"
            >
                Próxima:
                ${renderText(next.title)} →
            </button>
        `;
    }

    html += '</div>';

    return html;
}

// ==========================================================
// 32. ERROS
// ==========================================================

function showError(message) {
    const app = document.getElementById('app');

    if (!app) {
        console.error(message);
        return;
    }

    app.innerHTML = `
        <div class="container">
            <div class="error-box">

                <h2>⚠️ Erro</h2>

                <p>${renderText(message)}</p>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="navigateHome()"
                >
                    Voltar ao Início
                </button>

            </div>
        </div>
    `;
}

// ==========================================================
// FIM DO SCRIPT
// ==========================================================
