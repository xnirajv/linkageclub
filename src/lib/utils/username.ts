export function generateUsername(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Remove multiple hyphens
    .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
}

export async function getUniqueUsername(baseName: string, UserModel: any): Promise<string> {
  let username = generateUsername(baseName);
  let exists = await UserModel.exists({ username });
  let counter = 1;

  // Agar 'madara-uchiha' already exists, to 'madara-uchiha-1' try karo
  while (exists) {
    username = `${generateUsername(baseName)}-${counter}`;
    exists = await UserModel.exists({ username });
    counter++;
  }

  return username;
}