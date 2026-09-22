# 🤖 Plataforma Educacional de Robótica Sustentável

> Aprenda robótica do básico ao avançado com foco em sustentabilidade, utilizando Raspberry Pi Pico W, BIPES, micro-ROS e materiais recicláveis (sucata).

[![Status](https://shields.io)]()
[![Versão](https://shields.io)]()
[![Idiomas](https://img.shields.io/badge/idiomas-PT%20%7C%20EN-orange.svg)]()
[![Licença](https://img.shields.io/badge/licença-MIT-green.svg)]()

---

## ✨ Sobre o Projeto

Esta plataforma web interativa original possui **7 práticas completas** de robótica, organizadas em 3 módulos progressivos. Cada prática inclui objetivos, materiais, teoria, passo a passo detalhado, troubleshooting e desafios em múltiplos níveis.

### ♻️ Vertente de Robótica Sustentável (Projeto PAIP / Projeto de Pesquisa)
O projeto está sendo aperfeiçoado e expandido para integrar os conceitos de **robótica sustentável com o uso de sucata**. Essa iniciativa faz parte das atividades da bolsa de iniciação acadêmica **PAIP (Programa de Apoio e Incentivo a Permanência)** na **UFC Campus Quixadá** e serve como base para o desenvolvimento de um **Trabalho de Conclusão de Curso (TCC)**. O objetivo é demonstrar como o lixo eletrônico e materiais recicláveis do dia a dia podem ser reutilizados na construção de estruturas robóticas de baixo custo e alto impacto pedagógico.

**🎯 Público-alvo:** Estudantes do curso de Engenharia de Computação da UFC de Quixadá-CE, interessados em robótica
**⏱️ Duração total:** 17-24 horas de aprendizado prático  

---

## 🚀 Início Rápido

### Testar Localmente

```bash
cd robotica-educacional
python3 -m http.server 8080
```

Abra http://localhost:8080 no navegador.

### Deploy no GitHub Pages

1. Commit para seu repositório
2. Settings → Pages → Source: main branch / root
3. Acesse em: `https://[usuario].github.io/[repo]/robotica-educacional/`

---

## 📚 Módulos e Práticas

### 🟢 Módulo Inicial (6-8h)
1. **Controle de Robô com Joystick** - PWM, ADC, motores DC e chassi de sucata estrutural
2. **Servidor Web no Pico W** - HTTP, REST API, controle remoto
3. **Sensor Ultrassônico HC-SR04** - Medição de distância, anti-colisão

### 🟡 Módulo Intermediário (7-9h)
4. **Teleopração com micro-ROS** - ROS2, XRCE-DDS, Twist messages
5. **Comunicação MQTT IoT** - Publish-subscribe, sensores distribuídos

### 🔴 Módulo Avançado (9-11h)
6. **Encoders Rotativos e Odometria** - Quadrature, IRQ, controle em malha fechada
7. **Controle PID para Robótica** - Sintonia de ganhos, anti-windup

---

## 🎨 Recursos

- ✅ **Interface Responsiva** - Mobile, tablet e desktop
- ✅ **Navegação Intuitiva** - Breadcrumbs e botões anterior/próxima
- ✅ **Bilíngue** - Alternância PT/EN sem recarregar página
- ✅ **Conteúdo Rico** - Teoria + prática + troubleshooting + desafios
- ✅ **Zero Dependências** - Vanilla JavaScript, funciona offline após carregar
- ✅ **Integração BIPES** - Links diretos para projetos pré-configurados
- ✅ **Foco em Sustentabilidade** - Abordagem voltada para o uso de materiais recicláveis e hardware acessível

---

## 📂 Estrutura

```
robotica-educacional/
├── index.html              # SPA principal
├── style.css               # Design responsivo
├── script.js               # Lógica da aplicação
├── data/
│   ├── modules.json        # Estrutura dos módulos
│   └── practices/
│       ├── pt/             # 7 práticas em português
│       └── en/             # 7 práticas em inglês
└── assets/
    ├── images/
    └── diagrams/
```

---

## 🛠️ Tecnologias e Materiais

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Hardware:** Raspberry Pi Pico W
- **Software:** MicroPython, BIPES
- **Integração:** micro-ROS, ROS2 Humble, MQTT
- **Sustentabilidade:** Sucata estrutural, papelão, garrafas PET, componentes eletrônicos reaproveitados

---

## 📖 Documentação

- [VERSAO_FINAL.md](VERSAO_FINAL.md) - Visão geral completa
- [PROTOTYPE_README.md](PROTOTYPE_README.md) - Documentação técnica
- [DEPLOY.md](DEPLOY.md) - Guia de deployment

---

## 🎓 Como Usar

1. **Escolha um módulo** na página inicial
2. **Selecione uma prática** que interesse você
3. **Siga o passo a passo** com duração estimada
4. **Prepare os materiais recicláveis (sucatas)** indicados para a estrutura do experimento
5. **Abra o projeto BIPES** pré-configurado
6. **Complete os desafios** em 3 níveis de dificuldade

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Áreas para contribuir:

- 📸 Adicionar diagramas Fritzing e esquemas de montagem com sucata
- 🎥 Criar vídeos tutoriais de montagem física dos robôs
- 🧪 Desenvolver novos projetos BIPES reais
- 🌐 Traduzir para outros idiomas
- 🐛 Reportar bugs ou sugerir melhorias

---

## 📊 Status do Projeto

**Versão Atual:** 1.1.0 (Em aperfeiçoamento para TCC e PAIP)  
**Última Atualização:** Setembro de 2026

| Componente | Status |
|------------|--------|
| Interface Web | ✅ Completo |
| Práticas PT | 🔄 Em atualização (Adaptação para Robbótica Sustentável) |
| Práticas EN | ✅ 7/7 |
| Responsividade | ✅ Completo |
| Testes e Validação | 🔄 Em andamento |

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 👨‍💻 Autores e Créditos

* **Desenvolvedor Original:** [Guilherme Floriano](https://github.com/guiaf04) - Idealizador e desenvolvedor da arquitetura base da Plataforma Educacional de Robótica.
* **Pesquisa, Adaptação e Extensão (PAIP / TCC):** [Davi / DAVIMEDX](https://github.com/DAVIMEDX) - Adaptação metodológica para a robótica sustentável com sucata no contexto da Universidade Federal do Ceará (UFC) - Campus Quixadá.
