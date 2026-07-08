<div align="center">

#  Vitis

**Sua Adega, Sua Escolha.**

Um aplicativo mobile web premium inspirado no Vivino para descoberta e compra de vinhos, construído com React 19, TanStack Start, Firebase e Tailwind CSS 4.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![TanStack](https://img.shields.io/badge/TanStack-Start%20%2B%20Router-FF4154?logo=react-query&logoColor=white)](https://tanstack.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)

</div>

---

##  Funcionalidades

###  Autenticação e Segurança
- **Login Multi-Provedor** — Entre com **Google**, **Apple**, **Facebook** ou **E-mail/Senha** via Firebase Auth
- **Modo Convidado** — Navegue pelo catálogo anonimamente; o login só é exigido ao adicionar itens ao carrinho ou realizar uma compra
- **Upgrade de Conta Anônima para Real** — Converta uma sessão de convidado em uma conta permanente sem perder dados
- **Regras de Segurança do Firestore** — Isolamento estrito por usuário para carrinho, adega, pedidos e dados de perfil

###  Carrinho de Compras e Checkout Seguro
- **Sincronização em Tempo Real** — Os itens do carrinho são persistidos no Firestore (por usuário) com fallback para `localStorage` em caso de falha de conexão
- **Pagamento via Pix** — Geração dinâmica de QR Code com timer regressivo de 10 minutos e chave "Copia e Cola" para clipboard
- **Pagamento via Cartão de Crédito** — Formulário premium com detecção automática de bandeira (Visa, Mastercard, Amex), máscara de input e pré-visualização animada do cartão
- **Arquitetura PCI-DSS e LGPD** — Validação local de dados sensíveis e arquitetura preparada para integração com gateways reais (Stripe, Mercado Pago)

###  Catálogo de Vinhos
- **25 Vinhos Reais** — Base de dados curada com rótulos renomados como *Catena Zapata, Pêra-Manca, Veuve Clicquot, Whispering Angel, Brunello di Montalcino* e muitos outros
- **Páginas Detalhadas** — Notas de degustação, perfil de sabor, sugestões de harmonização, avaliações da comunidade e preços reais em R$
- **Busca Inteligente e Filtros** — Filtre por tipo de vinho (Tinto, Branco, Rosé, Espumante) com pesquisa por nome, produtor e variedade de uva

###  UI Premium Mobile-First
- **Estética Escura de Vinhos** — Paleta de cores HSL profundas e saturadas com glassmorphism e texturas sutis de grão
- **Interface de Escaneamento** — Viewfinder estilo câmera com linha de scan animada para reconhecimento de rótulos
- **Micro-Animações** — Transições suaves, efeitos de hover e feedback interativo em todos os pontos de contato
- **Navegação por Abas (Tab Bar)** — Navegação inferior com visual nativo e botão central de scan destacado

###  Gamificação e Adega Pessoal
- **Adega Pessoal** — Salve vinhos na sua coleção com sincronização em tempo real via Firestore
- **Estatísticas Dinâmicas** — Tipo de vinho favorito, região principal e nota média calculados automaticamente
- **Conquistas e Badges** — Desbloqueie badges como *Explorador*, *Sommelier*, *Crítico* e *Colecionador* com base no tamanho da sua adega
- **Botão de Seed do Firestore** — Populate o banco de dados com todos os 25 vinhos com um único clique no painel de administração

---

##  Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev) |
| **Roteamento** | [TanStack Router](https://tanstack.com/router) (baseado em arquivos) |
| **Gerenciamento de Estado** | [TanStack Query](https://tanstack.com/query) + React Context |
| **Estilização** | [Tailwind CSS 4](https://tailwindcss.com) + [Radix UI](https://radix-ui.com) |
| **Autenticação e Banco** | [Firebase Auth](https://firebase.google.com/products/auth) + [Cloud Firestore](https://firebase.google.com/products/firestore) |
| **Ferramenta de Build** | [Vite 8](https://vitejs.dev) + [Nitro](https://nitro.unjs.io) |
| **Linguagem** | [TypeScript 5.8](https://typescriptlang.org) |
| **Deploy** | Cloudflare Workers (via Nitro) |

---

##  Como Começar

### Pré-requisitos
- **Node.js** ≥ 20 (≥ 22 recomendado)
- **npm** ≥ 10

### 1. Clone o Repositório
```bash
git clone https://github.com/GUILHERMEKARNOPP/vitis.git
cd vitis
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Firebase
Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como modelo):

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

> **Observação:** O app possui fallbacks inteligentes e compilará e rodará mesmo sem credenciais reais do Firebase. O carrinho de compras faz fallback automático para `localStorage`.

### 4. Inicie o Servidor de Desenvolvimento
```bash
npm run dev
```

### 5. Popule o Banco de Dados (Opcional)
Com o app rodando e estando logado:
1. Navegue até a aba **Perfil**
2. Role até a seção **Administração**
3. Clique em **"Popular Banco Firestore (25 Vinhos)"**

---

##  Estrutura do Projeto

```
src/
├── assets/              # Imagens estáticas (fotos de vinhos, fundos de regiões)
├── components/
│   ├── AppShell.tsx      # Layout principal com TabBar
│   ├── TabBar.tsx        # Componente de navegação inferior
│   └── ui/              # Primitivos Radix UI + shadcn/ui
├── hooks/
│   ├── useAuth.tsx       # Contexto e provedor de autenticação Firebase
│   └── useCart.tsx       # Contexto do carrinho com sync Firestore
├── lib/
│   ├── firebase.ts       # Inicialização do Firebase SDK (seguro para SSR)
│   ├── wines.ts          # Base de 25 vinhos reais + tipos TypeScript
│   └── utils.ts          # Funções utilitárias
├── routes/
│   ├── __root.tsx        # Layout raiz (provedores de Auth + Cart)
│   ├── index.tsx         # Página de Login / Cadastro
│   ├── home.tsx          # Feed com recomendações e tendências
│   ├── busca.tsx         # Página de busca e filtros
│   ├── scan.tsx          # Interface do scanner de câmera
│   ├── scan.resultado.tsx # Resultado do escaneamento
│   ├── vinho.$id.tsx     # Página de detalhes do vinho
│   ├── adega.tsx         # Coleção pessoal de vinhos
│   ├── carrinho.tsx      # Carrinho de compras
│   ├── checkout.tsx      # Checkout seguro (Pix + Cartão de Crédito)
│   └── perfil.tsx        # Perfil do usuário e conquistas
├── router.tsx            # Configuração do TanStack Router
├── server.ts             # Wrapper de tratamento de erros SSR
├── start.ts              # Middleware do TanStack Start
└── styles.css            # Estilos globais e design tokens
```

---

##  Regras de Segurança do Firestore

O app inclui regras de segurança prontas para produção em [`firestore.rules`](firestore.rules):

- **Leitura pública** na coleção `wines` (navegação do catálogo)
- **Escrita protegida** nos vinhos (somente admin via Console do Firebase)
- **Isolamento por usuário** nos dados de `cart`, `cellar` e `profile`
- **Criação de pedidos** restrita a usuários autenticados com validação de UID

---

##  Rotas Disponíveis

| Rota | Descrição |
|---|---|
| `/` | Login / Cadastro (E-mail, Google, Apple, Facebook, Convidado) |
| `/home` | Feed com recomendações e vinhos em alta |
| `/busca` | Buscar vinhos por nome, produtor ou uva |
| `/scan` | Interface de scanner estilo câmera |
| `/scan/resultado` | Resultado do scan com correspondência do vinho |
| `/vinho/:id` | Página detalhada do vinho com botão de carrinho e salvar na adega |
| `/adega` | Adega pessoal com estatísticas dinâmicas |
| `/carrinho` | Carrinho de compras com controles de quantidade |
| `/checkout` | Checkout seguro (QR Code Pix + Cartão de Crédito) |
| `/perfil` | Perfil do usuário, conquistas e administração do banco |

---

##  Scripts Disponíveis

```bash
npm run dev       # Iniciar servidor de desenvolvimento
npm run build     # Build de produção (client + SSR + Nitro)
npm run preview   # Pré-visualizar build de produção localmente
npm run lint      # Executar ESLint
npm run format    # Executar Prettier
```

---

##  Contribuindo

1. Faça um fork do repositório
2. Crie sua branch de feature (`git checkout -b feature/funcionalidade-incrivel`)
3. Faça commit das mudanças (`git commit -m 'feat: adiciona funcionalidade incrível'`)
4. Faça push para a branch (`git push origin feature/funcionalidade-incrivel`)
5. Abra um Pull Request

---

##  Licença

Este projeto é open source e está disponível sob a [Licença MIT](LICENSE).

---

<div align="center">

**Construído com vontade e vinho muito vinho kkkk por [Guilherme Karnopp](https://github.com/GUILHERMEKARNOPP)**

</div>
