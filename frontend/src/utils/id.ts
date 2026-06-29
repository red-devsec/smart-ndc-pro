/**
 * Génère un identifiant unique compatible navigateur.
 * crypto.randomUUID() n'est pas disponible en HTTP ni sur certains navigateurs.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback compatible partout
  return (
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 6)
  );
}
