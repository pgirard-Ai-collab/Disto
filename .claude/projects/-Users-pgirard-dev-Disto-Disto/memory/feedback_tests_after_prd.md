---
name: feedback-tests-after-prd
description: Toujours écrire et exécuter des tests unitaires après chaque implémentation de PRD
metadata:
  type: feedback
---

Toujours ajouter des tests unitaires Vitest après avoir implémenté les user stories d'un PRD, et exécuter `npm test` avant de marquer l'implémentation comme terminée.

**Why:** L'utilisateur a explicitement demandé que les tests unitaires soient écrits et exécutés après chaque implémentation de PRD.

**How to apply:** Pour chaque server action ou logique métier créée lors d'un PRD, créer les tests correspondants dans `__tests__/` (ex: `__tests__/actions/`). Exécuter `npm test` et vérifier que tous les tests passent avant de reporter la tâche comme complète.
