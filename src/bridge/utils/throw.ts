
export default function errorMessage(message: string): never {
    throw new Error(message);
}