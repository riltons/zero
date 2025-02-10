# Zero Project

Um projeto React moderno com Tailwind CSS, pronto para deploy na Vercel.

## Tecnologias

- React
- Vite
- Tailwind CSS
- TypeScript

## Desenvolvimento

1. Clone o repositório:
```bash
git clone https://github.com/riltons/zero.git
cd zero
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Deploy

Este projeto está configurado para deploy automático na Vercel. Cada push na branch `main` resultará em um novo deploy.

### Deploy Manual

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login na sua conta Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Visualiza a build localmente
