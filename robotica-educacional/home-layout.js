
/* ==========================================================
   ROBÓTICA EDUCACIONAL — HOME-LAYOUT.JS

   Página institucional do projeto Loki 200 mm.

   OBJETIVOS:
   - Separar a página inicial do catálogo.
   - Preservar o script.js existente.
   - Preservar todas as rotas atuais.
   - Utilizar as fotografias reais do carrinho.
   - Manter as aulas teóricas e práticas existentes.

   ROTAS:
   #/          Página inicial institucional
   #/aprender  Catálogo original da plataforma

   Carregar este arquivo DEPOIS de script.js.
========================================================== */

'use strict';

(function initializeLokiHomeLayout() {

    // ------------------------------------------------------
    // 1. CONFERIR A PRESENÇA DO SCRIPT ORIGINAL
    // ------------------------------------------------------

    if (typeof window.renderHome !== 'function') {
        console.error(
            '[Loki Layout] A função renderHome não foi encontrada. ' +
            'Confira se home-layout.js foi carregado após script.js.'
        );
        return;
    }

    // Preserva a função original responsável pelo catálogo.
    const renderOriginalCatalog = window.renderHome;

    // ------------------------------------------------------
    // 2. ESTILOS EXCLUSIVOS DA PÁGINA INSTITUCIONAL
    // ------------------------------------------------------

    const layoutStyles = `
        .loki-landing {
            width: 100%;
        }

        .loki-landing .loki-intro {
            position: relative;
            overflow: hidden;
            display: grid;
            grid-template-columns:
                minmax(0, 1.08fr)
                minmax(0, 0.92fr);
            align-items: center;
            gap: 28px;

            min-height: 440px;
            padding: 44px;
            margin-bottom: 28px;

            border-radius: 24px;
            background:
                radial-gradient(
                    circle at 80% 55%,
                    rgba(45, 117, 187, 0.28),
                    transparent 48%
                ),
                linear-gradient(
                    125deg,
                    #10243a,
                    #143b5a
                );

            box-shadow:
                0 20px 48px rgba(16, 36, 58, 0.17);
        }

        .loki-intro-copy {
            position: relative;
            z-index: 1;
            min-width: 0;
        }

        .loki-intro-eyebrow {
            display: inline-flex;
            padding: 8px 12px;
            margin-bottom: 20px;
            border: 1px solid rgba(147, 197, 253, 0.32);
            border-radius: 100px;
            background: rgba(59, 130, 246, 0.12);
            color: #bfdbfe;
            font-size: 0.76rem;
            font-weight: 700;
            letter-spacing: 0.09em;
            text-transform: uppercase;
        }

        .loki-intro-title {
            max-width: 650px;
            margin: 0 0 18px;
            color: #ffffff;
            font-size: clamp(2.1rem, 4vw, 3.8rem);
            font-weight: 800;
            line-height: 1.13;
            letter-spacing: -0.045em;
        }

        .loki-intro-description {
            max-width: 560px;
            margin-bottom: 27px;
            color: #d5e4f3;
            font-size: 1.05rem;
            line-height: 1.8;
        }

        .loki-intro-actions,
        .loki-project-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }

        .loki-action {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            gap: 8px;

            min-height: 46px;
            padding: 12px 20px;

            border: 1px solid transparent;
            border-radius: 11px;

            background: #2563eb;
            color: #ffffff;

            font-weight: 700;
            text-align: center;
            text-decoration: none;

            transition:
                transform 0.2s ease,
                background 0.2s ease;
        }

        .loki-action:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
        }

        .loki-action-outline {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.45);
        }

        .loki-action-outline:hover {
            background: rgba(255, 255, 255, 0.18);
        }

        .loki-action-light {
            background: #eaf2ff;
            color: #183b63;
        }

        .loki-action-light:hover {
            background: #dbeafe;
        }

        .loki-intro-photo {
            width: 100%;
            min-width: 0;
            height: 400px;
            overflow: hidden;
            border-radius: 18px;
        }

        .loki-intro-photo img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
            border-radius: inherit;
        }

        .loki-photo-caption {
            margin-top: 9px;
            color: #c9d9e9;
            font-size: 0.78rem;
            text-align: center;
        }

        .loki-landing-stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 15px;
            margin-bottom: 38px;
        }

        .loki-landing-stat {
            padding: 23px 20px;
            border: 1px solid #e4ebf3;
            border-radius: 16px;
            background: #ffffff;
            text-align: center;
            box-shadow: 0 5px 20px rgba(16, 36, 58, 0.04);
        }

        .loki-landing-stat strong {
            display: block;
            color: #183b63;
            font-size: 2.15rem;
            line-height: 1.2;
        }

        .loki-landing-stat span {
            display: block;
            margin-top: 7px;
            color: #64748b;
            font-size: 0.85rem;
        }

        .loki-project-panel {
            display: grid;
            grid-template-columns:
                minmax(0, 0.85fr)
                minmax(0, 1.15fr);
            overflow: hidden;
            margin-bottom: 38px;
            border: 1px solid #e4ebf3;
            border-radius: 22px;
            background: #ffffff;
            box-shadow: 0 10px 30px rgba(16, 36, 58, 0.06);
        }

        .loki-project-photo {
            min-height: 380px;
            background: #eef3f9;
        }

        .loki-project-photo img {
            display: block;
            width: 100%;
            height: 100%;
            max-height: 490px;
            object-fit: contain;
        }

        .loki-project-copy {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            gap: 16px;
            padding: 42px;
        }

        .loki-project-eyebrow {
            color: #2563eb;
            font-size: 0.76rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        .loki-project-copy h2 {
            color: #10243a;
            font-size: clamp(1.75rem, 3vw, 2.6rem);
            line-height: 1.17;
            letter-spacing: -0.035em;
        }

        .loki-project-copy p {
            color: #526176;
            line-height: 1.8;
        }

        .loki-tech-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .loki-tech-tags span {
            padding: 7px 11px;
            border-radius: 100px;
            background: #edf4fc;
            color: #1d4e82;
            font-size: 0.81rem;
            font-weight: 600;
        }

        .loki-learning-entry {
            padding: 35px 28px;
            margin-bottom: 10px;
            border: 1px solid #dbe7f5;
            border-radius: 20px;
            background:
                linear-gradient(135deg, #eef5ff, #ffffff);
            text-align: center;
        }

        .loki-learning-entry h2 {
            margin-bottom: 10px;
            color: #10243a;
            font-size: clamp(1.5rem, 3vw, 2.15rem);
        }

        .loki-learning-entry p {
            max-width: 680px;
            margin: 0 auto 20px;
            color: #526176;
            line-height: 1.75;
        }

        /*
         O index.html anterior possui uma seção
         estática de Projeto Integrador.

         Ela é ocultada aqui porque a nova
         página institucional já inclui a seção.
         Isso evita imagens e textos duplicados.
        */

        .loki-showcase {
            display: none !important;
        }

        /* Responsividade */

        @media (max-width: 850px) {
            .loki-landing .loki-intro {
                grid-template-columns: 1fr;
                padding: 32px;
            }

            .loki-intro-photo {
                height: 320px;
            }

            .loki-project-panel {
                grid-template-columns: 1fr;
            }

            .loki-project-photo {
                min-height: 310px;
            }

            .loki-project-copy {
                padding: 30px;
            }
        }

        @media (max-width: 520px) {
            .loki-landing .loki-intro {
                padding: 25px 20px;
                gap: 22px;
                border-radius: 18px;
            }

            .loki-intro-title {
                font-size: 2rem;
            }

            .loki-intro-description {
                font-size: 0.96rem;
            }

            .loki-intro-photo {
                height: 250px;
            }

            .loki-landing-stats {
                gap: 8px;
            }

            .loki-landing-stat {
                padding: 15px 7px;
            }

            .loki-landing-stat strong {
                font-size: 1.55rem;
            }

            .loki-landing-stat span {
                font-size: 0.7rem;
            }

            .loki-project-photo {
                min-height: 255px;
            }

            .loki-project-copy {
                padding: 26px 20px;
            }

            .loki-action {
                width: 100%;
            }

            .loki-learning-entry {
                padding: 27px 20px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .loki-action {
                transition: none;
            }
        }

        @media print {
            .loki-intro,
            .loki-project-panel {
                box-shadow: none;
            }

            .loki-intro {
                background: #ffffff !important;
            }

            .loki-intro-title,
            .loki-intro-description {
                color: #000000 !important;
            }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'loki-home-layout-styles';
    styleElement.textContent = layoutStyles;
    document.head.appendChild(styleElement);

    // ------------------------------------------------------
    // 3. PÁGINA INICIAL INSTITUCIONAL
    // ------------------------------------------------------

    function renderLokiLanding() {
        const app = document.getElementById('app');

        if (!app) {
            return;
        }

        if (typeof AppState !== 'undefined') {
            AppState.currentView = 'home';
            AppState.currentModule = null;
            AppState.currentPractice = null;
        }

        if (typeof updateBreadcrumb === 'function') {
            updateBreadcrumb([]);
        }

        const modules =
            AppState.modules &&
            AppState.modules.pt &&
            Array.isArray(AppState.modules.pt.modules)
                ? AppState.modules.pt.modules
                : [];

        const theoryModules =
            AppState.modules &&
            AppState.modules.pt &&
            Array.isArray(AppState.modules.pt.theoryModules)
                ? AppState.modules.pt.theoryModules
                : [];

        const totalPractices = modules.reduce(
            (total, module) =>
                total + (
                    Array.isArray(module.practices)
                        ? module.practices.length
                        : 0
                ),
            0
        );

        const totalLessons = theoryModules.reduce(
            (total, module) =>
                total + (
                    Array.isArray(module.lessons)
                        ? module.lessons.length
                        : 0
                ),
            0
        );

        app.innerHTML = `
            <div class="container loki-landing">

                <!-- APRESENTAÇÃO PRINCIPAL -->

                <section
                    class="loki-intro"
                    aria-labelledby="lokiHomeTitle"
                >

                    <div class="loki-intro-copy">

                        <span class="loki-intro-eyebrow">
                            Robótica Educacional · Loki 200 mm
                        </span>

                        <h1
                            class="loki-intro-title"
                            id="lokiHomeTitle"
                        >
                            Do conceito
                            à autonomia.
                        </h1>

                        <p class="loki-intro-description">
                            Construa, programe e desenvolva
                            um carrinho robótico real.

                            Aprenda com impressão 3D,
                            sistemas embarcados,
                            ROS 2 Foxy, micro-ROS,
                            sensoriamento e navegação.
                        </p>

                        <div class="loki-intro-actions">

                            <a
                                class="loki-action"
                                href="#/aprender"
                            >
                                Explorar a plataforma
                            </a>

                            <a
                                class="loki-action loki-action-outline"
                                href="#/theory/fundamentos_robotica"
                            >
                                Começar pelos fundamentos
                            </a>

                        </div>

                    </div>

                    <div>
                        <div class="loki-intro-photo">

                            <img
                                src="data/images/loki-principal.jpeg"
                                alt="Carrinho robótico Loki 200 mm produzido no projeto, com estrutura impressa em 3D e roda azul"
                                loading="eager"
                                decoding="async"
                            >

                        </div>

                        <p class="loki-photo-caption">
                            Projeto Loki 200 mm · Fotografia real
                        </p>
                    </div>

                </section>

                <!-- INDICADORES DA PLATAFORMA -->

                <section
                    class="loki-landing-stats"
                    aria-label="Conteúdos da plataforma"
                >

                    <div class="loki-landing-stat">
                        <strong>${totalLessons}</strong>
                        <span>Aulas teóricas</span>
                    </div>

                    <div class="loki-landing-stat">
                        <strong>${totalPractices}</strong>
                        <span>Práticas disponíveis</span>
                    </div>

                    <div class="loki-landing-stat">
                        <strong>1</strong>
                        <span>Projeto integrador</span>
                    </div>

                </section>

                <!-- PROJETO INTEGRADOR -->

                <section
                    class="loki-project-panel"
                    aria-labelledby="lokiProjectTitle"
                >

                    <div class="loki-project-photo">

                        <img
                            src="data/images/loki-frontal.jpeg"
                            alt="Vista frontal do carrinho Loki montado, mostrando a estrutura e o sensor superior"
                            loading="lazy"
                            decoding="async"
                        >

                    </div>

                    <div class="loki-project-copy">

                        <span class="loki-project-eyebrow">
                            Projeto integrador
                        </span>

                        <h2 id="lokiProjectTitle">
                            Um robô real.
                            Uma jornada completa.
                        </h2>

                        <p>
                            A formação acompanha a evolução
                            do Loki 200 mm: fabricação das
                            peças, montagem, preparação do
                            ambiente, programação,
                            controle de movimento,
                            percepção e mapeamento.
                        </p>

                        <div class="loki-tech-tags">
                            <span>Impressão 3D</span>
                            <span>ESP32</span>
                            <span>ROS 2 Foxy</span>
                            <span>micro-ROS</span>
                            <span>LiDAR</span>
                            <span>SLAM</span>
                        </div>

                        <div class="loki-project-actions">

                            <a
                                class="loki-action"
                                href="#/module/impressao_3d"
                            >
                                Fabricação do Loki
                            </a>

                            <a
                                class="loki-action loki-action-light"
                                href="#/module/carrinho_esp32_ros2"
                            >
                                Desenvolvimento
                            </a>

                        </div>

                    </div>

                </section>

                <!-- ACESSO AO CATÁLOGO -->

                <section
                    class="loki-learning-entry"
                    aria-labelledby="lokiLearningTitle"
                >

                    <h2 id="lokiLearningTitle">
                        Seu ambiente de aprendizagem
                    </h2>

                    <p>
                        Acesse os módulos teóricos e
                        as práticas organizadas em uma
                        sequência de aprendizagem,
                        dos fundamentos à autonomia.
                    </p>

                    <a
                        class="loki-action"
                        href="#/aprender"
                    >
                        Ver todas as aulas e práticas
                    </a>

                </section>

            </div>
        `;
    }

    // ------------------------------------------------------
    // 4. INTEGRAÇÃO COM O ROTEADOR EXISTENTE
    //
    // O router original chama renderHome:
    //
    // - na rota #/
    // - quando encontra uma rota desconhecida
    //
    // Por isso reaproveitamos essa chamada.
    // Para #/aprender, executamos o catálogo original.
    // Para #/, mostramos a nova página institucional.
    // ------------------------------------------------------

    window.renderHome = function renderHomeWithLokiLayout() {

        const hash = window.location.hash.slice(1) || '/';

        if (hash === '/aprender' || hash === '/aprender/') {
            renderOriginalCatalog();
            return;
        }

        renderLokiLanding();
    };

    // ------------------------------------------------------
    // 5. IDENTIFICAÇÃO PARA DEPURAÇÃO
    // ------------------------------------------------------

    console.info(
        '[Loki Layout] Página inicial e catálogo separados.'
    );

})();
