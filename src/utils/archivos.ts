export const archivoADataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
    lector.readAsDataURL(file);
  });