export async function readJsonFile(filename: string): Promise<any> {
    const response = await fetch(filename);
    return response.json();
}