# ==========================================
# Étape 1 : Installation des dépendances
# ==========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copie des fichiers de définition des dépendances
COPY package.json package-lock.json* ./

# Installation propre des dépendances
RUN npm ci

# ==========================================
# Étape 2 : Construction de l'application
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Récupération des node_modules de l'étape précédente
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement Next.js au moment du build (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Compilation Next.js en mode production
RUN npm run build

# ==========================================
# Étape 3 : Image d'exécution minimale
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Utilisateur non-root pour des raisons de sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie des fichiers publics
COPY --from=builder /app/public ./public

# Dossier de cache Next.js avec les bons droits
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copie des bundles autonomes (standalone) et des assets statiques
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
