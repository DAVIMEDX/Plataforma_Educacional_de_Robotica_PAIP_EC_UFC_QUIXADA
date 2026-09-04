# 🚀 GUIA DE DEPLOY - GitHub Pages

## 📋 Pré-requisitos

- ✅ Protótipo testado e validado localmente
- ✅ Repositório no GitHub (guiaf04/microros-micropython)
- ✅ Permissões de administrador no repositório

---

## 🎯 OPÇÃO 1: Deploy Imediato (Protótipo Atual)

### Passo 1: Renomear Arquivos

```bash
cd /home/guilherme/microros-micropython/robotica-educacional

# Fazer backup dos arquivos antigos
mv index.html index-v1-backup.html
mv script.js script-v1-backup.js
mv style.css style-v1-backup.css

# Ativar novos arquivos
mv index-new.html index.html
mv script-new.js script.js
mv style-new.css style.css
```

### Passo 2: Commit e Push

```bash
cd /home/guilherme/microros-micropython

# Adicionar arquivos
git add robotica-educacional/

# Commit
git commit -m "feat: plataforma educacional interativa com BIPES e micro-ROS

- Implementa SPA com hash-based routing
- Sistema i18n bilíngue (PT/EN)
- Design responsivo mobile-first
- 3 módulos educacionais estruturados
- 2 práticas completas (Joystick e micro-ROS)
- Navegação intuitiva com breadcrumb
- Pronto para GitHub Pages"

# Push para GitHub
git push origin main
```

### Passo 3: Ativar GitHub Pages

1. Acesse: https://github.com/guiaf04/microros-micropython/settings/pages
2. Em **Source**, selecione:
   - Branch: `main`
   - Folder: `/ (root)`
3. Clique em **Save**
4. Aguarde alguns minutos (deploy automático)

### Passo 4: Verificar Deploy

URL final: **https://guiaf04.github.io/microros-micropython/robotica-educacional/**

Teste:
- [ ] Página carrega sem erros
- [ ] CSS e JS carregam corretamente
- [ ] Navegação funciona
- [ ] Troca de idioma funciona
- [ ] Práticas abrem corretamente

---

## 🎯 OPÇÃO 2: Deploy com Domínio Customizado (Opcional)

### Configurar Domínio

1. No seu provedor de DNS, adicione:
```
Type: CNAME
Name: robotica (ou outro subdomínio)
Value: guiaf04.github.io
```

2. No GitHub:
   - Settings → Pages → Custom domain
   - Digite: `robotica.seudominio.com`
   - Marque "Enforce HTTPS"

3. Aguarde propagação DNS (até 48h)

---

## 🎯 OPÇÃO 3: Deploy na Vercel (Alternativa)

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Deploy

```bash
cd /home/guilherme/microros-micropython/robotica-educacional

# Login (primeira vez)
vercel login

# Deploy
vercel --prod
```

### Configuração Vercel (vercel.json)

Criar arquivo `vercel.json`:
```json
{
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📊 ESTRUTURA DE ARQUIVOS PARA DEPLOY

```
robotica-educacional/
├── index.html              ← Renomeado de index-new.html
├── script.js               ← Renomeado de script-new.js
├── style.css               ← Renomeado de style-new.css
├── data/
│   ├── modules.json
│   └── practices/
│       ├── pt/
│       │   ├── inicial-joystick.json
│       │   └── intermediario-microros.json
│       └── en/
│           └── inicial-joystick.json
├── assets/
│   ├── images/
│   └── diagrams/
├── PROTOTYPE_README.md
├── ENTREGA_PROTOTIPO.md
├── RESUMO_EXECUTIVO.md
└── DEPLOY.md (este arquivo)
```

---

## ✅ CHECKLIST PÓS-DEPLOY

### Funcionalidades Básicas
- [ ] Página inicial carrega
- [ ] 3 cards de módulos aparecem
- [ ] Clicar em módulo abre lista de práticas
- [ ] Clicar em prática abre conteúdo completo
- [ ] Breadcrumb funciona
- [ ] Botões PT/EN trocam idioma

### Performance
- [ ] Carregamento < 3 segundos
- [ ] Sem erros no Console (F12)
- [ ] Sem 404 em Network tab
- [ ] CSS e JS carregam corretamente

### Responsividade
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### SEO e Meta Tags
- [ ] Título aparece correto na aba
- [ ] Ícone (🤖) aparece no navegador
- [ ] Meta description presente
- [ ] Open Graph tags (opcional)

---

## 🐛 TROUBLESHOOTING

### Problema: 404 ao carregar práticas

**Causa**: Arquivos JSON não encontrados

**Solução**:
```bash
# Verificar estrutura
ls -la data/practices/pt/
ls -la data/practices/en/

# Deve mostrar:
# inicial-joystick.json
# intermediario-microros.json
```

### Problema: CSS não carrega

**Causa**: Cache do navegador

**Solução**:
- Limpar cache: Ctrl + Shift + R
- Ou aguardar GitHub Pages atualizar (até 10min)

### Problema: Hash navigation não funciona

**Causa**: GitHub Pages não configurado corretamente

**Solução**:
- Certifique-se que branch está correto
- Use hash-based routing (já implementado)
- Não use browser history API

### Problema: Idioma não muda

**Causa**: localStorage bloqueado ou erro JS

**Solução**:
```javascript
// Abrir Console (F12) e executar:
localStorage.clear()
location.reload()
```

---

## 📈 MONITORAMENTO

### Google Analytics (Opcional)

Adicionar antes de `</head>` no `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Vercel Analytics

Se usar Vercel, analytics já está incluído automaticamente.

---

## 🔐 SEGURANÇA

### HTTPS

- ✅ GitHub Pages fornece HTTPS automático
- ✅ Vercel fornece HTTPS automático
- ⚠️ Certifique-se que "Enforce HTTPS" está marcado

### Headers de Segurança

GitHub Pages já inclui headers básicos. Para Vercel, adicionar em `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 📊 OTIMIZAÇÃO (Futuro)

### Minificação

Quando o projeto estiver completo, considere minificar:

```bash
# Instalar ferramentas
npm install -g terser clean-css-cli html-minifier

# Minificar
terser script.js -o script.min.js -c -m
cleancss style.css -o style.min.css
html-minifier index.html -o index.min.html --collapse-whitespace
```

### CDN para Assets

Hospedar imagens grandes em:
- GitHub Releases
- Imgur
- Cloudinary (grátis)

---

## 🎉 DEPLOY COMPLETO

Após seguir os passos:

1. ✅ URL pública funcionando
2. ✅ Acessível de qualquer lugar
3. ✅ HTTPS ativo
4. ✅ Performance adequada
5. ✅ Responsivo em todos os dispositivos

### Compartilhar

```
🚀 Plataforma Educacional BIPES + micro-ROS

🌐 Acesse: https://guiaf04.github.io/microros-micropython/robotica-educacional/

📚 Aprenda robótica do básico ao avançado
🎯 3 módulos progressivos
🔧 7 práticas hands-on
🌍 Disponível em PT e EN

#Robótica #Educação #BIPES #microROS #ROS2
```

---

## 📞 SUPORTE

### Logs GitHub Pages

Verificar status do deploy:
- https://github.com/guiaf04/microros-micropython/deployments

### Documentação Oficial

- GitHub Pages: https://docs.github.com/pages
- Vercel: https://vercel.com/docs

---

**Última atualização**: 21/10/2025  
**Versão**: 1.0.0
