export type LinkItem = {
  title: string;
  url: string;
  description: string;
};

export type ModuleId = "videos" | "audios" | "musicas" | "links";

export type Module = {
  id: ModuleId;
  label: string;
  description: string;
  links: LinkItem[];
};

export const modules: Module[] = [
  {
    id: "videos",
    label: "Vídeos",
    description: "Bancos de vídeo, templates e projetos prontos para edição",
    links: [
      {
        title: "Pexels",
        url: "https://www.pexels.com/",
        description: "Vídeos e fotos gratuitas em alta qualidade",
      },
      {
        title: "Mixkit",
        url: "https://mixkit.co/",
        description: "Vídeos, clipes e templates gratuitos",
      },
      {
        title: "Motion Array",
        url: "https://motionarray.com/",
        description: "Templates e projetos prontos para After Effects",
      },
      {
        title: "Videohive (Envato)",
        url: "https://videohive.net/",
        description: "Marketplace com milhares de templates de motion graphics",
      },
      {
        title: "Rocketstock",
        url: "https://www.rocketstock.com/",
        description: "Templates e presets gratuitos e pagos para After Effects",
      },
      {
        title: "Video Copilot",
        url: "https://www.videocopilot.net/",
        description: "Tutoriais avançados de efeitos visuais e composição",
      },
    ],
  },
  {
    id: "audios",
    label: "Áudios",
    description: "Efeitos sonoros e bibliotecas de áudio para seus projetos",
    links: [
      {
        title: "Freesound",
        url: "https://freesound.org/",
        description: "Efeitos sonoros gratuitos para edição",
      },
      {
        title: "Motion Bro",
        url: "https://motionbro.com/",
        description: "Pacotes de transições e efeitos sonoros para After Effects",
      },
      {
        title: "Zapsplat",
        url: "https://www.zapsplat.com/",
        description: "Biblioteca extensa de efeitos sonoros e músicas",
      },
    ],
  },
  {
    id: "musicas",
    label: "Músicas",
    description: "Trilhas sonoras livres de direitos autorais",
    links: [
      {
        title: "Uppbeat",
        url: "https://uppbeat.io/",
        description: "Músicas gratuitas com licença para criadores",
      },
      {
        title: "YouTube Audio Library",
        url: "https://www.youtube.com/audiolibrary",
        description: "Biblioteca oficial de músicas e efeitos sonoros do YouTube",
      },
      {
        title: "Pixabay Music",
        url: "https://pixabay.com/music/",
        description: "Músicas livres de direitos para qualquer projeto",
      },
    ],
  },
  {
    id: "links",
    label: "Links",
    description: "Plugins, scripts, comunidades e ferramentas complementares",
    links: [
      {
        title: "Aescripts + Aeplugins",
        url: "https://aescripts.com/",
        description: "Maior marketplace de plugins e scripts para After Effects",
      },
      {
        title: "Render Garden",
        url: "https://www.renderoutgarden.com/",
        description: "Plugin para acelerar renderizações no After Effects",
      },
      {
        title: "School of Motion",
        url: "https://www.schoolofmotion.com/",
        description: "Cursos e artigos sobre motion design e After Effects",
      },
      {
        title: "r/AfterEffects",
        url: "https://www.reddit.com/r/AfterEffects/",
        description: "Comunidade ativa para tirar dúvidas e compartilhar projetos",
      },
      {
        title: "Adobe Fonts",
        url: "https://fonts.adobe.com/",
        description: "Biblioteca de fontes integrada com o Creative Cloud",
      },
      {
        title: "Coolors",
        url: "https://coolors.co/",
        description: "Gerador de paletas de cores para projetos visuais",
      },
    ],
  },
];
