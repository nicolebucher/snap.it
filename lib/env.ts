export function getOptionalEnv(name: string): string | undefined {
  return process.env[name];
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Fehlende Umgebungsvariable "${name}". Bitte in .env.local setzen (siehe .env.local.example).`
    );
  }
  return value;
}

export function isMockMode(): boolean {
  return process.env.AI_MOCK === "true";
}
