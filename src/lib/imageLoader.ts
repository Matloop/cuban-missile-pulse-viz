// Esta função usa uma funcionalidade do Vite para encontrar dinamicamente
// o caminho correto para uma imagem na pasta 'assets'.
export const getFigureImageUrl = (filename: string) => {
    // O caminho '../assets/' é relativo a ESTE arquivo (imageLoader.ts)
    return new URL(`../assets/${filename}`, import.meta.url).href;
  };
  
  export const getLockedImageUrl = () => {
    return new URL(`../assets/locked_placeholder.png`, import.meta.url).href;
  }