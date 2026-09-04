# 🤖 Plataforma Educacional de Robótica

> Aprenda robótica do básico ao avançado com Raspberry Pi Pico W, BIPES e micro-ROS

[![Status](https://img.shields.io/badge/status-completo-success.svg)]()
[![Versão](https://img.shields.io/badge/versão-1.0.0-blue.svg)]()
[![Idiomas](https://img.shields.io/badge/idiomas-PT%20%7C%20EN-orange.svg)]()
[![Licença](https://img.shields.io/badge/licença-MIT-green.svg)]()

---

## ✨ Sobre o Projeto

Plataforma web interativa com **7 práticas completas** de robótica, organizadas em 3 módulos progressivos. Cada prática inclui objetivos, materiais, teoria, passo a passo detalhado, troubleshooting e desafios em múltiplos níveis.

**🎯 Público-alvo:** Estudantes e educadores interessados em robótica educacional  
**⏱️ Duração total:** 17-24 horas de aprendizado prático  
**🌍 Idiomas:** Português e Inglês (alternância em tempo real)

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
1. **Controle de Robô com Joystick** - PWM, ADC, motores DC
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

---

## �� Estrutura

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

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Hardware:** Raspberry Pi Pico W
- **Software:** MicroPython, BIPES
- **Integração:** micro-ROS, ROS2 Humble, MQTT

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
4. **Abra o projeto BIPES** pré-configurado
5. **Complete os desafios** em 3 níveis de dificuldade

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Áreas para contribuir:

- 📸 Adicionar diagramas Fritzing
- 🎥 Criar vídeos tutoriais
- 🧪 Desenvolver projetos BIPES reais
- 🌐 Traduzir para outros idiomas
- 🐛 Reportar bugs ou sugerir melhorias

---

## 📊 Status do Projeto

**Versão Atual:** 1.0.0 (Completa)  
**Última Atualização:** 21 de Outubro de 2025

| Componente | Status |
|------------|--------|
| Interface Web | ✅ Completo |
| Práticas PT | ✅ 7/7 |
| Práticas EN | ✅ 7/7 |
| Responsividade | ✅ Completo |
| Testes | ✅ Validado |

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido como projeto educacional de robótica integrando BIPES, micro-ROS e ROS2.

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
