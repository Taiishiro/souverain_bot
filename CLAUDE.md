# Le Bot Souverain — contexte projet

RPG Discord (économie, dragons, royaumes, alliances, prisons, guerres).
TypeScript + discord.js + Prisma + PostgreSQL. 33 slash commands.

L'application, c'est **`src/` + `prisma/`**. Rien d'autre.

## Structure

```
events/interactionHandler → commands/*.ts → features/<domaine>/ → Prisma → PostgreSQL
                                            cronjobs/ (faim, revenus, expirations)
```

`features/` = la règle du jeu, par domaine : `combat`, `economy`, `dragons`,
`royaumes`, `diplomatie`.

## Gotchas

- **~130 scripts jetables traînent à la racine du disque** (`fix_*.js`,
  `patch_*.js`, `test_*.js`, `rewrite_*`, `*.patch`…). Ils sont **gitignorés**,
  pas supprimés. Aucun n'est référencé par `package.json` ni importé par `src/`.
  Ne pas s'en inspirer, ne pas les remettre dans le dépôt.
- **Des résidus de patch** (`*.orig`, `*.rej`, `*.bak`) traînent dans `src/` —
  gitignorés eux aussi. Attention à ne pas éditer un `.orig` par erreur.
- **`.env` contient le token Discord.** Qui l'a, contrôle le bot. Gitignoré.
- **Le seed officiel, c'est `npm run db:seed`** (`prisma/seed.ts`). Le
  `seed_shop.ts` de la racine est un doublon périmé, gitignoré.
- **Les cooldowns vont en base** (`CooldownPersistent`), jamais en mémoire :
  sinon un joueur les remet à zéro en attendant que le bot redémarre.
- **Puppeteer tourne à côté du bot** pour `/profil` et `/argentimg`
  (`src/utils/renderProfileImage.ts`) — un navigateur headless, avec ce que ça
  coûte en RAM.
- **La prison réécrit les vraies `permissionOverwrites` Discord**, ce n'est pas
  un booléen. Toute modification de `/emprisonner` ou `/liberer` doit rester
  symétrique, sinon un joueur reste enfermé.
- **Attaquer engage les dragons** : il faut un dragon vivant à ≥50 d'énergie de
  combat ; les dragons de l'alliance du défenseur défendent ; un siège donne
  +20 % au défenseur.

## Vérifier

```bash
npx tsc --skipLibCheck --noEmit    # passe sans erreur — le garder ainsi
```

## À faire

- **Aucun test automatisé.** C'est la principale dette du projet.
- L'équilibrage (prix, dégâts, cooldowns) est taillé pour un serveur précis.
